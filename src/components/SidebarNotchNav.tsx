"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useSoundEngine } from "./portfolio/nav";

export interface NavCategory {
  id: string;
  label: string;
}

interface SidebarNotchNavProps {
  categories: NavCategory[];
  activeIndex: number;
  onSelectCategory: (index: number) => void;
}

/* ------------------------------------------------------------------
   NOTCH GEOMETRY — a circular "bite" with tangent S-curve fillets,
   clipped out of the white glass surface so the raw page background
   shows through (a notch of the background sitting on the white
   navbar, exactly like the reference image).

   Construction (y-down, rail right edge at x = W):
   • Bite circle  — center (W, cy), radius R
   • Fillet circle — radius m, tangent to the right edge at
     (W, cy ∓ k) and tangent to the bite circle, where
     k = √(R² + 2Rm). This yields a fully tangent-continuous
     wave-shaped cutout — no sharp corners anywhere.
   ------------------------------------------------------------------ */

interface NotchGeometry {
  R: number; // bite radius
  m: number; // fillet radius
  k: number; // edge tangency offset from the item center
}

function notchGeometryFor(w: number): NotchGeometry {
  const R = Math.min(28, Math.max(17, w * 0.36));
  const m = Math.min(12, Math.max(7.5, w * 0.15));
  return { R, m, k: Math.sqrt(R * R + 2 * R * m) };
}

/**
 * Border-box clip path: the full rail rectangle minus the notch.
 * Always emits the same command structure (M H V A A A V H Z) so
 * per-frame path rebuilds stay cheap and geometry-stable.
 */
function buildNotchPath(w: number, h: number, cy: number, g: NotchGeometry): string {
  const { R, m, k } = g;
  const top = cy - k;
  const bottom = cy + k;
  const jx = w - (R * m) / (R + m); // fillet ↔ bite join, x
  const jy = (R * k) / (R + m); // fillet ↔ bite join, |y offset|
  const f = (n: number) => Number(n.toFixed(2)).toString();
  return [
    "M0 0",
    `H${f(w)}`,
    `V${f(top)}`,
    `A${f(m)} ${f(m)} 0 0 1 ${f(jx)} ${f(cy - jy)}`,
    `A${f(R)} ${f(R)} 0 0 0 ${f(jx)} ${f(cy + jy)}`,
    `A${f(m)} ${f(m)} 0 0 1 ${f(w)} ${f(bottom)}`,
    `V${f(h)}`,
    "H0",
    "Z",
  ].join(" ");
}

/**
 * SidebarNotchNav — full-height WHITE frosted-glass navbar.
 *
 * • White glass shell (blur + saturate) with rounded right corners and
 *   a warm directional depth shadow cast onto the content.
 * • Background notch: the surface is clipped with a tangent-continuous
 *   S-curve bite whose center glides to the active section on a spring.
 *   The path is rebuilt EVERY FRAME and written straight to the DOM —
 *   no dependence on CSS `path()` interpolation, so the glide is
 *   butter-smooth and retargets instantly in every browser.
 * • Instant response: tapping a destination pins the notch target
 *   immediately (no waiting for the scroll-spy to catch up mid-scroll);
 *   the pin releases once the spy confirms, or after a short timeout.
 * • Vertical category labels (bottom-to-top) — warm ink, brand-red
 *   when active. Measured via layout effects + ResizeObserver +
 *   font-ready. Actions: sound toggle. Visible on mobile (54px)
 *   through desktop (74px).
 */
export function SidebarNotchNav({
  categories,
  activeIndex,
  onSelectCategory,
}: SidebarNotchNavProps) {
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [targetCy, setTargetCy] = useState<number | null>(null);
  const [measureTick, setMeasureTick] = useState(0);
  const [pinned, setPinned] = useState<number | null>(null);

  const asideRef = useRef<HTMLElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const sideItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const initializedRef = useRef(false);

  const cy = useMotionValue(0);
  const { soundOn, toggle } = useSoundEngine();
  const reduceMotion = useReducedMotion();

  /* Gold scroll-progress seam along the top edge — the always-visible
     twin of the desktop right rail's vertical seam (the rail is hidden
     below md, so this is the only progress indicator on phones).
     Transform-only (scaleX) — zero layout work while scrolling. */
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.4,
  });

  /* Optimistic activation — the notch answers the tap immediately.
     The pin self-expires: while `pinned` differs from the scroll-spy's
     verdict it wins; the moment the spy confirms (or after the timeout)
     it defers back to `activeIndex`. */
  const effectiveIndex =
    pinned !== null && pinned !== activeIndex ? pinned : activeIndex;

  const handleSelect = useCallback(
    (index: number) => {
      setPinned(index);
      onSelectCategory(index);
    },
    [onSelectCategory]
  );

  useEffect(() => {
    if (pinned === null) return;
    const t = setTimeout(() => setPinned(null), 1800);
    return () => clearTimeout(t);
  }, [pinned]);

  /* Measure the rail box; tick bumps force target recompute when
     label metrics change (fonts load, container resize) */
  const measure = useCallback(() => {
    const asideEl = asideRef.current;
    if (!asideEl) return;
    const asideRect = asideEl.getBoundingClientRect();
    if (asideRect.width === 0 || asideRect.height === 0) return;
    setDims((prev) => {
      if (
        prev &&
        Math.abs(prev.w - asideRect.width) < 0.5 &&
        Math.abs(prev.h - asideRect.height) < 0.5
      ) {
        return prev;
      }
      return { w: asideRect.width, h: asideRect.height };
    });
    setMeasureTick((t) => (t + 1) % 1_000_000);
  }, []);

  /* Center of the effective item, clamped inside the rounded corners */
  useLayoutEffect(() => {
    if (!dims) return;
    const activeEl = sideItemRefs.current[effectiveIndex];
    const asideEl = asideRef.current;
    if (!activeEl || !asideEl) return;
    const asideRect = asideEl.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();
    if (itemRect.height === 0 || asideRect.height === 0) return;
    const g = notchGeometryFor(dims.w);
    const raw = itemRect.top - asideRect.top + itemRect.height / 2;
    const next = Math.max(g.k + 18, Math.min(raw, asideRect.height - g.k - 18));
    setTargetCy((prev) => (prev !== null && Math.abs(prev - next) < 0.5 ? prev : next));
  }, [dims, effectiveIndex, measureTick, categories.length]);

  /* Paint one frame: rebuild the clip path + move the target dot */
  const paint = useCallback(() => {
    const d = dims;
    const surface = surfaceRef.current;
    if (!d || !surface) return;
    const g = notchGeometryFor(d.w);
    const v = cy.get();
    surface.style.clipPath = `path("${buildNotchPath(d.w, d.h, v, g)}")`;
    const dot = dotRef.current;
    if (dot) {
      dot.style.top = `${v}px`;
      dot.style.opacity = "1";
    }
  }, [cy, dims]);

  useMotionValueEvent(cy, "change", paint);
  useEffect(() => {
    paint();
  }, [paint]);

  /* Glide to the target on a spring — retargets from the current
     position mid-flight, so rapid taps never jump or stutter */
  useLayoutEffect(() => {
    if (targetCy === null || !dims) return;
    if (!initializedRef.current || reduceMotion) {
      initializedRef.current = true;
      cy.jump(targetCy);
      paint();
      return;
    }
    const controls = animate(cy, targetCy, {
      type: "spring",
      stiffness: 330,
      damping: 34,
      mass: 0.9,
    });
    return () => controls.stop();
  }, [targetCy, dims, cy, reduceMotion, paint]);

  /* Keep measurements honest across resizes / webfont settling */
  useEffect(() => {
    const asideEl = asideRef.current;
    if (!asideEl) return;

    const ro = new ResizeObserver(measure);
    ro.observe(asideEl);
    if (navContainerRef.current) ro.observe(navContainerRef.current);
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure).catch(() => {});

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return (
    <motion.aside
      id="portfolio-sidebar"
      ref={asideRef}
      initial={reduceMotion ? false : { x: -28, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className="fixed inset-y-0 left-0 z-30 flex w-[54px] shrink-0 select-none flex-col items-center py-4 sm:w-[62px] md:w-[74px]"
    >
      {/* Depth shadow twin — kept unclipped so the cast shadow survives the notch */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-r-[16px] shadow-[22px_0_54px_-30px_rgba(84,12,0,0.55)] sm:rounded-r-[18px] md:rounded-r-[22px]"
      />

      {/* White glass surface — the background bites in through the notch clip.
          clipPath is painted imperatively every animation frame. */}
      <div
        ref={surfaceRef}
        aria-hidden="true"
        className="glass-rail-white pointer-events-none absolute inset-0 rounded-r-[16px] sm:rounded-r-[18px] md:rounded-r-[22px]"
        style={{ borderRight: "1px solid rgba(255, 255, 255, 0.72)" }}
      />

      {/* Target dot — floats dead-center inside the background notch:
          vertically cy (translateY -50%) and horizontally the midpoint
          of the visible half-disc (W - R/2 → right = R/2 - half dot). */}
      <span
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none absolute z-[2] h-[7px] w-[7px] rounded-full bg-white shadow-[0_1px_6px_rgba(122,32,0,0.5)]"
        style={{
          right: dims ? Math.max(5, notchGeometryFor(dims.w).R / 2 - 3.5) : 9,
          top: 0,
          opacity: 0,
          transform: "translateY(-50%)",
        }}
      />

      {/* Scroll progress seam — along the top edge (notch bites always
          start ≥18px below the top, so this line never crosses one) */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="absolute inset-x-0 top-0 z-[3] h-[2px] origin-left bg-gradient-to-r from-[#ffe3ae] via-[#ffb45e] to-[#ff7a1c]"
      />

      {/* Top hairline ornament */}
      <span aria-hidden="true" className="relative z-[2] mb-1 h-px w-7 shrink-0 bg-[#53301f]/15" />

      {/* Vertical navigation labels */}
      <div
        ref={navContainerRef}
        className="relative z-[2] flex w-full flex-1 flex-col items-stretch justify-around overflow-visible py-2"
      >
        {categories.map((cat, idx) => {
          const isActive = idx === effectiveIndex;
          return (
            <button
              key={cat.id}
              id={`side-nav-${cat.id}`}
              type="button"
              ref={(el) => {
                sideItemRefs.current[idx] = el;
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(idx);
              }}
              aria-current={idx === activeIndex ? "page" : undefined}
              title={cat.label}
              className="group relative z-[2] flex w-full cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent px-0 py-2.5 outline-none focus-visible:ring-1 focus-visible:ring-[#7c1a06]/35"
            >
              {/* Vertical Text Label — Tailwind v4 translate/scale compose
                  with the standalone `rotate` property (no transform clash) */}
              <span
                className={`pointer-events-none relative whitespace-nowrap text-[9.5px] font-bold uppercase transition-all duration-300 ease-out tracking-[1.4px] sm:text-[10.5px] sm:tracking-[1.6px] md:text-[11px] ${
                  isActive
                    ? "-translate-x-[5px] scale-105 text-[#7c1a06] sm:-translate-x-[7px]"
                    : "translate-x-0 text-[#53301f]/55 group-hover:text-[#53301f]"
                }`}
                style={{ writingMode: "vertical-rl", rotate: "180deg" }}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Action Controls */}
      <div className="relative z-[2] mt-auto flex shrink-0 flex-col items-center gap-2 pt-2">
        <button
          id="sound-toggle-btn"
          type="button"
          aria-label={soundOn ? "Mute sounds" : "Unmute sounds"}
          aria-pressed={soundOn}
          onClick={toggle}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#53301f]/10 bg-white/70 text-[#53301f]/75 shadow-[0_2px_8px_-2px_rgba(84,12,0,0.18)] backdrop-blur-sm transition-all duration-300 hover:border-[#7c1a06]/25 hover:bg-white hover:text-[#7c1a06] active:scale-90"
        >
          {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
      </div>
    </motion.aside>
  );
}

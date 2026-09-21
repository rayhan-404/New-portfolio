"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Mail, Volume2, VolumeX } from "lucide-react";
import { useSoundEngine } from "./portfolio/nav";

export interface NavCategory {
  id: string;
  label: string;
}

interface SidebarNotchNavProps {
  categories: NavCategory[];
  activeIndex: number;
  onSelectCategory: (index: number) => void;
  savedCount?: number;
  onOpenContact?: () => void;
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
  const R = Math.min(24, Math.max(15, w * 0.31));
  const m = Math.min(10, Math.max(6.5, w * 0.125));
  return { R, m, k: Math.sqrt(R * R + 2 * R * m) };
}

/**
 * Border-box clip path: the full rail rectangle minus the notch.
 * Always emits the same command structure (M H V A A A V H Z) so
 * browsers can smoothly interpolate between positions.
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
 *   S-curve bite that glides to the active section — the fiery page
 *   gradient shows through the cutout with a small white target dot,
 *   so it reads as the background biting into the white bar.
 * • Vertical category labels (bottom-to-top) — warm ink, brand-red
 *   when active. Position measured via layout effects +
 *   ResizeObserver + font-ready, animated with a 0.45s ease.
 * • Actions: brand tile (back to top), sound toggle, quick-contact.
 *   Visible on mobile (54px) through desktop (74px).
 */
export function SidebarNotchNav({
  categories,
  activeIndex,
  onSelectCategory,
  savedCount = 0,
  onOpenContact,
}: SidebarNotchNavProps) {
  const [notch, setNotch] = useState<{ w: number; h: number; cy: number } | null>(null);
  const asideRef = useRef<HTMLAsideElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const sideItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { soundOn, toggle } = useSoundEngine();
  const reduceMotion = useReducedMotion();

  /* Measure the active item's center relative to the rail box */
  const updateNotchPosition = useCallback(() => {
    const asideEl = asideRef.current;
    const activeEl = sideItemRefs.current[activeIndex];
    if (!asideEl || !activeEl) return;

    const asideRect = asideEl.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();
    if (asideRect.width === 0 || asideRect.height === 0) return;

    const g = notchGeometryFor(asideRect.width);
    const raw = itemRect.top - asideRect.top + itemRect.height / 2;
    // Keep the notch strictly inside the rail's rounded corners
    const cy = Math.max(g.k + 18, Math.min(raw, asideRect.height - g.k - 18));

    setNotch((prev) => {
      if (
        prev &&
        Math.abs(prev.w - asideRect.width) < 0.5 &&
        Math.abs(prev.h - asideRect.height) < 0.5 &&
        Math.abs(prev.cy - cy) < 0.5
      ) {
        return prev;
      }
      return { w: asideRect.width, h: asideRect.height, cy };
    });
  }, [activeIndex]);

  /* Sync measure before paint — no first-frame flash */
  useLayoutEffect(() => {
    updateNotchPosition();
  }, [updateNotchPosition, categories.length]);

  useEffect(() => {
    const asideEl = asideRef.current;
    if (!asideEl) return;

    const ro = new ResizeObserver(updateNotchPosition);
    ro.observe(asideEl);
    if (navContainerRef.current) ro.observe(navContainerRef.current);
    window.addEventListener("resize", updateNotchPosition);
    // Vertical label heights settle once webfonts load
    document.fonts?.ready.then(updateNotchPosition).catch(() => {});

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateNotchPosition);
    };
  }, [updateNotchPosition]);

  const geometry = notch ? notchGeometryFor(notch.w) : null;
  const notchPath = notch && geometry ? buildNotchPath(notch.w, notch.h, notch.cy, geometry) : null;
  const EASE = "cubic-bezier(0.25, 1, 0.5, 1)";
  const slide = reduceMotion ? "none" : `0.45s ${EASE}`;

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

      {/* White glass surface — the background bites in through the notch clip */}
      <div
        aria-hidden="true"
        className="glass-rail-white pointer-events-none absolute inset-0 rounded-r-[16px] sm:rounded-r-[18px] md:rounded-r-[22px]"
        style={{
          borderRight: "1px solid rgba(255, 255, 255, 0.72)",
          clipPath: notchPath ? `path("${notchPath}")` : undefined,
          transition: `clip-path ${slide}`,
          willChange: "clip-path",
        }}
      />

      {/* Target dot — floats inside the background notch */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute z-[2] h-[7px] w-[7px] rounded-full bg-white shadow-[0_1px_6px_rgba(122,32,0,0.5)]"
        style={{
          right: geometry ? Math.max(6, geometry.R / 2 - 3.5) : 8,
          top: notch ? notch.cy : "50%",
          opacity: notch ? 1 : 0,
          transform: "translateY(-50%)",
          transition: `top ${slide}, opacity 0.3s ease`,
        }}
      />

      {/* Brand tile → back to top */}
      <button
        id="sidebar-brand-btn"
        type="button"
        onClick={() => onSelectCategory(0)}
        title="Scroll to Top / Home"
        aria-label="Blue Nile — back to top"
        className="relative z-[2] mb-3 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[14px] bg-gradient-to-br from-[#8f1d0c] via-[#a62a08] to-[#c2410c] text-[13px] font-black tracking-tight text-[#fff7ee] shadow-[0_10px_22px_-10px_rgba(124,26,6,0.65)] outline-none transition-transform duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#7c1a06]/40 active:scale-95"
      >
        BN
      </button>

      <span aria-hidden="true" className="relative z-[2] mb-1 h-px w-7 shrink-0 bg-[#53301f]/15" />

      {/* Vertical navigation labels */}
      <div
        ref={navContainerRef}
        className="relative z-[2] flex w-full flex-1 flex-col items-stretch justify-around overflow-visible py-2"
      >
        {categories.map((cat, idx) => {
          const isActive = idx === activeIndex;
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
                onSelectCategory(idx);
              }}
              aria-current={isActive ? "page" : undefined}
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

        {onOpenContact && (
          <button
            id="quick-contact-btn"
            type="button"
            aria-label="Contact"
            onClick={onOpenContact}
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gradient-to-b from-[#ffb45e] to-[#f45118] text-white shadow-[0_8px_18px_-8px_rgba(244,81,24,0.65)] transition-all duration-300 hover:brightness-105 active:scale-90"
          >
            <Mail className="h-4 w-4" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 animate-bounce items-center justify-center rounded-full bg-[#ff453a] text-[8.5px] font-extrabold text-white shadow-md">
                {savedCount}
              </span>
            )}
          </button>
        )}
      </div>
    </motion.aside>
  );
}

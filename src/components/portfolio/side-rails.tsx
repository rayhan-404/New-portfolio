"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import {
  Dribbble,
  Github,
  Linkedin,
  Mail,
  MessageCircle,
  Twitter,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "lucide-react";
import { socials } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";
import { NAV_ITEMS, scrollToSection, useSoundEngine, type NavId } from "./nav";

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring", stiffness: 120, damping: 20 } as const;

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  GitHub: Github,
  LinkedIn: Linkedin,
  "X / Twitter": Twitter,
  Dribbble: Dribbble,
};

/**
 * Micro glass tooltip that floats beside a rail button.
 * Pure CSS (group-hover / group-focus-visible) — no portals.
 */
function RailTip({ label, side }: { label: string; side: "left" | "right" }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute top-1/2 z-50 -translate-y-1/2 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 ${
        side === "right"
          ? "left-full ml-3 -translate-x-2"
          : "right-full mr-3 translate-x-2"
      }`}
    >
      <span className="glass-strong block whitespace-nowrap rounded-full border-white/30 px-3 py-1.5 text-[11px] font-semibold text-foreground">
        {label}
      </span>
    </span>
  );
}

function RailDivider() {
  return (
    <span
      aria-hidden="true"
      className="h-px w-8 bg-gradient-to-r from-transparent via-white/25 to-transparent"
    />
  );
}

/**
 * LEFT RAIL — full-height (100svh) sidebar, built to the user's reference:
 * grid-dots launcher on top → vertically rotated uppercase text menu with a
 * signature white curve + glowing dot that springs to the active section →
 * sound toggle and a badge-carrying messages button at the bottom.
 */
export function SideRailLeft({
  active,
  onOpenMenu,
}: {
  active: NavId;
  onOpenMenu: () => void;
}) {
  const reduce = useReducedMotion();
  const { mounted, soundOn, toggle } = useSoundEngine();

  /* Measure each nav item's vertical center so the curve can find it */
  const navAreaRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Partial<Record<NavId, HTMLButtonElement | null>>>({});
  const [targets, setTargets] = useState<Partial<Record<NavId, number>>>({});

  const measure = useCallback(() => {
    const area = navAreaRef.current;
    if (!area) return;
    const base = area.getBoundingClientRect();
    const next: Partial<Record<NavId, number>> = {};
    (Object.keys(itemRefs.current) as NavId[]).forEach((id) => {
      const el = itemRefs.current[id];
      if (el) {
        const r = el.getBoundingClientRect();
        next[id] = r.top - base.top + r.height / 2;
      }
    });
    setTargets((prev) => ({ ...prev, ...next }));
  }, []);

  useLayoutEffect(() => {
    // First paint + any layout shift (rAF/observer callbacks keep this async)
    const raf = requestAnimationFrame(measure);
    const area = navAreaRef.current;
    const ro = new ResizeObserver(() => measure());
    if (area) ro.observe(area);
    // Letter-spacing shifts metrics once fonts finish loading — re-measure
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => measure()).catch(() => {});
    }
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [measure]);

  const activeY = targets[active] ?? 64;
  /* Signature reference curve: comet tail from the top-right flowing into a
     ~300° orbit ring around a glowing dot parked beside the active label. */
  const R = 15;
  const CX = 48;
  const pt = (deg: number) => {
    const t = (deg * Math.PI) / 180;
    return `${(CX + R * Math.cos(t)).toFixed(1)} ${(activeY + R * Math.sin(t)).toFixed(1)}`;
  };
  const curveD = [
    "M 56 0",
    `C 58 ${(activeY * 0.4).toFixed(1)}, 52 ${(activeY - R - 11).toFixed(1)}, ${pt(-70)}`,
    `A ${R} ${R} 0 0 1 ${pt(90)}`,
    `A ${R} ${R} 0 0 1 ${pt(205)}`,
  ].join(" ");

  return (
    <motion.nav
      aria-label="Primary navigation"
      initial={reduce ? false : { x: -84, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
      className="glass-rail-l fixed inset-y-0 left-0 z-40 hidden w-[76px] flex-col items-center md:flex"
    >
      {/* App launcher — 3×3 grid dots */}
      <div className="pt-5">
        <button
          onClick={() => {
            playSound("notch");
            onOpenMenu();
          }}
          aria-label="Open full menu"
          aria-haspopup="dialog"
          className="glass-strong group flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 hover:scale-105 active:scale-95"
        >
          <span aria-hidden="true" className="grid grid-cols-3 gap-[3.5px]">
            {Array.from({ length: 9 }).map((_, i) => (
              <span
                key={i}
                className={`h-[3px] w-[3px] rounded-full transition-colors duration-300 ${
                  i % 2 === 0
                    ? "bg-gold group-hover:bg-gold-bright"
                    : "bg-white/35 group-hover:bg-white/60"
                }`}
              />
            ))}
          </span>
        </button>
      </div>

      <div className="my-4">
        <RailDivider />
      </div>

      {/* Vertical text nav + signature active curve */}
      <div
        ref={navAreaRef}
        className="relative min-h-0 w-full flex-1"
      >
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        >
          {/* soft glow underlay */}
          <motion.path
            fill="none"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth={5}
            strokeLinecap="round"
            d={curveD}
            initial={false}
            animate={{ d: curveD }}
            transition={reduce ? { duration: 0 } : SPRING}
          />
          {/* crisp curve */}
          <motion.path
            fill="none"
            stroke="rgba(255,255,255,0.78)"
            strokeWidth={1.25}
            strokeLinecap="round"
            d={curveD}
            initial={false}
            animate={{ d: curveD }}
            transition={reduce ? { duration: 0 } : SPRING}
          />
          {/* glowing orbit dot — parked beside the active label */}
          <motion.circle
            cx={CX}
            r={3.5}
            fill="#ffe9c4"
            style={{ filter: "drop-shadow(0 0 8px rgba(255,196,107,0.95))" }}
            initial={false}
            animate={{ cy: activeY }}
            transition={reduce ? { duration: 0 } : SPRING}
          />
        </svg>

        <ul
          role="list"
          aria-label="Sections"
          className="no-scrollbar relative flex h-full flex-col items-center justify-evenly gap-2 overflow-y-auto py-3"
        >
          {NAV_ITEMS.map((item, i) => {
            const isActive = active === item.id;
            return (
              <motion.li
                key={item.id}
                initial={reduce ? false : { opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.55, ease: EASE }}
              >
                <button
                  ref={(el) => {
                    itemRefs.current[item.id] = el;
                  }}
                  onClick={() => {
                    playSound("tap");
                    scrollToSection(item.id);
                  }}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative flex w-[76px] items-center justify-start pl-[13px] py-1 transition-colors duration-300 ${
                    isActive ? "text-[#fff3dd]" : "text-white/40 hover:text-white/85"
                  }`}
                >
                  <span
                    className={`whitespace-nowrap text-[10.5px] font-bold uppercase tracking-[0.3em] [writing-mode:vertical-rl] ${
                      isActive ? "text-glow" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>

      {/* Bottom utilities */}
      <div className="my-4">
        <RailDivider />
      </div>
      <div className="flex flex-col items-center gap-3 pb-5">
        <button
          onClick={toggle}
          aria-label={soundOn ? "Mute interface sounds" : "Enable interface sounds"}
          className="glass-chip group relative flex h-10 w-10 items-center justify-center rounded-full text-foreground/85 transition-all duration-300 hover:bg-white/20 active:scale-95"
        >
          {mounted &&
            (soundOn ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            ))}
          {mounted && (
            <RailTip label={soundOn ? "Sound on" : "Sound off"} side="right" />
          )}
        </button>

        <button
          onClick={() => {
            playSound("chime");
            scrollToSection("contact");
          }}
          aria-label="2 new messages — go to contact"
          className="glass-chip group relative flex h-10 w-10 items-center justify-center rounded-full text-foreground/85 transition-all duration-300 hover:bg-white/20 active:scale-95"
        >
          <MessageCircle className="h-4 w-4" />
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-gradient-to-b from-[#e0392a] to-[#9c1806] text-[9.5px] font-bold leading-none text-white ring-2 ring-white/25"
          >
            2
          </span>
          <RailTip label="2 new messages" side="right" />
        </button>
      </div>
    </motion.nav>
  );
}

/**
 * RIGHT RAIL — full-height (100svh) liquid-glass utility sidebar.
 * Availability pulse → vertical social links → brand wordmark →
 * "start a project" CTA, plus a scroll-progress seam on the inner edge.
 */
export function SideRailRight() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.4,
  });

  return (
    <motion.aside
      aria-label="Social links and shortcuts"
      initial={reduce ? false : { x: 84, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
      className="glass-rail-r fixed inset-y-0 right-0 z-40 hidden w-[76px] flex-col items-center md:flex"
    >
      {/* Scroll progress seam (inner edge) */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[2px] overflow-hidden bg-white/10"
      >
        <motion.div
          style={{ scaleY: progress }}
          className="h-full w-full origin-top bg-gradient-to-b from-[#ffe3ae] via-[#ffb45e] to-[#ff7a1c]"
        />
      </div>

      {/* Availability pulse */}
      <div className="pt-5">
        <div className="glass-chip group relative flex h-10 w-10 items-center justify-center rounded-full">
          <span className="status-dot" aria-hidden="true" />
          <RailTip label="Available for projects" side="left" />
        </div>
      </div>

      <div className="my-4">
        <RailDivider />
      </div>

      {/* Vertical social links */}
      <ul
        role="list"
        aria-label="Social links"
        className="no-scrollbar flex min-h-0 flex-1 flex-col items-center justify-center gap-2 overflow-y-auto py-2"
      >
        {socials.map((s, i) => {
          const Icon = SOCIAL_ICONS[s.label];
          return (
            <motion.li
              key={s.label}
              initial={reduce ? false : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.06, duration: 0.55, ease: EASE }}
            >
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${s.label} — ${s.handle}`}
                className="group relative flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 transition-all duration-300 hover:bg-white/15 hover:text-foreground active:scale-95"
              >
                <Icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
                <RailTip label={s.label} side="left" />
              </a>
            </motion.li>
          );
        })}
      </ul>

      {/* Bottom: vertical wordmark + CTA */}
      <div className="flex flex-col items-center gap-4 pb-5 pt-2">
        <div className="my-1">
          <RailDivider />
        </div>
        <p
          aria-hidden="true"
          className="hidden max-h-40 overflow-hidden whitespace-nowrap font-tag text-[9px] tracking-[0.32em] text-white/40 [writing-mode:vertical-rl] lg:block"
        >
          Blue Nile
        </p>
        <button
          onClick={() => {
            playSound("chime");
            scrollToSection("contact");
          }}
          aria-label="Start a project — go to contact"
          className="btn-light group relative flex h-10 w-10 items-center justify-center rounded-full"
        >
          <Mail className="h-4 w-4" strokeWidth={2} />
          <RailTip label="Start a project" side="left" />
        </button>
      </div>
    </motion.aside>
  );
}

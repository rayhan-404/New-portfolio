"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Palette, Volume2, VolumeX } from "lucide-react";
import { useSoundEngine } from "./nav";
import { cycleAccent, type AccentHue } from "@/lib/accent-pool";
import { playSound } from "@/lib/sound";
import { person } from "@/lib/portfolio-data";

export interface NavCategory {
  id: string;
  label: string;
}

interface NavRailProps {
  categories: NavCategory[];
  activeIndex: number;
  onSelectCategory: (index: number) => void;
}

/**
 * NavRail — full-height neumorphic button navigator.
 *
 * • The old notch "bite" is gone: every destination is a proper
 *   neumorphic BUTTON. The active one reads as pressed-in (inset
 *   depth) while its label scales up past the others — a magnifying
 *   glass over where you are.
 * • Scroll progress lives IN the rail: a hairline seam along the
 *   rail's inner edge (its border) fills top→bottom as you read.
 *   The old top-edge progress bar is removed.
 * • Optimistic activation — a tap answers instantly; the pin
 *   self-expires once the scroll-spy confirms the landing.
 */
export function NavRail({ categories, activeIndex, onSelectCategory }: NavRailProps) {
  const [pinned, setPinned] = useState<number | null>(null);
  const { soundOn, toggle } = useSoundEngine();
  const reduceMotion = useReducedMotion();

  /* Current accent hue — the boot script draws it randomly (ref:
     "Random on each refresh"); cycleAccent advances the pool. */
  const [hue, setHue] = useState<AccentHue | null>(null);

  /* Scroll progress — rendered as the rail's inner border seam */
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.4,
  });

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

  return (
    <motion.aside
      id="portfolio-sidebar"
      initial={reduceMotion ? false : { x: -28, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className="fixed inset-y-0 left-0 z-30 flex w-[54px] shrink-0 select-none flex-col items-center py-3 sm:w-[62px] md:w-[74px] md:py-4"
      aria-label="Primary navigation"
    >
      {/* Depth shadow twin — wide material elevation + tight contact */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-r-[16px] shadow-[22px_0_54px_-30px_rgba(var(--primary-rgb)/0.5),8px_0_22px_-16px_rgba(var(--primary-rgb)/0.28)] sm:rounded-r-[18px] md:rounded-r-[22px]"
      />

      {/* Neumorphic rail surface */}
      <div
        aria-hidden="true"
        className="glass-rail-neu pointer-events-none absolute inset-0 rounded-r-[16px] sm:rounded-r-[18px] md:rounded-r-[22px]"
        style={{ borderRight: "1px solid var(--nl)" }}
      />

      {/* ── Scroll progress AS the nav border ─────────────────────
          Inner-edge seam: a hairline track hugging the rail's right
          border; the gradient fill scales top→bottom with reading
          progress. Transform-only (scaleY) — zero layout work. */}
      <div
        aria-hidden="true"
        className="absolute inset-y-4 right-0 z-[3] w-[3px] overflow-hidden rounded-full"
        style={{ background: "color-mix(in srgb, var(--nl) 55%, transparent)" }}
      >
        <motion.div
          style={{ scaleY: progress }}
          className="h-full w-full origin-top rounded-full bg-gradient-to-b from-[var(--primary2-ref)] via-[var(--primary)] to-[var(--accent-ref)]"
        />
      </div>

      {/* Brand monogram tile */}
      <button
        type="button"
        onClick={() => handleSelect(0)}
        aria-label="Back to top"
        title="M Rayhan — back to top"
        className="relative z-[2] flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[var(--nl)] bg-[var(--bg)] shadow-[var(--shadow-neu-sm)] transition-transform duration-300 hover:scale-105 active:scale-95 sm:h-10 sm:w-10"
      >
        <span className="font-display text-[13px] font-extrabold leading-none tracking-tight text-foreground sm:text-sm">
          {person.name.split(" ").map((w) => w[0]).join("")}
        </span>
        <span
          aria-hidden="true"
          className="absolute -bottom-[3px] left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent-ref)]"
        />
      </button>

      {/* ── Neumorphic nav buttons ──────────────────────────────── */}
      <nav
        aria-label="Sections"
        className="relative z-[2] flex w-full flex-1 flex-col items-center justify-center gap-1.5 px-1.5 py-3 sm:gap-2 md:px-2.5"
      >
        {categories.map((cat, idx) => {
          const isActive = idx === effectiveIndex;
          return (
            <button
              key={cat.id}
              id={`side-nav-${cat.id}`}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(idx);
              }}
              aria-current={idx === activeIndex ? "page" : undefined}
              title={cat.label}
              className={`group relative flex w-full cursor-pointer items-center justify-center rounded-xl border px-0 outline-none transition-all duration-300 ease-out focus-visible:ring-1 focus-visible:ring-primary/40 active:scale-[0.97] ${
                isActive
                  ? "border-[var(--nl)] bg-[var(--bg)] py-2.5 shadow-[var(--shadow-neu-in)]"
                  : "border-transparent bg-transparent py-2.5 shadow-none hover:bg-primary/[0.05] hover:shadow-[var(--shadow-neu-sm)]"
              }`}
            >
              {/* Vertical label — the magnifying-glass read: the active
                  button's text grows past all the others */}
              <span
                className={`pointer-events-none relative whitespace-nowrap font-bold uppercase transition-all duration-300 ease-out ${
                  isActive
                    ? "text-[12px] tracking-[1.8px] text-primary sm:text-[13px] md:text-[14px] md:tracking-[2px]"
                    : "text-[9.5px] tracking-[1.4px] text-muted-foreground group-hover:text-foreground sm:text-[10.5px] md:text-[11px]"
                }`}
                style={{ writingMode: "vertical-rl", rotate: "180deg" }}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ── Bottom action controls ──────────────────────────────── */}
      <div className="relative z-[2] mt-auto flex shrink-0 flex-col items-center gap-2 pt-2">
        {/* Color cycle — walks the Material accent pool */}
        <button
          id="accent-cycle-btn"
          type="button"
          aria-label="Change accent color"
          title={hue ? `Accent: ${hue.label}` : "Change accent color"}
          onClick={() => {
            const next = cycleAccent();
            setHue(next);
            playSound("pop");
          }}
          className="group relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[var(--nl)] bg-[var(--bg)] text-muted-foreground shadow-[var(--shadow-neu-sm)] transition-all duration-300 hover:text-primary active:scale-90 active:shadow-[var(--shadow-neu-in)]"
        >
          <Palette className="h-4 w-4" />
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-[var(--nl)] transition-colors duration-300"
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--accent-ref))",
            }}
          />
        </button>
        <button
          id="sound-toggle-btn"
          type="button"
          aria-label={soundOn ? "Mute sounds" : "Unmute sounds"}
          aria-pressed={soundOn}
          onClick={toggle}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[var(--nl)] bg-[var(--bg)] text-muted-foreground shadow-[var(--shadow-neu-sm)] transition-all duration-300 hover:text-primary active:scale-90 active:shadow-[var(--shadow-neu-in)]"
        >
          {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
      </div>
    </motion.aside>
  );
}

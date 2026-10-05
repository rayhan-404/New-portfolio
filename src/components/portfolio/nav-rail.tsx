"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Palette, Settings2, Volume2, VolumeX } from "lucide-react";
import { useSoundEngine } from "./nav";

import { cycleAccent, type AccentHue } from "@/lib/accent-pool";
import { openAdminPanel } from "./admin-open";
import { playSound } from "@/lib/sound";

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
 * NavRail — full-height navigator, quiet by default.
 *
 * • The section items are NOT a stack of buttons: an unvisited
 *   destination is plain small vertical text (surface-free, borderless)
 *   — the only treatment in the rail is the ACTIVE one, rendered as a
 *   genuine site card (the glass recipe: --bg surface + twin neu
 *   shadows, NO border) slightly smaller than the rail's width.
 *   Its label scales up past the others — a magnifying glass over
 *   where you are.
 * • The card is one shared framer-motion element (layoutId): when the
 *   active section changes it PHYSICALLY SLIDES from the old item to
 *   the new one on a soft spring — a fluid glide, not a swap.
 * • Hover is colour-only: gliding over an idle item never raises a
 *   surface — the label simply brightens toward the foreground. The
 *   card belongs to the active destination alone.
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
      className="fixed inset-y-0 left-0 z-30 flex w-[54px] shrink-0 select-none flex-col items-center pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:w-[62px] md:w-[74px] md:py-4"
      aria-label="Primary navigation"
    >
      {/* Depth shadow twin — wide material elevation + tight contact */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-r-[12px] shadow-[22px_0_54px_-30px_rgba(var(--primary-rgb)/0.5),8px_0_22px_-16px_rgba(var(--primary-rgb)/0.28)] sm:rounded-r-[18px] md:rounded-r-[22px]"
      />

      {/* Neumorphic rail surface */}
      <div
        aria-hidden="true"
        className="glass-rail-neu pointer-events-none absolute inset-0 rounded-r-[12px] sm:rounded-r-[18px] md:rounded-r-[22px]"
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

      {/* ── Neumorphic nav buttons ──────────────────────────────── */}
      <nav
        aria-label="Sections"
        className="relative z-[2] flex w-full flex-1 flex-col items-center justify-evenly gap-1 px-1.5 py-3 md:px-2.5"
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
              className="group relative flex w-full cursor-pointer items-center justify-center rounded-[9px] px-0 py-1.5 outline-none transition-all duration-300 ease-out focus-visible:ring-1 focus-visible:ring-primary/40 active:scale-[0.97] md:rounded-[11px] md:py-2"
            >
              {/* The card — ONE shared element (layoutId) living inside
                  whichever item is active. On change it physically glides
                  from the old item to the new one on a soft spring.
                  Styled exactly like the site's raised cards: the glass
                  recipe (bg + twin shadows), no border. */}
              {isActive && (
                <motion.span
                  layoutId="nav-active-card"
                  initial={false}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 380,
                          damping: 32,
                          mass: 0.8,
                        }
                  }
                  aria-hidden="true"
                  className="glass pointer-events-none absolute inset-0 rounded-[9px] md:rounded-[11px]"
                />
              )}
              {/* Vertical label — the magnifying-glass read: the active
                  button's text grows past all the others. On idle items
                  hovering only shifts this label's colour — no surface. */}
              <span
                className={`pointer-events-none relative whitespace-nowrap font-bold uppercase transition-all duration-300 ease-out ${
                  isActive
                    ? "text-[11px] tracking-[1.6px] text-primary sm:text-[12px] md:text-[13px] md:tracking-[1.8px]"
                    : "text-[9px] tracking-[1.3px] text-muted-foreground group-hover:text-foreground sm:text-[10px] md:text-[10.5px]"
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
          className="group relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[var(--nl)] bg-[var(--bg)] text-muted-foreground shadow-[var(--shadow-neu-sm)] transition-all duration-300 hover:text-primary active:scale-90 active:shadow-[var(--shadow-neu-in)] sm:h-9 sm:w-9"
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
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[var(--nl)] bg-[var(--bg)] text-muted-foreground shadow-[var(--shadow-neu-sm)] transition-all duration-300 hover:text-primary active:scale-90 active:shadow-[var(--shadow-neu-in)] sm:h-9 sm:w-9"
        >
          {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
        {/* Control room — passcode-gated site admin */}
        <button
          id="admin-open-btn"
          type="button"
          aria-label="Open admin panel"
          title="Admin panel"
          onClick={() => {
            playSound("tap");
            openAdminPanel();
          }}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[var(--nl)] bg-[var(--bg)] text-muted-foreground shadow-[var(--shadow-neu-sm)] transition-all duration-300 hover:text-primary active:scale-90 active:shadow-[var(--shadow-neu-in)] sm:h-9 sm:w-9"
        >
          <Settings2 className="h-4 w-4" />
        </button>
      </div>
    </motion.aside>
  );
}

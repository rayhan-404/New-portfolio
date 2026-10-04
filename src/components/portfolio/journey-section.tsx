"use client";

import type { LucideIcon } from "lucide-react";
import {
  Baby,
  BookOpen,
  GraduationCap,
  Home,
  Rocket,
  School,
  Shapes,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { journey, journeyFuture } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";
import { Reveal } from "./reveal";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Line icons for the chapter medallions — each era's glyph lives in a
   raised neumorphic disc riding on top of its card. */
const TITLE_ICONS: Record<string, LucideIcon> = {
  baby: Baby,
  home: Home,
  shapes: Shapes,
  school: School,
  book: BookOpen,
  gradcap: GraduationCap,
  rocket: Rocket,
};

/* Geist black (900) — the timeline's ultra-heavy display weight.
   Inline style so it reliably beats the @utility font-display default. */
const BLACK = {
  fontFamily: "var(--font-geist-sans), ui-sans-serif, sans-serif",
  fontWeight: 900,
} as const;

/* Education chapters wear the reference's edu-card blue (#4267B2 family);
   life chapters stay on the rotating primary. */
const EDU_ICONS = new Set(["shapes", "school", "book", "gradcap"]);

/* 6 chapters + the 2028 "Loading…" future stop */
const STOPS = journey.length + 1;

/* Year labels for the rail dots (hover) */
const STOP_LABELS = [...journey.map((e) => e.period), journeyFuture.year];

/* Medallion geometry */
const MEDALLION = {
  disc: "h-11 w-11 sm:h-12 sm:w-12",
  icon: "h-[19px] w-[19px] sm:h-5 sm:w-5",
} as const;

/**
 * JourneySection — "My journey in the world", vertical edition (v88).
 *
 * The cards no longer ride a pinned sideways reel: they stack down the
 * page like a classic timeline and the page scrolls them past — one
 * stop after another, each revealing as it enters the viewport. A
 * measured rail threads the stops: hairline track, brand-gradient fill
 * that grows with scroll, a breathing comet head, and one clickable
 * dot per stop (year tooltip; clicking glides that card into view).
 * The stop counter keeps flipping in the header, and the active stop —
 * the card nearest the viewport centre — earns the shimmering year
 * pour and the spinning medallion halo. Every word of the copy is
 * verbatim from the reel.
 *
 * History: v78–v87 was pinned horizontal cinema (runway multiplier
 * 0.85 → 1.35 → 1.9 → 3.1); v88 answers the original brief — the
 * cards scroll DOWN, not sideways.
 */
export function JourneySection() {
  const reduce = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /* Active stop = the row nearest the viewport centre — drives the
     counter, the rail dots, the year shimmer and the medallion halo. */
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      let best = 0;
      let bd = Infinity;
      rowRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      setActive((prev) => (prev === best ? prev : best));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* Rail geometry: one measured box from the first dot's centre to the
     last dot's centre. Dots live outside the reveal wrappers, so the
     measurement is transform-immune. Re-measured on resize / fonts. */
  const [railBox, setRailBox] = useState<{
    top: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    let signature = "";
    const measure = () => {
      const list = listRef.current;
      const first = dotRefs.current[0];
      const last = dotRefs.current[STOPS - 1];
      if (!list || !first || !last) return;
      const listBox = list.getBoundingClientRect();
      const a = first.getBoundingClientRect();
      const b = last.getBoundingClientRect();
      const top = a.top + a.height / 2 - listBox.top;
      const height = b.top + b.height / 2 - (a.top + a.height / 2);
      const sig = `${Math.round(top)}|${Math.round(height)}`;
      if (sig === signature) return;
      signature = sig;
      setRailBox({ top, height });
    };

    measure();
    const t1 = setTimeout(measure, 400);
    const t2 = setTimeout(measure, 1400);
    document.fonts?.ready.then(measure).catch(() => {});
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined" && listRef.current) {
      ro = new ResizeObserver(measure);
      ro.observe(listRef.current);
    }
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  /* Rail fill — grows as the timeline scrolls through the viewport. */
  const railScroll = useScroll({
    target: listRef,
    offset: ["start 0.8", "end 0.6"],
  });
  const headTop = useTransform(railScroll.scrollYProgress, (v) =>
    `${(v * 100).toFixed(2)}%`
  );

  /* Ambient drift — blobs + backdrop word ease against the scroll. */
  const sectionScroll = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const ghostY = useTransform(sectionScroll.scrollYProgress, [0, 1], [50, -90]);
  const blobY1 = useTransform(sectionScroll.scrollYProgress, [0, 1], [60, -120]);
  const blobY2 = useTransform(sectionScroll.scrollYProgress, [0, 1], [-70, 110]);

  /* Click a rail dot → glide that stop's card into view. */
  const goToStop = (i: number) => {
    playSound("tap");
    const row = rowRefs.current[i];
    if (!row) return;
    const top = row.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      id="journey"
      aria-label="My journey"
      className="relative overflow-hidden pb-28 pt-14 sm:pt-20"
    >
      {/* Ambient depth blobs drifting against the scroll */}
      <motion.span
        aria-hidden="true"
        style={reduce ? undefined : { y: blobY1 }}
        className="pointer-events-none absolute -left-28 top-24 z-0 h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,rgba(var(--primary-rgb)/0.1),transparent_65%)] blur-2xl"
      />
      <motion.span
        aria-hidden="true"
        style={reduce ? undefined : { y: blobY2 }}
        className="pointer-events-none absolute -right-32 bottom-10 z-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(var(--accent-rgb)/0.09),transparent_65%)] blur-2xl"
      />

      {/* Giant backdrop word — drifts up as you travel down (parallax) */}
      <motion.span
        aria-hidden="true"
        style={{
          ...(reduce ? {} : { y: ghostY }),
          ...BLACK,
          fontSize: "clamp(70px, 13vw, 190px)",
        }}
        className="pointer-events-none absolute -right-10 top-2 z-0 select-none whitespace-nowrap leading-[0.8] tracking-[-0.07em] text-foreground/[0.04]"
      >
        MY JOURNEY
      </motion.span>

      <div className="relative z-[1] px-6 sm:px-10 lg:px-16">
        {/* ── Header — eyebrow + one-line title + counter ─────────── */}
        <Reveal>
          <header className="flex items-end justify-between gap-6">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-px w-10"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, var(--gold))",
                  }}
                />
                <p className="font-tag text-[10.5px] font-bold text-accent-ink">
                  02 · The Story So Far
                </p>
              </div>
              <h2
                className="leading-[0.92] tracking-[-0.05em] text-foreground"
                style={{ ...BLACK, fontSize: "clamp(30px, 4.4vw, 58px)" }}
              >
                My journey{" "}
                <em className="font-serif font-normal italic tracking-[-0.04em]">
                  in the world
                </em>
              </h2>

              {/* Gold swash — the hero's hand-drawn stroke, drawing
                  itself in when the title lands */}
              <motion.svg
                viewBox="0 0 180 14"
                aria-hidden="true"
                initial={reduce ? false : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="mt-3 block h-[13px] w-[150px]"
              >
                <motion.path
                  d="M4 9 C 38 3, 74 12.5, 110 7.5 S 168 4.5, 176 7"
                  fill="none"
                  stroke="url(#journey-swash-gold)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  initial={reduce ? false : { pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
                />
                <defs>
                  <linearGradient
                    id="journey-swash-gold"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop
                      offset="0%"
                      style={{ stopColor: "var(--primary2-ref)" }}
                    />
                    <stop
                      offset="55%"
                      style={{ stopColor: "var(--primary)" }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: "var(--accent-ref)" }}
                    />
                  </linearGradient>
                </defs>
              </motion.svg>
            </div>

            {/* Stop counter — number flips as chapters pass */}
            <div
              aria-hidden="true"
              className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex"
            >
              <div className="relative h-11 w-[64px] overflow-hidden">
                <AnimatePresence initial={false}>
                  <motion.span
                    key={active}
                    initial={{ y: 34, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -34, opacity: 0 }}
                    transition={{ duration: 0.42, ease: EASE }}
                    className="text-gold-gradient absolute inset-x-0 top-0 text-right text-[40px] leading-[44px] tabular-nums"
                    style={BLACK}
                  >
                    {String(active + 1).padStart(2, "0")}
                  </motion.span>
                </AnimatePresence>
              </div>
              <p className="font-tag text-[9px] tracking-[0.3em] text-muted-foreground">
                Stop {String(active + 1).padStart(2, "0")} ·{" "}
                {String(STOPS).padStart(2, "0")}
              </p>
            </div>
          </header>
        </Reveal>

        {/* ── The timeline — stops stacked, the page scrolls them ─── */}
        <div
          ref={listRef}
          className="relative z-[1] mt-14 [--dot-x:22px] sm:mt-20 sm:[--dot-x:32px]"
        >
          {/* Rail — hairline track, gradient fill, comet head. The
              measured box runs first-dot-centre → last-dot-centre. */}
          {railBox && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute z-0"
              style={{
                top: railBox.top,
                height: railBox.height,
                left: "calc(var(--dot-x) - 1px)",
                width: 2,
              }}
            >
              <span className="absolute inset-0 rounded-full bg-[rgba(var(--primary-rgb)/0.16)]" />
              <motion.span
                style={{ scaleY: railScroll.scrollYProgress }}
                className="grad-fill absolute inset-0 origin-top rounded-full opacity-80"
              />
              <motion.div
                style={{ top: headTop }}
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <span className="block h-3.5 w-3.5 rounded-full bg-[var(--accent-ref)] shadow-[0_0_18px_rgba(var(--accent-rgb)/0.9)]" />
                {!reduce && (
                  <motion.span
                    animate={{ scale: [1, 1.3, 1], opacity: [0.75, 1, 0.75] }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -inset-2 -z-[1] rounded-full bg-[radial-gradient(circle,rgba(var(--accent-rgb)/0.4),transparent_65%)] blur-sm"
                  />
                )}
              </motion.div>
            </div>
          )}

          {journey.map((era, idx) => {
            const EraIcon = TITLE_ICONS[era.icon];
            const isEdu = EDU_ICONS.has(era.icon);
            const chapter = String(idx + 1).padStart(2, "0");
            const isActive = active === idx;
            const medallionTint = isEdu
              ? "text-(--edu) shadow-[0_0_0_5px_color-mix(in_srgb,var(--edu)_13%,transparent),0_0_24px_color-mix(in_srgb,var(--edu)_40%,transparent),var(--shadow-neu-sm)]"
              : "text-primary shadow-[0_0_0_5px_rgba(var(--primary-rgb)/0.13),0_0_24px_rgba(var(--accent-rgb)/0.4),var(--shadow-neu-sm)]";
            return (
              <div
                key={era.period}
                ref={(el) => {
                  rowRefs.current[idx] = el;
                }}
                className="relative grid grid-cols-[44px_minmax(0,1fr)] gap-x-3 pb-28 last:pb-0 sm:grid-cols-[64px_minmax(0,1fr)] sm:gap-x-5 sm:pb-36"
              >
                {/* Rail dot — clickable, glides the stop into view */}
                <div className="relative z-[2] flex justify-center pt-1">
                  <button
                    ref={(el) => {
                      dotRefs.current[idx] = el;
                    }}
                    type="button"
                    onClick={() => goToStop(idx)}
                    aria-label={`Go to stop ${chapter} — ${STOP_LABELS[idx]}`}
                    aria-current={isActive ? "true" : undefined}
                    className="group mt-7 flex h-6 w-6 items-center justify-center rounded-full sm:mt-8"
                  >
                    <span
                      className={`block h-2.5 w-2.5 rounded-full transition-all duration-500 ${
                        idx <= active
                          ? "bg-primary shadow-[0_0_0_3px_rgba(var(--primary-rgb)/0.18),0_0_10px_rgba(var(--accent-rgb)/0.7)]"
                          : "bg-primary/25"
                      } ${isActive ? "!scale-125" : ""}`}
                    />
                    <span className="font-tag pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-[var(--bg)] px-2 py-0.5 text-[8px] tracking-[0.18em] text-accent-ink opacity-0 shadow-[var(--shadow-neu-sm)] transition-opacity duration-300 group-hover:opacity-100">
                      {STOP_LABELS[idx]}
                    </span>
                  </button>
                </div>

                {/* Stop content — reveals as it scrolls into view */}
                <div className="relative min-w-0">
                  <Reveal y={36} className="max-w-[640px]">
                    {/* Ghost chapter index behind the card */}
                    <span
                      aria-hidden="true"
                      className="text-outline pointer-events-none absolute -top-12 right-0 z-0 select-none leading-none opacity-40"
                      style={{ ...BLACK, fontSize: "clamp(88px, 9vw, 150px)" }}
                    >
                      {chapter}
                    </span>

                    {/* Year — poured with the brand gradient; the active
                        stop's pour stretches 2× and sweeps a slow shimmer */}
                    <p
                      className={`text-gold-gradient relative z-[1] mb-5 mt-3 whitespace-nowrap leading-[0.85] tracking-[-0.055em] tabular-nums ${
                        isActive && !reduce ? "year-shimmer" : ""
                      }`}
                      style={{
                        ...BLACK,
                        fontSize: "clamp(38px, 4.2vw, 64px)",
                      }}
                    >
                      {era.period}
                    </p>

                    <div className="relative z-[1]">
                      {/* Medallion — idles on a slow float, wears a
                          spinning dashed halo while its stop is active */}
                      <span
                        aria-hidden="true"
                        className={`absolute -top-8 left-6 z-[2] flex items-center justify-center rounded-full bg-[var(--bg2)] ${MEDALLION.disc} ${medallionTint}`}
                      >
                        {!reduce && (
                          <span
                            className={`absolute -inset-[5px] rounded-full border border-dashed border-primary/45 animate-spin [animation-duration:9s] transition-opacity duration-500 ${
                              isActive ? "opacity-100" : "opacity-0"
                            }`}
                          />
                        )}
                        <motion.span
                          animate={reduce ? undefined : { y: [0, -5, 0] }}
                          transition={{
                            duration: 4.6,
                            repeat: Infinity,
                            delay: idx * 0.4,
                            ease: "easeInOut",
                          }}
                          className="flex"
                        >
                          {EraIcon && (
                            <EraIcon
                              aria-hidden="true"
                              strokeWidth={2.25}
                              className={MEDALLION.icon}
                            />
                          )}
                        </motion.span>
                      </span>

                      {/* Card — the site's journey-card recipe */}
                      <div
                        className={`journey-card relative w-full overflow-hidden rounded-2xl p-5 text-left sm:p-6 md:rounded-[22px] ${
                          era.current ? "journey-card--current" : ""
                        }`}
                      >
                        {/* Gradient crown hairline */}
                        <span
                          aria-hidden="true"
                          className="grad-underline pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-90"
                        />

                        {/* Education corner blobs — ref hues */}
                        {isEdu && (
                          <>
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute -right-7 -top-7 h-[110px] w-[110px] rounded-full bg-[linear-gradient(135deg,var(--edu),var(--edu-2))] opacity-[0.08] blur-[2px]"
                            />
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute -bottom-5 -left-5 h-[72px] w-[72px] rounded-full bg-[linear-gradient(135deg,var(--edu),var(--edu-2))] opacity-[0.06] blur-[2px]"
                            />
                          </>
                        )}

                        {/* Chapter index chip */}
                        <span
                          aria-hidden="true"
                          className="font-tag absolute right-5 top-5 text-[10px] tracking-[0.3em] text-accent-ink/70 sm:right-6 sm:top-6"
                        >
                          {chapter}
                        </span>

                        {era.current && (
                          <div className="mb-3 inline-flex items-center gap-2.5 font-tag text-[9px] tracking-[0.22em] text-accent-ink">
                            <span
                              aria-hidden="true"
                              className="journey-pulse h-[7px] w-[7px] rounded-full bg-primary shadow-[0_0_0_4px_rgba(var(--primary-rgb)/0.14),0_0_16px_rgba(var(--accent-rgb)/0.8)]"
                            />
                            Currently here
                          </div>
                        )}

                        <h3
                          className={`font-display uppercase leading-[0.95] tracking-[-0.045em] text-foreground ${
                            era.current
                              ? "text-[clamp(26px,3.4vw,42px)]"
                              : "text-[clamp(21px,2.8vw,34px)]"
                          }`}
                        >
                          {era.title}
                        </h3>

                        <p
                          className={`mt-2 text-[15px] font-semibold ${
                            isEdu ? "text-(--edu)" : "text-foreground/85"
                          }`}
                        >
                          {era.place}
                        </p>

                        {era.location && (
                          <p className="font-tag mt-1.5 text-[10px] text-muted-foreground">
                            {era.location}
                          </p>
                        )}

                        {era.degree && (
                          <div
                            className={`mt-3.5 border-l-2 px-3.5 py-2.5 font-mono text-[11px] leading-[1.5] text-foreground/90 ${
                              isEdu
                                ? "border-(--edu)/60 bg-(--edu)/[0.06]"
                                : "border-primary/60 bg-primary/[0.06]"
                            }`}
                          >
                            {era.degree}
                          </div>
                        )}

                        <p className="mt-3.5 max-w-[400px] text-[14px] leading-[1.6] text-foreground/70">
                          {era.description}
                        </p>

                        <span className="mt-4 inline-block rounded-full border border-primary/25 bg-primary/[0.07] px-3 py-1.5 font-tag text-[9.5px] tracking-[0.22em] text-accent-ink transition-colors duration-300">
                          {era.tag}
                        </span>
                      </div>
                    </div>
                  </Reveal>
                </div>
              </div>
            );
          })}

          {/* ── Stop 07 — 2028 · Loading… ────────────────────────── */}
          <div
            ref={(el) => {
              rowRefs.current[journey.length] = el;
            }}
            className="relative grid grid-cols-[44px_minmax(0,1fr)] gap-x-3 pb-28 last:pb-0 sm:grid-cols-[64px_minmax(0,1fr)] sm:gap-x-5 sm:pb-36"
          >
            <div className="relative z-[2] flex justify-center pt-1">
              <button
                ref={(el) => {
                  dotRefs.current[journey.length] = el;
                }}
                type="button"
                onClick={() => goToStop(journey.length)}
                aria-label={`Go to stop ${String(STOPS).padStart(2, "0")} — ${journeyFuture.year}`}
                aria-current={active === journey.length ? "true" : undefined}
                className="group mt-7 flex h-6 w-6 items-center justify-center rounded-full sm:mt-8"
              >
                <span
                  className={`block h-2.5 w-2.5 rounded-full transition-all duration-500 ${
                    journey.length <= active
                      ? "bg-primary shadow-[0_0_0_3px_rgba(var(--primary-rgb)/0.18),0_0_10px_rgba(var(--accent-rgb)/0.7)]"
                      : "bg-primary/25"
                  } ${active === journey.length ? "!scale-125" : ""}`}
                />
                <span className="font-tag pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-[var(--bg)] px-2 py-0.5 text-[8px] tracking-[0.18em] text-accent-ink opacity-0 shadow-[var(--shadow-neu-sm)] transition-opacity duration-300 group-hover:opacity-100">
                  {journeyFuture.year}
                </span>
              </button>
            </div>

            <div className="relative min-w-0">
              <Reveal y={36} className="max-w-[640px]">
                <p
                  className={`text-gold-gradient relative z-[1] mb-5 mt-3 whitespace-nowrap leading-[0.85] tracking-[-0.055em] tabular-nums ${
                    active === journey.length && !reduce ? "year-shimmer" : ""
                  }`}
                  style={{
                    ...BLACK,
                    fontSize: "clamp(38px, 4.2vw, 64px)",
                  }}
                >
                  {journeyFuture.year}
                </p>

                <div className="relative z-[1]">
                  <span
                    aria-hidden="true"
                    className={`absolute -top-8 left-6 z-[2] flex items-center justify-center rounded-full bg-[var(--bg2)] text-primary shadow-[0_0_0_5px_rgba(var(--primary-rgb)/0.13),0_0_24px_rgba(var(--accent-rgb)/0.4),var(--shadow-neu-sm)] ${MEDALLION.disc}`}
                  >
                    {!reduce && (
                      <span
                        className={`absolute -inset-[5px] rounded-full border border-dashed border-primary/45 animate-spin [animation-duration:9s] transition-opacity duration-500 ${
                          active === journey.length ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    )}
                    <motion.span
                      animate={reduce ? undefined : { y: [0, -6, 0] }}
                      transition={{
                        duration: 3.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="flex"
                    >
                      <Rocket
                        aria-hidden="true"
                        strokeWidth={2.25}
                        className={`${MEDALLION.icon} -rotate-12`}
                      />
                    </motion.span>
                  </span>

                  <div className="journey-card relative w-full overflow-hidden rounded-2xl p-5 text-left sm:p-6 md:rounded-[22px]">
                    <span
                      aria-hidden="true"
                      className="grad-underline pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-90"
                    />
                    <p className="font-tag text-[9px] tracking-[0.3em] text-muted-foreground">
                      {journeyFuture.label}
                    </p>
                    <h3
                      className="my-2.5 leading-[0.9] tracking-[-0.05em] text-foreground"
                      style={{ ...BLACK, fontSize: "clamp(34px, 3.6vw, 54px)" }}
                    >
                      {journeyFuture.title}
                      {reduce ? (
                        <span className="opacity-40">...</span>
                      ) : (
                        <span className="opacity-40" aria-hidden="true">
                          {[0, 1, 2].map((d) => (
                            <motion.span
                              key={d}
                              animate={{ opacity: [0.25, 1, 0.25] }}
                              transition={{
                                duration: 1.4,
                                repeat: Infinity,
                                delay: d * 0.22,
                                ease: "easeInOut",
                              }}
                            >
                              .
                            </motion.span>
                          ))}
                        </span>
                      )}
                    </h3>
                    <p className="text-[14.5px] leading-relaxed text-foreground/65">
                      {journeyFuture.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

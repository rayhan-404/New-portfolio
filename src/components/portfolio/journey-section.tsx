"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
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
  useMotionValueEvent,
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

/* Geist black (900) — the reel's ultra-heavy display weight.
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

/* Initial even spacing — replaced by measured stops right after mount */
const EVEN_STOPS = Array.from({ length: STOPS }, (_, i) => i / (STOPS - 1));

/* Medallion geometry */
const MEDALLION = {
  disc: "h-11 w-11 sm:h-12 sm:w-12",
  icon: "h-[19px] w-[19px] sm:h-5 sm:w-5",
} as const;

/* Panel widths — one card per stop, next card peeking from the edge */
const PANEL_W =
  "w-[min(80vw,340px)] sm:w-[420px] md:w-[460px] lg:w-[500px]";

/**
 * JourneySection — "My journey in the world", Journey Cinema edition.
 *
 * The old vertical trail ate ~5 viewports of page height; this rebuild
 * compresses the whole story into ONE pinned screen. The section owns a
 * scroll runway (100svh + travel) while its inner stage sticks to the
 * viewport — scrolling down drives the seven chapter stops sideways
 * through the frame like a film reel:
 *
 * • Track — scroll-linked 1:1 translate (no spring: the reel is always
 *   exactly where your finger is). Opens with chapter 01 at the left
 *   edge, closes with the 2028 stop perfectly centred.
 * • Focus — the centred stop is full-size and sharp; neighbours dim,
 *   shrink and (desktop) soften out of focus. Depth without a single
 *   per-frame layout write.
 * • Years — huge BLACK numerals poured with the brand gradient; a ghost
 *   outlined chapter index floats behind each card.
 * • Medallions — the era glyph in a raised neu disc that spring-pops
 *   when its stop becomes active, then idles on a slow float.
 * • Rail — a comet head rides a hairline progress track; the chapter
 *   stops are clickable dots that glide the reel to that year.
 * • Counter — the top-right stop number flips (01→07) as chapters pass.
 * • Reduced motion — no pinning, no transforms: a calm vertical stack.
 *
 * Every word of the original content is preserved verbatim.
 */
export function JourneySection() {
  const reduce = useReducedMotion();
  const pinned = !reduce;

  const runwayRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  /* Horizontal travel (px) and the scroll progress where each stop
     centres — measured from the real layout after mount / resize. */
  const [range, setRange] = useState(2400);
  const [stops, setStops] = useState<number[]>(EVEN_STOPS);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: runwayRef,
    offset: ["start start", "end end"],
  });

  /* Direct 1:1 mapping — zero lag between scroll and reel. */
  const x = useTransform(scrollYProgress, [0, 1], [0, -range]);
  const headLeft = useTransform(
    scrollYProgress,
    (v) => `${(v * 100).toFixed(3)}%`
  );
  const ghostX = useTransform(scrollYProgress, [0, 1], [70, -150]);
  const blobX1 = useTransform(scrollYProgress, [0, 1], [40, -110]);
  const blobX2 = useTransform(scrollYProgress, [0, 1], [-60, 90]);

  const stopsRef = useRef(stops);
  useEffect(() => {
    stopsRef.current = stops;
  }, [stops]);

  /* The stop nearest the viewport centre is the active chapter —
     drives the counter, the dots and the focus dimming. */
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const s = stopsRef.current;
    let best = 0;
    let bd = Infinity;
    for (let i = 0; i < s.length; i++) {
      const d = Math.abs(s[i] - p);
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    setActive((prev) => (prev === best ? prev : best));
  });

  /* Measure the real travel + stop positions. The reel travels far
     enough that the LAST panel ends centred (its right padding no
     longer matters). Re-measured on resize / font load / panel size
     change; a signature guard keeps identical measurements from
     re-rendering. */
  useEffect(() => {
    if (!pinned) return;
    let signature = "";

    const measure = () => {
      const track = trackRef.current;
      const stage = stageRef.current;
      if (!track || !stage) return;
      const panels = Array.from(
        track.querySelectorAll<HTMLElement>("[data-panel]")
      );
      if (panels.length === 0) return;
      const last = panels[panels.length - 1];
      const view = stage.clientWidth;
      const r = Math.max(
        1,
        last.offsetLeft + last.offsetWidth / 2 - view / 2
      );
      const nextStops = panels.map((p) =>
        Math.min(
          1,
          Math.max(0, (p.offsetLeft + p.offsetWidth / 2 - view / 2) / r)
        )
      );
      const sig = `${Math.round(r)}|${nextStops.map((s) => s.toFixed(4)).join(",")}`;
      if (sig === signature) return;
      signature = sig;
      setRange(r);
      setStops(nextStops);
    };

    measure();
    const t1 = setTimeout(measure, 400);
    const t2 = setTimeout(measure, 1400);
    document.fonts?.ready.then(measure).catch(() => {});
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined" && trackRef.current) {
      ro = new ResizeObserver(measure);
      ro.observe(trackRef.current);
    }
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned]);

  /* Click a rail dot → glide the runway so that stop centres. */
  const goToStop = (i: number) => {
    const runway = runwayRef.current;
    if (!runway || reduce) return;
    playSound("tap");
    const travel = Math.max(1, runway.offsetHeight - window.innerHeight);
    const rect = runway.getBoundingClientRect();
    const top = rect.top + window.scrollY + stops[i] * travel;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const focusClass = (isActive: boolean) =>
    pinned
      ? isActive
        ? "scale-100 opacity-100"
        : "scale-[0.93] opacity-40 md:blur-[3px]"
      : "";

  return (
    <section
      ref={runwayRef}
      id="journey"
      aria-label="My journey"
      className="relative"
      style={
        pinned
          ? { height: `calc(100svh + ${Math.round(range * 0.85)}px)` }
          : undefined
      }
    >
      {/* ── The pinned stage — one screen of cinema ─────────────── */}
      <div
        ref={stageRef}
        className={
          pinned
            ? "sticky top-0 flex h-svh flex-col overflow-hidden"
            : "relative flex flex-col"
        }
      >
        {/* Ambient depth blobs drifting on the reel's progress */}
        <motion.span
          aria-hidden="true"
          style={pinned ? { x: blobX1 } : undefined}
          className="pointer-events-none absolute -left-28 top-[-12%] z-0 h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,rgba(var(--primary-rgb)/0.1),transparent_65%)] blur-2xl"
        />
        <motion.span
          aria-hidden="true"
          style={pinned ? { x: blobX2 } : undefined}
          className="pointer-events-none absolute -right-32 bottom-[-16%] z-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(var(--accent-rgb)/0.09),transparent_65%)] blur-2xl"
        />

        {/* Giant backdrop word — drifts against the travel (parallax) */}
        <motion.span
          aria-hidden="true"
          style={{
            ...(pinned ? { x: ghostX } : {}),
            ...BLACK,
            fontSize: "clamp(70px, 13vw, 190px)",
          }}
          className="pointer-events-none absolute -right-10 top-4 z-0 select-none whitespace-nowrap leading-[0.8] tracking-[-0.07em] text-foreground/[0.04] sm:top-7"
        >
          MY JOURNEY
        </motion.span>

        {/* ── Header — compact: eyebrow + one-line title + counter ── */}
        <Reveal className="relative z-[2] shrink-0 px-6 pt-8 sm:px-10 sm:pt-11 lg:px-16">
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
            {pinned && (
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
            )}
          </header>
        </Reveal>

        {/* ── The reel — seven stops sliding through the frame ────── */}
        <motion.div
          ref={trackRef}
          style={pinned ? { x } : undefined}
          className={`relative z-[1] min-h-0 flex-1 gap-6 px-6 sm:gap-8 sm:px-10 lg:px-16 ${
            pinned
              ? "flex items-center pt-6"
              : "flex flex-col gap-16 py-24"
          }`}
        >
          {journey.map((era, idx) => {
            const EraIcon = TITLE_ICONS[era.icon];
            const isEdu = EDU_ICONS.has(era.icon);
            const chapter = String(idx + 1).padStart(2, "0");
            const isActive = !pinned || active === idx;
            const medallionTint = isEdu
              ? "text-[#4267B2] shadow-[0_0_0_5px_rgba(66,103,178,0.13),0_0_24px_rgba(66,103,178,0.4),var(--shadow-neu-sm)]"
              : "text-primary shadow-[0_0_0_5px_rgba(var(--primary-rgb)/0.13),0_0_24px_rgba(var(--accent-rgb)/0.4),var(--shadow-neu-sm)]";
            return (
              <article
                key={era.period}
                data-panel
                aria-label={`${era.period} — ${era.title}`}
                className={`group relative shrink-0 ${PANEL_W} transition-[opacity,transform,filter] duration-700 ease-out ${focusClass(isActive)}`}
              >
                {/* Ghost chapter index behind the card */}
                <span
                  aria-hidden="true"
                  className={`text-outline pointer-events-none absolute -top-14 right-0 z-0 select-none leading-none transition-opacity duration-700 ${
                    pinned && !isActive ? "opacity-15" : "opacity-40"
                  }`}
                  style={{ ...BLACK, fontSize: "clamp(88px, 9vw, 150px)" }}
                >
                  {chapter}
                </span>

                {/* Year — poured with the brand gradient */}
                <p
                  className="text-gold-gradient relative z-[1] mb-5 mt-3 whitespace-nowrap leading-[0.85] tracking-[-0.055em] tabular-nums"
                  style={{
                    ...BLACK,
                    fontSize: "clamp(38px, 4.2vw, 64px)",
                  }}
                >
                  {era.period}
                </p>

                <div className="relative z-[1]">
                  {/* Medallion — spring-pops on activation, then idles
                      on a slow float */}
                  <motion.span
                    aria-hidden="true"
                    initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                    animate={
                      reduce
                        ? undefined
                        : isActive
                          ? { scale: 1, opacity: 1 }
                          : { scale: 0.55, opacity: 0 }
                    }
                    transition={{ type: "spring", stiffness: 320, damping: 20 }}
                    className={`absolute -top-8 left-6 z-[2] flex items-center justify-center rounded-full bg-[var(--bg2)] ${MEDALLION.disc} ${medallionTint}`}
                  >
                    <motion.span
                      animate={
                        reduce
                          ? undefined
                          : { y: [0, -5, 0] }
                      }
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
                  </motion.span>

                  {/* Card — the site's journey-card recipe */}
                  <div
                    className={`journey-card relative w-full overflow-hidden rounded-2xl p-5 text-left sm:p-6 md:rounded-[22px] ${
                      era.current ? "journey-card--current" : ""
                    }`}
                  >
                    {/* Gradient crown hairline */}
                    <span
                      aria-hidden="true"
                      className="grad-underline pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-50"
                    />

                    {/* Education corner blobs — ref hues */}
                    {isEdu && (
                      <>
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute -right-7 -top-7 h-[110px] w-[110px] rounded-full bg-[linear-gradient(135deg,#4267B2,#898F9C)] opacity-[0.08] blur-[2px]"
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute -bottom-5 -left-5 h-[72px] w-[72px] rounded-full bg-[linear-gradient(135deg,#4267B2,#898F9C)] opacity-[0.06] blur-[2px]"
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
                        isEdu ? "text-[#4267B2]" : "text-foreground/85"
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
                            ? "border-[#4267B2]/60 bg-[#4267B2]/[0.06]"
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
              </article>
            );
          })}

          {/* ── Stop 07 — 2028 · Loading… ────────────────────────── */}
          {(() => {
            const isActiveFuture = !pinned || active === journey.length;
            return (
              <article
                data-panel
                aria-label={`${journeyFuture.year} — next chapter`}
                className={`group relative shrink-0 ${PANEL_W} transition-[opacity,transform,filter] duration-700 ease-out ${focusClass(isActiveFuture)}`}
              >
                <p
                  className="text-gold-gradient relative z-[1] mb-5 mt-3 whitespace-nowrap leading-[0.85] tracking-[-0.055em] tabular-nums"
                  style={{
                    ...BLACK,
                    fontSize: "clamp(38px, 4.2vw, 64px)",
                  }}
                >
                  {journeyFuture.year}
                </p>

                <div className="relative z-[1]">
                  <motion.span
                    aria-hidden="true"
                    initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                    animate={
                      reduce
                        ? undefined
                        : isActiveFuture
                          ? { scale: 1, opacity: 1 }
                          : { scale: 0.55, opacity: 0 }
                    }
                    transition={{ type: "spring", stiffness: 320, damping: 20 }}
                    className={`absolute -top-8 left-6 z-[2] flex items-center justify-center rounded-full bg-[var(--bg2)] text-primary shadow-[0_0_0_5px_rgba(var(--primary-rgb)/0.13),0_0_24px_rgba(var(--accent-rgb)/0.4),var(--shadow-neu-sm)] ${MEDALLION.disc}`}
                  >
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
                  </motion.span>

                  <div className="journey-card relative w-full overflow-hidden rounded-2xl p-5 text-left sm:p-6 md:rounded-[22px]">
                    <span
                      aria-hidden="true"
                      className="grad-underline pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-50"
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
              </article>
            );
          })()}
        </motion.div>

        {/* ── Rail — comet head, clickable stops, scroll hint ─────── */}
        {pinned && (
          <div
            aria-label="Journey stops"
            className="relative z-[2] mb-6 flex shrink-0 items-center gap-4 px-6 sm:mb-8 sm:px-10 lg:px-16"
          >
            <span className="font-tag hidden items-center gap-1.5 text-[9px] tracking-[0.3em] text-muted-foreground/80 sm:flex">
              Scroll
              <motion.span
                animate={reduce ? undefined : { x: [0, 4, 0] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex"
              >
                <ArrowRight aria-hidden="true" className="h-3 w-3" />
              </motion.span>
            </span>

            <div className="relative h-8 flex-1">
              {/* hairline track */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[rgba(var(--primary-rgb)/0.16)]"
              />
              {/* progress fill */}
              <motion.span
                aria-hidden="true"
                style={{ scaleX: scrollYProgress }}
                className="grad-fill absolute inset-x-0 top-1/2 h-[2px] origin-left -translate-y-1/2 rounded-full opacity-80"
              />
              {/* comet head */}
              <motion.div
                aria-hidden="true"
                style={{ left: headLeft }}
                className="absolute top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2"
              >
                <span className="block h-3.5 w-3.5 rounded-full bg-[var(--accent-ref)] shadow-[0_0_18px_rgba(var(--accent-rgb)/0.9)]" />
                <span className="absolute -inset-2 -z-[1] rounded-full bg-[radial-gradient(circle,rgba(var(--accent-rgb)/0.4),transparent_65%)] blur-sm" />
              </motion.div>
              {/* stop dots — clickable, glide to the year */}
              {stops.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToStop(i)}
                  aria-label={`Go to stop ${String(i + 1).padStart(2, "0")}`}
                  className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ left: `${(s * 100).toFixed(2)}%` }}
                >
                  <span
                    className={`mx-auto block h-2 w-2 rounded-full transition-all duration-500 ${
                      i <= active
                        ? "scale-110 bg-primary shadow-[0_0_10px_rgba(var(--accent-rgb)/0.7)]"
                        : "bg-primary/25"
                    } ${i === active ? "!scale-150" : ""}`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

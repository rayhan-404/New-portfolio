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
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { useRef } from "react";
import { journey, journeyFuture } from "@/lib/portfolio-data";
import { Reveal } from "./reveal";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Line icons for the chapter medallions — each era's glyph lives in a
   raised neumorphic disc pinned to the trail spine (moved out of the
   title so the chapter headline reads clean and huge). */
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

/* Education chapters wear the reference's edu-card blue (#4267B2 family,
   exact ref values); life chapters stay on the rotating primary. */
const EDU_ICONS = new Set(["shapes", "school", "book", "gradcap"]);

/* Medallion geometry — the disc diameters per breakpoint; used to keep
   the spine-centring offsets in sync with the rendered size. */
const MEDALLION = {
  disc:
    "h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11",
  icon: "h-[17px] w-[17px] sm:h-[19px] sm:w-[19px]",
} as const;

/**
 * JourneySection — "My journey in the world", Milestone Trail edition.
 *
 * • The spine is a living progress trail: a hairline track with an
 *   accent fill that pours downward as you read, capped by a comet
 *   head (bright end + glow) that travels with the scroll (springed,
 *   transform-only — same mechanics as the nav rail's progress seam).
 * • Every chapter anchors to the trail with an ICON MEDALLION — a
 *   raised neu disc holding the era's glyph, tinted edu-blue for
 *   school chapters and pool-primary for life chapters — connected
 *   to its card by a soft gradient arm.
 * • Years are huge BLACK numerals rendered as outline→gradient
 *   crossfades: stroked when distant, filled with the brand gradient
 *   once the chapter lands in view (decorative duplicate carries the
 *   gradient; the accessible text stays a single plain string).
 * • Cards keep the site's journey-card recipe (raised glass, lift on
 *   hover, current-chapter ring) and gain a gradient crown hairline,
 *   a chapter index (01–06) and an accent-tinted tag chip; they slide
 *   in from their own side of the trail.
 * • The trail ends at the 2028 "Loading…" chapter: rocket medallion,
 *   gradient-filled year, softly blinking ellipsis.
 * • Every word of the original content is preserved verbatim.
 */
export function JourneySection() {
  const reduce = useReducedMotion();
  const trailRef = useRef<HTMLDivElement>(null);

  /* Scroll-linked trail fill — starts when the timeline's head clears
     the lower viewport, completes as its tail approaches mid-screen. */
  const { scrollYProgress } = useScroll({
    target: trailRef,
    offset: ["start 0.78", "end 0.6"],
  });
  const fill = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 26,
    mass: 0.4,
  });

  return (
    <section
      id="journey"
      aria-label="My journey"
      className="relative min-h-svh overflow-hidden px-5 py-24 sm:px-8 md:px-10 lg:py-32"
    >
      {/* Giant backdrop word — sits behind everything, all breakpoints */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 top-[30px] select-none whitespace-nowrap leading-[0.8] tracking-[-0.07em] text-foreground/[0.04]"
        style={{ ...BLACK, fontSize: "clamp(90px, 18vw, 260px)" }}
      >
        MY JOURNEY
      </span>

      <div className="relative z-[2] mx-auto max-w-6xl">
        {/* ── Header — just the title ────────────────────────── */}
        <Reveal>
          <header className="mb-16 max-w-[860px] lg:mb-24">
            {/* Eyebrow — the numbered-section system (02–05) lands on
                journey too, same recipe as the SectionHeading rows */}
            <div className="mb-5 flex items-center gap-3">
              <span
                className="h-px w-10"
                style={{ background: "linear-gradient(90deg, transparent, var(--gold))" }}
                aria-hidden="true"
              />
              <p className="font-tag text-[10.5px] font-bold text-accent-ink">
                02 · The Story So Far
              </p>
            </div>
            <h2
              className="leading-[0.88] tracking-[-0.055em] text-foreground"
              style={{ ...BLACK, fontSize: "clamp(44px, 7.5vw, 104px)" }}
            >
              My journey
              <br />
              <em className="font-serif font-normal italic tracking-[-0.04em]">
                in the world
              </em>
            </h2>

            {/* Gold swash — the same hand-drawn stroke as the hero's
                "Hello..", drawing itself in when the title lands */}
            <motion.svg
              viewBox="0 0 180 14"
              aria-hidden="true"
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-5 block h-[15px] w-[172px] sm:w-[200px]"
            >
              <motion.path
                d="M4 9 C 38 3, 74 12.5, 110 7.5 S 168 4.5, 176 7"
                fill="none"
                stroke="url(#journey-swash-gold)"
                strokeWidth="3.5"
                strokeLinecap="round"
                initial={reduce ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.9, delay: 0.55, ease: EASE }}
              />
              <defs>
                <linearGradient id="journey-swash-gold" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" style={{ stopColor: "var(--primary2-ref)" }} />
                  <stop offset="55%" style={{ stopColor: "var(--primary)" }} />
                  <stop offset="100%" style={{ stopColor: "var(--accent-ref)" }} />
                </linearGradient>
              </defs>
            </motion.svg>
          </header>
        </Reveal>

        {/* ── Timeline — the Milestone Trail ─────────────────── */}
        <div ref={trailRef} className="relative mx-auto max-w-[1200px]">
          {/* the trail — center on desktop, left rail on mobile */}
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-[15px] top-0 z-0 w-px bg-[linear-gradient(to_bottom,transparent,rgba(var(--primary-rgb)/0.28)_5%,rgba(var(--primary-rgb)/0.22)_95%,transparent)] md:left-1/2 md:-translate-x-1/2"
          />

          {/* The pour — scroll-linked accent fill with a comet head.
              Transform-only (scaleY origin-top), springed like the nav
              rail's seam; the bright cap at the bar's foot is the head. */}
          {!reduce && (
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-[13.5px] top-0 z-[2] w-[4px] md:left-1/2 md:-translate-x-1/2"
            >
              <motion.div
                style={{ scaleY: fill }}
                className="relative h-full w-full origin-top rounded-full bg-[linear-gradient(to_bottom,transparent_0%,rgba(var(--primary-rgb)/0.55)_7%,var(--primary)_62%,var(--primary2-ref)_92%,var(--accent-ref)_100%)]"
              >
                <span className="absolute -bottom-3 left-1/2 h-12 w-12 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(var(--accent-rgb)/0.5),transparent_65%)] blur-md" />
              </motion.div>
            </div>
          )}

          {journey.map((era, idx) => {
            const isLeft = idx % 2 === 0;
            const EraIcon = TITLE_ICONS[era.icon];
            const isEdu = EDU_ICONS.has(era.icon);
            const chapter = String(idx + 1).padStart(2, "0");
            const medallionTint = isEdu
              ? "text-[#4267B2] shadow-[0_0_0_5px_rgba(66,103,178,0.13),0_0_24px_rgba(66,103,178,0.4),var(--shadow-neu-sm)]"
              : "text-primary shadow-[0_0_0_5px_rgba(var(--primary-rgb)/0.13),0_0_24px_rgba(var(--accent-rgb)/0.4),var(--shadow-neu-sm)]";
            return (
              <Reveal key={era.period}>
                <article
                  className={`group relative mb-16 w-full pl-[60px] md:mb-[96px] md:w-1/2 md:min-h-[230px] md:pl-0 ${
                    isLeft
                      ? "md:pr-[72px] md:text-right lg:pr-[90px]"
                      : "md:ml-[50%] md:pl-[72px] lg:pl-[90px]"
                  }`}
                >
                  {/* Ghost year — static headline on mobile, huge
                      floating numeral beside the trail on desktop.
                      Outline by default; once the chapter lands the
                      brand gradient pours into the numerals (a
                      decorative duplicate carries the fill — the
                      accessible string stays single and plain). */}
                  <p
                    className={`relative z-[1] mb-2.5 block whitespace-nowrap text-[38px] leading-[0.9] tracking-[-0.07em] tabular-nums transition-transform duration-500 group-hover:-translate-y-1 sm:text-[clamp(48px,12vw,72px)] md:absolute md:top-[-46px] md:mb-0 md:text-[clamp(54px,5.5vw,84px)] md:leading-none ${
                      isLeft ? "md:right-[25px]" : "md:left-[25px]"
                    }`}
                    style={BLACK}
                  >
                    <span className="text-outline block">{era.period}</span>
                    <motion.span
                      aria-hidden="true"
                      initial={reduce ? false : { opacity: 0, scale: 1.05 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: "-70px" }}
                      transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
                      className="text-gold-gradient absolute inset-0 block"
                    >
                      {era.period}
                    </motion.span>
                  </p>

                  {/* Connector arm — soft hairline from the trail to
                      the card, gradient ebbing away from the node
                      (desktop only — on mobile the card follows the
                      year below the node, so there is nothing to
                      bridge) */}
                  <span
                    aria-hidden="true"
                    className={`absolute top-[9px] z-[1] hidden h-px md:block ${
                      isLeft
                        ? "md:right-0 md:w-[68px] md:bg-[linear-gradient(270deg,rgba(var(--primary-rgb)/0.45),transparent)] lg:w-[86px]"
                        : "md:left-0 md:w-[68px] md:bg-[linear-gradient(90deg,rgba(var(--primary-rgb)/0.45),transparent)] lg:w-[86px]"
                    }`}
                  />

                  {/* Icon medallion — the chapter's glyph riding the
                      trail, popped in with a spring when it lands */}
                  <motion.span
                    aria-hidden="true"
                    initial={reduce ? false : { scale: 0.3, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-70px" }}
                    transition={{ type: "spring", stiffness: 320, damping: 20, delay: 0.08 }}
                    className={`absolute z-[4] flex items-center justify-center rounded-full bg-[var(--bg2)] ${MEDALLION.disc} ${medallionTint} max-md:-left-[3px] max-md:top-[6px] sm:max-md:-left-[5px] ${
                      isLeft ? "md:right-0 md:translate-x-1/2" : "md:left-0 md:-translate-x-1/2"
                    } md:top-[-12px]`}
                  >
                    {EraIcon && (
                      <EraIcon aria-hidden="true" strokeWidth={2.25} className={MEDALLION.icon} />
                    )}
                  </motion.span>

                  {/* Card — the site's liquid-glass recipe, kept compact,
                      sliding in from its own side of the trail */}
                  <motion.div
                    initial={reduce ? false : { opacity: 0, x: isLeft ? -48 : 48 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.75, delay: 0.05, ease: EASE }}
                    className="relative z-[2]"
                  >
                    <div
                      className={`journey-card relative w-full max-w-[470px] overflow-hidden rounded-2xl p-5 text-left sm:p-6 md:rounded-[22px] md:ml-auto ${
                        era.current ? "journey-card--current p-6 sm:p-7" : ""
                      } ${isLeft ? "" : "md:ml-0"}`}
                    >
                      {/* Gradient crown — a thin brand pour along the
                          card's top edge, visible immediately */}
                      <span
                        aria-hidden="true"
                        className="grad-underline pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-50"
                      />

                      {/* Education corner blobs — ref .edu-card::before/::after
                          (blue gradient, 0.08 / 0.06 opacity, exact hues) */}
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

                      {/* Chapter index — 01…06, tucked in the corner */}
                      <span
                        aria-hidden="true"
                        className="font-tag absolute right-5 top-5 text-[10px] tracking-[0.3em] text-accent-ink/70 sm:right-6 sm:top-6"
                      >
                        {chapter}
                      </span>

                      {era.current && (
                        <div className="mb-4 inline-flex items-center gap-2.5 font-tag text-[9px] tracking-[0.22em] text-accent-ink">
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
                            ? "text-[clamp(28px,4vw,50px)]"
                            : "text-[clamp(24px,3.1vw,38px)]"
                        }`}
                      >
                        {era.title}
                      </h3>

                      {/* School name / sub-title — ref edu-school is #4267B2,
                          experience places stay primary-toned */}
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
                          className={`mt-4 border-l-2 px-3.5 py-2.5 font-mono text-[11px] leading-[1.5] text-foreground/90 ${
                            isEdu
                              ? "border-[#4267B2]/60 bg-[#4267B2]/[0.06]"
                              : "border-primary/60 bg-primary/[0.06]"
                          }`}
                        >
                          {era.degree}
                        </div>
                      )}

                      <p className="mt-4 max-w-[390px] text-[14px] leading-[1.6] text-foreground/70">
                        {era.description}
                      </p>

                      <span className="mt-4 inline-block rounded-full border border-primary/25 bg-primary/[0.07] px-3 py-1.5 font-tag text-[9.5px] tracking-[0.22em] text-accent-ink transition-colors duration-300">
                        {era.tag}
                      </span>
                    </div>
                  </motion.div>
                </article>
              </Reveal>
            );
          })}

          {/* ── Future — 2028 · Loading… ──────────────────────── */}
          <Reveal>
            <div className="relative max-md:pl-[60px]">
              {/* Rocket medallion where the trail meets the future */}
              <motion.span
                aria-hidden="true"
                initial={reduce ? false : { scale: 0.3, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "-70px" }}
                transition={{ type: "spring", stiffness: 320, damping: 20, delay: 0.08 }}
                className="absolute -top-[18px] z-[4] flex items-center justify-center rounded-full bg-[var(--bg2)] text-primary shadow-[0_0_0_5px_rgba(var(--primary-rgb)/0.13),0_0_24px_rgba(var(--accent-rgb)/0.4),var(--shadow-neu-sm)] max-md:-left-[3px] max-md:h-9 max-md:w-9 sm:max-md:-left-[5px] sm:max-md:h-10 sm:max-md:w-10 md:left-1/2 md:top-[-22px] md:h-11 md:w-11 md:-translate-x-1/2"
              >
                <Rocket aria-hidden="true" strokeWidth={2.25} className="h-[17px] w-[17px] sm:h-[19px] sm:w-[19px]" />
              </motion.span>

              <div className="journey-card relative flex flex-col gap-7 overflow-hidden rounded-2xl py-14 sm:px-0 md:flex-row md:items-center md:gap-11 md:rounded-[22px] md:py-[72px] lg:px-[4%]">
                <span
                  aria-hidden="true"
                  className="grad-underline pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-50"
                />
                <div className="relative max-md:pl-6 sm:px-6 md:pl-[8%] lg:pl-[6%]">
                  <p
                    aria-hidden="true"
                    className="relative whitespace-nowrap text-[clamp(72px,10vw,145px)] leading-[0.8] tracking-[-0.08em] tabular-nums"
                    style={BLACK}
                  >
                    <span className="text-outline block">
                      {journeyFuture.year}
                    </span>
                    <motion.span
                      aria-hidden="true"
                      initial={reduce ? false : { opacity: 0, scale: 1.05 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: "-70px" }}
                      transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
                      className="text-gold-gradient absolute inset-0 block"
                    >
                      {journeyFuture.year}
                    </motion.span>
                  </p>
                </div>

                <div className="relative max-md:pl-6 sm:px-6 md:pr-[8%] lg:pr-[6%]">
                  <p className="font-tag text-[9px] tracking-[0.3em] text-muted-foreground">
                    {journeyFuture.label}
                  </p>
                  <h3
                    className="my-2.5 leading-[0.9] tracking-[-0.055em] text-foreground"
                    style={{ ...BLACK, fontSize: "clamp(38px, 5vw, 70px)" }}
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
                  <p className="text-[15px] leading-relaxed text-foreground/65">
                    {journeyFuture.description}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

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
import { motion, useReducedMotion } from "framer-motion";
import { journey, journeyFuture } from "@/lib/portfolio-data";
import { Reveal } from "./reveal";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Line icons for the chapter titles — stroke glyphs inherit the white
   title color, sized in em so they scale with the clamp() title. */
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
   exact ref values); life chapters stay on the deep-orange primary. */
const EDU_ICONS = new Set(["shapes", "school", "book", "gradcap"]);

/**
 * JourneySection — "My journey in the world"
 * Transparent field that melts into the site's own background: giant
 * MY JOURNEY backdrop, a centered spine on desktop (left rail on mobile),
 * huge ghost years, glowing dots, compact frosted-glass cards with
 * monochrome emoji titles in the site's own card recipe.
 * Ends with the "2028 · Loading..." next-chapter strip.
 */
export function JourneySection() {
  const reduce = useReducedMotion();

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
            <h1
              className="leading-[0.88] tracking-[-0.055em] text-foreground"
              style={{ ...BLACK, fontSize: "clamp(44px, 7.5vw, 104px)" }}
            >
              My journey
              <br />
              <em className="font-serif font-normal italic tracking-[-0.04em]">
                in the world
              </em>
            </h1>

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
                  <stop offset="0%" stopColor="#f4511e" />
                  <stop offset="55%" stopColor="#ff7043" />
                  <stop offset="100%" stopColor="#ff9800" />
                </linearGradient>
              </defs>
            </motion.svg>
          </header>
        </Reveal>

        {/* ── Timeline ───────────────────────────────────────── */}
        <div className="relative mx-auto max-w-[1200px]">
          {/* the spine — center on desktop, left rail on mobile */}
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-[15px] top-0 w-px bg-[linear-gradient(to_bottom,transparent,rgba(230,74,25,0.4)_5%,rgba(230,74,25,0.3)_95%,transparent)] md:left-1/2 md:-translate-x-1/2"
          />

          {journey.map((era, idx) => {
            const isLeft = idx % 2 === 0;
            const TitleIcon = TITLE_ICONS[era.icon];
            const isEdu = EDU_ICONS.has(era.icon);
            return (
              <Reveal key={era.period}>
                <article
                  className={`group relative mb-14 w-full pl-[52px] md:mb-[84px] md:w-1/2 md:min-h-[230px] md:pl-0 ${
                    isLeft
                      ? "md:pr-[72px] md:text-right lg:pr-[90px]"
                      : "md:ml-[50%] md:pl-[72px] lg:pl-[90px]"
                  }`}
                >
                  {/* Ghost year — static headline on mobile, huge
                      floating numeral beside the spine on desktop.
                      Desktop size is capped so the full "2005 — 2007"
                      range always fits inside its half of the timeline
                      (larger sizes clip under the sidebar/rail glass). */}
                  <p
                    aria-hidden="true"
                    className={`relative z-[1] mb-2.5 block whitespace-nowrap text-[38px] leading-[0.9] tracking-[-0.07em] text-foreground/[0.14] transition-[color,transform] duration-500 group-hover:-translate-y-1 group-hover:text-foreground/[0.24] sm:text-[clamp(48px,12vw,72px)] md:absolute md:top-[-42px] md:mb-0 md:text-[clamp(54px,5.5vw,84px)] md:leading-none md:text-foreground/[0.07] md:group-hover:text-foreground/[0.13] ${
                      isLeft ? "md:right-[25px]" : "md:left-[25px]"
                    }`}
                    style={BLACK}
                  >
                    {era.period}
                  </p>

                  {/* Dot on the spine — blue for school chapters, primary for life */}
                  <span
                    aria-hidden="true"
                    className={`absolute top-[9px] z-[4] h-3 w-3 rounded-full max-md:left-[9px] ${
                      isEdu
                        ? "bg-[#4267B2] shadow-[0_0_0_5px_rgba(66,103,178,0.14),0_0_25px_rgba(66,103,178,0.45)]"
                        : "bg-primary shadow-[0_0_0_5px_rgba(230,74,25,0.14),0_0_25px_rgba(255,152,0,0.45)]"
                    } ${isLeft ? "md:-right-[6px]" : "md:-left-[6px]"}`}
                  />

                  {/* Card — the site's liquid-glass recipe, kept compact */}
                  <div
                    className={`journey-card relative z-[2] w-full max-w-[470px] overflow-hidden rounded-[22px] p-5 text-left sm:p-6 md:ml-auto ${
                      era.current
                        ? "journey-card--current p-6 sm:p-7"
                        : ""
                    } ${isLeft ? "" : "md:ml-0"}`}
                  >
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
                    {era.current && (
                      <div className="mb-4 inline-flex items-center gap-2.5 font-tag text-[9px] tracking-[0.22em] text-primary">
                        <span
                          aria-hidden="true"
                          className="journey-pulse h-[7px] w-[7px] rounded-full bg-primary shadow-[0_0_0_4px_rgba(230,74,25,0.14),0_0_16px_rgba(255,152,0,0.8)]"
                        />
                        Currently here
                      </div>
                    )}

                    <h2
                      className={`font-display uppercase leading-[0.95] tracking-[-0.045em] text-foreground ${
                        era.current
                          ? "text-[clamp(28px,4vw,50px)]"
                          : "text-[clamp(24px,3.1vw,38px)]"
                      }`}
                    >
                      {TitleIcon && (
                        <TitleIcon
                          aria-hidden="true"
                          strokeWidth={2.25}
                          className={`mr-2 inline-block h-[0.82em] w-[0.82em] align-[-0.08em] ${
                            isEdu ? "text-[#4267B2]" : ""
                          }`}
                        />
                      )}
                      {era.title}
                    </h2>

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

                    <span className="mt-4 inline-block rounded-full border border-border bg-[var(--bg2)] px-[11px] py-[6px] font-tag text-[8px] tracking-[0.22em] text-muted-foreground shadow-[var(--shadow-neu-sm)]">
                      {era.tag}
                    </span>
                  </div>
                </article>
              </Reveal>
            );
          })}

          {/* ── Future — 2028 · Loading… ──────────────────────── */}
          <Reveal>
            <div className="relative flex flex-col gap-7 border-y border-border py-14 max-md:pl-[52px] sm:px-0 md:flex-row md:items-center md:gap-11 md:py-[72px] lg:px-[4%]">
              <p
                aria-hidden="true"
                className="whitespace-nowrap leading-[0.8] tracking-[-0.08em] text-foreground/[0.1]"
                style={{ ...BLACK, fontSize: "clamp(72px, 10vw, 145px)" }}
              >
                {journeyFuture.year}
              </p>

              <div>
                <p className="font-tag text-[9px] tracking-[0.3em] text-muted-foreground">
                  {journeyFuture.label}
                </p>
                <h2
                  className="my-2.5 leading-[0.9] tracking-[-0.055em] text-foreground"
                  style={{ ...BLACK, fontSize: "clamp(38px, 5vw, 70px)" }}
                >
                  {(() => {
                    const FutureIcon = TITLE_ICONS[journeyFuture.icon];
                    return (
                      <>
                        {FutureIcon && (
                          <FutureIcon
                            aria-hidden="true"
                            strokeWidth={2.25}
                            className="mr-3 inline-block h-[0.82em] w-[0.82em] align-[-0.08em]"
                          />
                        )}
                        {journeyFuture.title}
                      </>
                    );
                  })()}
                  <span className="opacity-40">...</span>
                </h2>
                <p className="text-[15px] leading-relaxed text-foreground/65">
                  {journeyFuture.description}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

"use client";

import { journey } from "@/lib/portfolio-data";
import { Reveal, StaggerGroup, StaggerItem } from "./reveal";

/**
 * JourneySection — "Life / Journey." personal timeline.
 * Ghost watermark sits at 5% opacity, single line, hidden on mobile.
 */
export function JourneySection() {
  return (
    <section
      id="journey"
      aria-label="My journey"
      className="relative overflow-hidden px-5 py-24 sm:px-8 md:px-10 lg:py-32"
    >
      {/* Ghost watermark — single line, 5% opacity, desktop only */}
      <span
        aria-hidden="true"
        className="font-display pointer-events-none absolute -right-8 top-10 hidden select-none whitespace-nowrap text-[clamp(80px,12vw,185px)] leading-none text-white/[0.05] sm:block"
      >
        JOURNEY
      </span>

      <div className="relative mx-auto max-w-6xl">
        {/* Heading — "Life / Journey." with the gold serif period */}
        <Reveal>
          <div className="flex items-center gap-3">
            <span
              className="h-px w-10"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--gold))",
              }}
              aria-hidden="true"
            />
            <p className="font-tag text-[10.5px] font-bold text-gold-bright">
              02 · The Road So Far
            </p>
          </div>
          <h2 className="font-display text-glow mt-4 text-3xl leading-[1.04] tracking-tight text-foreground sm:text-4xl lg:text-[2.9rem]">
            Life <span className="text-white/35">/</span>{" "}
            <span className="font-serif font-normal italic tracking-[-0.01em]">
              Journey<span className="text-gold-gradient">.</span>
            </span>
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/70">
            Every product I ship carries a piece of this road — from
            dismantled radios to a studio of my own.
          </p>
        </Reveal>

        {/* Timeline */}
        <StaggerGroup className="relative mt-12 flex flex-col gap-4">
          {/* rail connecting the chapter nodes */}
          <span
            aria-hidden="true"
            className="absolute bottom-8 left-[27px] top-8 w-px bg-gradient-to-b from-gold/60 via-white/20 to-transparent sm:left-[31px]"
          />

          {journey.map((era, i) => (
            <StaggerItem key={era.chapter}>
              <article className="glass group relative flex items-start gap-4 rounded-3xl p-5 transition-all duration-500 hover:-translate-y-1 hover:border-white/45 sm:gap-6 sm:p-6">
                {/* chapter node */}
                <span
                  aria-hidden="true"
                  className="font-tag relative z-10 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-white/25 bg-[#3a0d05]/80 text-[8px] text-gold-bright shadow-[0_0_16px_rgba(255,170,80,0.25)] sm:h-[30px] sm:w-[30px] sm:text-[9px]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* emoji + chapter pill */}
                    <span className="glass-chip font-tag inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] text-white/75">
                      <span aria-hidden="true" className="text-[11px] not-italic">
                        {era.emoji}
                      </span>
                      {era.chapter}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-px w-6 bg-white/20 transition-all duration-500 group-hover:w-10 group-hover:bg-gold/70"
                    />
                  </div>

                  <h3 className="font-display mt-3 text-lg tracking-tight sm:text-xl">
                    {era.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
                    {era.description}
                  </p>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}

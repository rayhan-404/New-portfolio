"use client";

import { journey } from "@/lib/portfolio-data";
import { Reveal, StaggerGroup, StaggerItem } from "./reveal";

/**
 * JourneySection — "Life / Journey." personal timeline.
 * Centered vertical rail: year → node → title → place → note.
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
            From a village in Shyamnagar to a CSE classroom in Khulna — the
            road so far.
          </p>
        </Reveal>

        {/* Centered timeline rail */}
        <div className="relative mx-auto mt-14 max-w-md">
          {/* continuous rail */}
          <span
            aria-hidden="true"
            className="absolute bottom-4 left-1/2 top-2 w-px -translate-x-1/2 bg-gradient-to-b from-gold/60 via-white/25 to-transparent"
          />

          <StaggerGroup className="relative flex flex-col gap-12">
            {journey.map((era) => (
              <StaggerItem key={era.period}>
                <div className="relative flex flex-col items-center text-center">
                  {/* year */}
                  <p className="font-tag bg-transparent text-[10px] text-gold-bright">
                    {era.period}
                  </p>

                  {/* node on the rail */}
                  <span
                    aria-hidden="true"
                    className="relative my-3 flex h-[18px] w-[18px] items-center justify-center"
                  >
                    <span
                      className={`absolute inset-0 rounded-full border-2 ${
                        era.current
                          ? "border-apple-green/70 bg-apple-green/15 shadow-[0_0_18px_rgba(48,209,88,0.55)]"
                          : "border-gold/60 bg-[#3a0d05]"
                      }`}
                    />
                    <span
                      className={`h-[6px] w-[6px] rounded-full ${
                        era.current
                          ? "bg-apple-green shadow-[0_0_10px_rgba(48,209,88,0.9)]"
                          : "bg-gold shadow-[0_0_12px_rgba(255,196,107,0.9)]"
                      }`}
                    />
                  </span>

                  {/* title + place */}
                  <h3 className="font-display text-[1.15rem] uppercase leading-tight tracking-[0.06em] text-foreground sm:text-[1.3rem]">
                    {era.title}
                  </h3>
                  <p className="mt-1.5 text-sm font-medium text-white/85">
                    {era.place}
                  </p>
                  {era.description && (
                    <p className="mt-1.5 text-[13px] leading-relaxed text-white/60">
                      {era.description}
                    </p>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}

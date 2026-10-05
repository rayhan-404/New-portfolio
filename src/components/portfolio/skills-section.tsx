"use client";

import { FlaskConical, Wrench } from "lucide-react";
import { marqueeStack } from "@/lib/portfolio-data";
import { useSiteContent } from "@/lib/use-site-data";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import { SectionNumber } from "./section-number";
import { Spotlight } from "./spotlight";

/**
 * Skills (v94) — the honest stack.
 *
 *   · No percentage bars, no ring gauges, no "proficiency" scores —
 *     a recruiter can't fact-check a number, and inflating one is
 *     the fastest way to lose the room.
 *   · "In practice" — headline skills, each with a one-line answer
 *     to "what do you actually build with it?"
 *   · "The stack" — CORE / FRONTEND / BACKEND / DATABASE / TOOLS
 *     as plain grouped lists, exactly what the projects use.
 *   · "Currently learning" strip closes the card — ambition stated
 *     honestly instead of claimed as skill.
 *   · The tech marquee closes the section (hover pauses it).
 *
 * Everything is editable in Admin → Skills; the honest defaults
 * render until the fetch lands.
 */

const PRINCIPLES = [
  "Type-safe from database to pixel",
  "Performance budgets on every build",
  "Accessible by default — WCAG 2.1 AA",
  "Ship small, measure, iterate",
];

/* ── section ──────────────────────────────────────────────────── */

export function SkillsSection() {
  const { skills } = useSiteContent();

  return (
    <section
      id="skills"
      aria-label="Skills and stack"
      className="relative scroll-mt-20 overflow-hidden px-5 py-16 sm:px-8 sm:py-24 md:px-10 lg:py-32"
    >
      {/* ghost numeral — 5% backward parallax */}
      <SectionNumber
        index="04"
        className="-top-4 right-0 hidden text-[11rem] lg:block"
      />

      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="04 · The Stack"
          title="A stack kept honest."
          description="Every tool below shows up in the projects above — the rest lives on the learning list. No numbers, because numbers don't survive a tech interview."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-12">
          {/* ── In practice — headline skills with one-liners ───── */}
          <Reveal className="lg:col-span-7">
            <div className="glass neu-decor group spot-host relative h-full overflow-hidden rounded-2xl md:rounded-3xl p-6 sm:p-8">
              <Spotlight />
              <div className="flex items-center justify-between gap-3">
                <p className="font-tag text-[10px] text-accent-ink">In practice</p>
                <span className="glass-chip font-tag rounded-full px-3 py-1 text-[9px] text-muted-foreground">
                  what I build with
                </span>
              </div>

              <div className="mt-6 flex flex-col">
                {skills.focus.map((skill, i) => (
                  <div
                    key={`${skill.name}-${i}`}
                    className={`group/item py-4 transition-colors duration-300 ${
                      i > 0 ? "border-t border-border/70" : "pt-0"
                    } ${i === skills.focus.length - 1 ? "pb-1" : ""}`}
                  >
                    <h3 className="flex items-baseline gap-2.5 text-[17px] font-semibold tracking-tight text-foreground transition-colors duration-300 group-hover/item:text-primary sm:text-lg">
                      {skill.name}
                    </h3>
                    <p className="mt-1.5 max-w-[46ch] text-[13.5px] leading-relaxed text-muted-foreground transition-colors duration-300 group-hover/item:text-foreground/85 sm:text-sm">
                      {skill.blurb}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* ── How I work — principles on the ember panel ──────── */}
          <Reveal delay={0.1} className="lg:col-span-5">
            <div className="glass-ember group spot-host relative flex h-full flex-col overflow-hidden rounded-2xl md:rounded-3xl p-6 sm:p-8">
              <Spotlight />
              <span
                aria-hidden="true"
                className="glass-chip orb-float-slow absolute right-6 top-6 rounded-full px-3 py-1.5 text-[10px] font-semibold text-foreground"
              >
                WCAG 2.1 AA
              </span>
              <p className="font-tag text-[10px] text-accent-ink">How I work</p>
              <ul className="mt-5 flex flex-1 flex-col justify-center gap-4">
                {PRINCIPLES.map((line, i) => (
                  <li key={line} className="flex items-start gap-3.5 text-sm text-foreground/90">
                    <span className="font-tag mt-[1px] shrink-0 text-[9px] tabular-nums text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* ── The stack — grouped lists, plain and scannable ──── */}
          {skills.groups.length > 0 && (
            <Reveal className="lg:col-span-12">
              <div className="glass neu-decor spot-host relative overflow-hidden rounded-2xl md:rounded-3xl p-6 sm:p-8">
                <Spotlight />
                <div className="flex items-center justify-between gap-3">
                  <p className="font-tag flex items-center gap-2 text-[10px] text-accent-ink">
                    <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                    The stack
                  </p>
                  <span className="glass-chip font-tag hidden rounded-full px-3 py-1 text-[9px] text-muted-foreground sm:inline">
                    in real use
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
                  {skills.groups.map((group) => (
                    <div key={group.label} className="min-w-0">
                      <p className="font-tag border-b border-border/70 pb-2 text-[9.5px] tracking-[0.22em] text-accent-ink">
                        {group.label.toUpperCase()}
                      </p>
                      <ul className="mt-3 flex flex-col gap-1.5">
                        {group.items.map((item) => (
                          <li
                            key={item}
                            className="text-[13.5px] font-medium leading-snug text-foreground/85 sm:text-sm"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {skills.learning.length > 0 && (
                  <div className="mt-7 flex flex-col gap-2 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:gap-4">
                    <p className="font-tag flex shrink-0 items-center gap-2 text-[9.5px] tracking-[0.22em] text-accent-ink">
                      <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
                      Currently learning
                    </p>
                    <p className="text-[13.5px] font-medium text-muted-foreground sm:text-sm">
                      {skills.learning.join(" · ")}
                    </p>
                  </div>
                )}
              </div>
            </Reveal>
          )}
        </div>
      </div>

      {/* Tech marquee — hover pauses the strip */}
      <div className="marquee-mask relative mt-14 overflow-hidden py-2" aria-hidden="true">
        <div className="animate-marquee flex w-max items-center gap-10 hover:[animation-play-state:paused]">
          {[...marqueeStack, ...marqueeStack].map((tech, i) => (
            <span
              key={`${tech}-${i}`}
              className="font-tag flex items-center gap-10 text-[11px] text-muted-foreground"
            >
              {tech}
              <span className="h-1.5 w-1.5 rotate-45 bg-gold/60" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

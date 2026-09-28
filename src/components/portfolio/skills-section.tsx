"use client";

import { motion, useReducedMotion } from "framer-motion";
import { skillChips, skillMeters, marqueeStack } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";
import { Reveal, StaggerGroup, StaggerItem } from "./reveal";
import { SectionHeading } from "./section-heading";
import { SectionNumber } from "./section-number";

export function SkillsSection() {
  const reduce = useReducedMotion();

  return (
    <section
      id="skills"
      aria-label="Skills and expertise"
      className="relative scroll-mt-20 overflow-hidden px-5 py-24 sm:px-8 md:px-10 lg:py-32"
    >
      {/* ghost numeral — 5% backward parallax */}
      <SectionNumber
        index="04"
        className="-top-4 right-0 hidden text-[11rem] lg:block"
      />

      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="04 · Weapons Of Choice"
          title="A stack sharpened by shipping."
          description="Depth where it matters — architecture, performance, and interfaces that feel inevitable."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          {/* Meters */}
          <Reveal>
            <div className="glass neu-decor h-full rounded-3xl p-6 sm:p-8">
              <p className="font-tag text-[10px] text-gold-bright">Core proficiency</p>
              <div className="mt-7 flex flex-col gap-6">
                {skillMeters.map((skill, i) => (
                  <div key={skill.name}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-medium text-foreground/95">{skill.name}</span>
                      <span className="font-tag text-[10px] tabular-nums text-muted-foreground">
                        {skill.level}%
                      </span>
                    </div>
                    <div
                      className="neu-inset mt-2.5 h-[8px] overflow-hidden rounded-full"
                      role="progressbar"
                      aria-valuenow={skill.level}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${skill.name} proficiency`}
                    >
                      <motion.div
                        className="relative h-full rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright"
                        initial={reduce ? false : { width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 1.15, delay: 0.08 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                          style={reduce ? undefined : { animation: "sheen 2.6s ease-in-out infinite", animationDelay: `${i * 0.4}s` }}
                        />
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Chips + principles */}
          <div className="flex flex-col gap-4">
            <StaggerGroup className="glass neu-decor rounded-3xl p-6 sm:p-8">
              <p className="font-tag text-[10px] text-gold-bright">Also in the toolbox</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {skillChips.map((chip) => (
                  <StaggerItem key={chip}>
                    <button
                      onClick={() => playSound("tap")}
                      className="glass-chip font-tag rounded-full px-3.5 py-2 text-[9.5px] text-foreground/75 transition-all duration-300 hover:text-primary active:scale-95"
                    >
                      {chip}
                    </button>
                  </StaggerItem>
                ))}
              </div>
            </StaggerGroup>

            <Reveal delay={0.1}>
              <div className="glass-ember relative overflow-hidden rounded-3xl p-6 sm:p-8">
                <span
                  aria-hidden="true"
                  className="glass-chip orb-float-slow absolute right-6 top-6 rounded-full px-3 py-1.5 text-[10px] font-semibold text-foreground"
                >
                  WCAG 2.1 AA
                </span>
                <p className="font-tag text-[10px] text-gold-bright">How I work</p>
                <ul className="mt-4 flex flex-col gap-3.5">
                  {[
                    "Type-safe from database to pixel",
                    "Performance budgets on every build",
                    "Accessible by default — WCAG 2.1 AA",
                    "Ship small, measure, iterate",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-3 text-sm text-foreground/90">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" aria-hidden="true" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
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

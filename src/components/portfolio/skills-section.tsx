"use client";

import { motion, useReducedMotion } from "framer-motion";
import { skillChips, skillMeters, marqueeStack } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";
import { Reveal, StaggerGroup, StaggerItem } from "./reveal";
import { SectionHeading } from "./section-heading";

export function SkillsSection() {
  const reduce = useReducedMotion();

  return (
    <section
      id="skills"
      aria-label="Skills and expertise"
      className="relative scroll-mt-20 px-5 py-24 sm:px-8 md:px-10 lg:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="03 · Weapons Of Choice"
          title="A stack sharpened by shipping."
          description="Depth where it matters — architecture, performance, and interfaces that feel inevitable."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          {/* Meters */}
          <Reveal>
            <div className="panel h-full rounded-3xl p-6 sm:p-8">
              <p className="font-tag text-[10px] text-ember">Core proficiency</p>
              <div className="mt-7 flex flex-col gap-6">
                {skillMeters.map((skill, i) => (
                  <div key={skill.name}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="font-tag text-[10px] text-muted-foreground">
                        {skill.level}%
                      </span>
                    </div>
                    <div
                      className="mt-2.5 h-[6px] overflow-hidden rounded-full bg-[rgba(243,236,227,0.07)]"
                      role="progressbar"
                      aria-valuenow={skill.level}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${skill.name} proficiency`}
                    >
                      <motion.div
                        className="relative h-full rounded-full bg-gradient-to-r from-ember-deep via-ember to-ember-bright"
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
            <StaggerGroup className="panel rounded-3xl p-6 sm:p-8">
              <p className="font-tag text-[10px] text-ember">Also in the toolbox</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {skillChips.map((chip) => (
                  <StaggerItem key={chip}>
                    <button
                      onClick={() => playSound("tap")}
                      className="font-tag rounded-full border border-[var(--line)] px-3.5 py-2 text-[9.5px] text-muted-foreground transition-all duration-300 hover:border-ember/60 hover:text-foreground active:scale-95"
                    >
                      {chip}
                    </button>
                  </StaggerItem>
                ))}
              </div>
            </StaggerGroup>

            <Reveal delay={0.1}>
              <div className="panel-ember relative overflow-hidden rounded-3xl p-6 sm:p-8">
                <span
                  aria-hidden="true"
                  className="pixel pixel-float absolute right-6 top-6 h-3 w-3"
                />
                <p className="font-tag text-[10px] text-ember-bright">How I work</p>
                <ul className="mt-4 flex flex-col gap-3.5">
                  {[
                    "Type-safe from database to pixel",
                    "Performance budgets on every build",
                    "Accessible by default — WCAG 2.1 AA",
                    "Ship small, measure, iterate",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-3 text-sm text-foreground/90">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-ember" aria-hidden="true" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Tech marquee */}
      <div className="marquee-mask relative mt-14 overflow-hidden py-2" aria-hidden="true">
        <div className="animate-marquee flex w-max items-center gap-10">
          {[...marqueeStack, ...marqueeStack].map((tech, i) => (
            <span
              key={`${tech}-${i}`}
              className="font-tag flex items-center gap-10 text-[11px] text-muted-foreground/60"
            >
              {tech}
              <span className="h-1.5 w-1.5 rotate-45 bg-ember/50" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Boxes, ShieldCheck, Wrench } from "lucide-react";
import { skillChips, skillMeters } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";
import { Reveal, StaggerGroup, StaggerItem } from "./reveal";
import { SectionHeading } from "./section-heading";

const principles = [
  { icon: ShieldCheck, title: "End-to-End Type Safety", desc: "Strict TypeScript from database to UI." },
  { icon: Boxes, title: "Modular Architecture", desc: "Composable systems that scale with teams." },
  { icon: BadgeCheck, title: "Modern Standards", desc: "WCAG AA, Core Web Vitals, clean commits." },
];

export function SkillsSection() {
  const reduce = useReducedMotion();

  return (
    <section id="skills" aria-label="Skills and technical toolkit" className="relative scroll-mt-28 px-5 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="03 · Competencies"
          title="A toolkit sharpened by shipping."
          description="Depth where it matters — rendering performance, type-safe APIs, and interfaces people actually enjoy using."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          {/* Skill meters */}
          <Reveal>
            <div className="glass h-full rounded-[2rem] p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--apple-green)]">
                    Technologies & Proficiency
                  </p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight">Core Competencies</h3>
                </div>
                <span className="glass rounded-full p-2.5" aria-hidden="true">
                  <Wrench className="h-4 w-4 text-[var(--apple-green)]" />
                </span>
              </div>

              <div className="mt-7 flex flex-col gap-5">
                {skillMeters.map((skill, i) => (
                  <div key={skill.name} className="group">
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="font-mono text-xs text-muted-foreground">{skill.level}%</span>
                    </div>
                    <div
                      className="relative h-2 overflow-hidden rounded-full"
                      style={{ background: "var(--secondary)" }}
                      role="meter"
                      aria-valuenow={skill.level}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={skill.name}
                    >
                      <motion.div
                        initial={reduce ? false : { width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 1.2, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                        className="relative h-full rounded-full"
                        style={{
                          background:
                            "linear-gradient(90deg, var(--apple-green), var(--apple-mint))",
                        }}
                      >
                        {/* sheen sweep on hover */}
                        <span
                          className="absolute inset-y-0 left-0 w-1/3 bg-white/30 opacity-0 group-hover:opacity-100"
                          style={{ animation: "sheen 1.1s ease-in-out infinite" }}
                          aria-hidden="true"
                        />
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Principles + chips */}
          <div className="flex flex-col gap-6">
            <Reveal delay={0.08}>
              <div className="glass rounded-[2rem] p-6 sm:p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--apple-green)]">
                  How I Build
                </p>
                <StaggerGroup className="mt-5 flex flex-col gap-4">
                  {principles.map((p) => (
                    <StaggerItem key={p.title}>
                      <div className="flex items-start gap-3.5">
                        <span className="glass-strong flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
                          <p.icon className="h-4.5 w-4.5 text-[var(--apple-green)]" />
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold">{p.title}</h4>
                          <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{p.desc}</p>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="glass rounded-[2rem] p-6 sm:p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--apple-green)]">
                  Also In The Toolbox
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {skillChips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => playSound("tap")}
                      className="rounded-full border border-[var(--glass-border)] px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all duration-300 hover:scale-105 hover:border-[var(--apple-green)]/40 hover:text-foreground active:scale-95"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

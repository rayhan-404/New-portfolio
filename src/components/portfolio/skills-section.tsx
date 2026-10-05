"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Wrench } from "lucide-react";
import { marqueeStack } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";
import { useSiteContent } from "@/lib/use-site-data";
import type { SkillMeterDef } from "@/lib/site-defaults";
import { CountUp, Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import { SectionNumber } from "./section-number";
import { Spotlight } from "./spotlight";

/**
 * Skills (v91) — full redesign.
 *
 *   · "Core proficiency" is a ledger now: indexed rows, big mono
 *     percentages, animated gradient bars separated by hairlines.
 *   · "Top of the stack" — three animated SVG ring gauges.
 *   · "How I work" — numbered principles on the ember panel.
 *   · "Toolbox" — the admin-editable chip cloud, full width.
 *   · The tech marquee closes the section (hover pauses it).
 *
 * Meters + chips come from Admin → Skills; the defaults render
 * until the fetch lands.
 */

const PRINCIPLES = [
  "Type-safe from database to pixel",
  "Performance budgets on every build",
  "Accessible by default — WCAG 2.1 AA",
  "Ship small, measure, iterate",
];

/* ── animated SVG ring gauge ──────────────────────────────────── */

function Ring({
  meter,
  delay,
  uid,
}: {
  meter: SkillMeterDef;
  delay: number;
  uid: string;
}) {
  const reduce = useReducedMotion();
  const r = 40;
  const c = 2 * Math.PI * r;
  const target = c * (1 - meter.level / 100);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg
          width="104"
          height="104"
          viewBox="0 0 104 104"
          role="img"
          aria-label={`${meter.name}: ${meter.level} percent`}
        >
          <defs>
            <linearGradient id={`ring-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--gold-deep, var(--primary))" />
              <stop offset="100%" stopColor="var(--gold-bright, var(--primary))" />
            </linearGradient>
          </defs>
          <circle
            cx="52"
            cy="52"
            r={r}
            fill="none"
            stroke="var(--border)"
            strokeWidth="7"
          />
          <motion.circle
            cx="52"
            cy="52"
            r={r}
            fill="none"
            stroke={`url(#ring-${uid})`}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={c}
            transform="rotate(-90 52 52)"
            initial={reduce ? { strokeDashoffset: target } : { strokeDashoffset: c }}
            whileInView={{ strokeDashoffset: target }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 1.4, delay, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: "drop-shadow(0 0 6px rgba(var(--primary-rgb)/0.35))" }}
          />
        </svg>
        <span className="font-tag absolute inset-0 flex items-center justify-center text-[15px] font-bold tabular-nums text-foreground">
          <CountUp value={meter.level} suffix="%" />
        </span>
      </div>
      <p className="max-w-[110px] text-center text-[12px] font-medium leading-snug text-foreground/85">
        {meter.name}
      </p>
    </div>
  );
}

/* ── section ──────────────────────────────────────────────────── */

export function SkillsSection() {
  const { skills } = useSiteContent();
  const reduce = useReducedMotion();
  const topThree = skills.meters.slice(0, 3);

  return (
    <section
      id="skills"
      aria-label="Skills and expertise"
      className="relative scroll-mt-20 overflow-hidden px-5 py-16 sm:px-8 sm:py-24 md:px-10 lg:py-32"
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

        <div className="mt-14 grid gap-4 lg:grid-cols-12">
          {/* ── Core proficiency — the ledger ───────────────────── */}
          <Reveal className="lg:col-span-7">
            <div className="glass neu-decor group spot-host relative h-full overflow-hidden rounded-2xl md:rounded-3xl p-6 sm:p-8">
              <Spotlight />
              <div className="flex items-center justify-between gap-3">
                <p className="font-tag text-[10px] text-accent-ink">Core proficiency</p>
                <span className="glass-chip font-tag rounded-full px-3 py-1 text-[9px] tabular-nums text-muted-foreground">
                  {skills.meters.length} tracked
                </span>
              </div>

              <div className="mt-7 flex flex-col">
                {skills.meters.map((skill, i) => (
                  <div
                    key={`${skill.name}-${i}`}
                    className={`group py-4 ${i > 0 ? "border-t border-border/70" : "pt-0"}`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="flex min-w-0 items-baseline gap-3">
                        <span
                          aria-hidden="true"
                          className="font-tag shrink-0 text-[9px] tabular-nums text-muted-foreground/70 transition-colors duration-300 group-hover:text-gold"
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="truncate text-[15px] font-semibold tracking-tight text-foreground/95 sm:text-base">
                          {skill.name}
                        </span>
                      </span>
                      <span className="font-tag shrink-0 text-[15px] font-bold tabular-nums text-foreground sm:text-base">
                        <CountUp value={skill.level} suffix="%" />
                      </span>
                    </div>
                    <div
                      className="neu-inset mt-3 h-[7px] overflow-hidden rounded-full"
                      role="progressbar"
                      aria-valuenow={skill.level}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${skill.name} proficiency`}
                    >
                      <motion.div
                        className="relative h-full rounded-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright shadow-[0_0_12px_rgba(var(--primary-rgb)/0.4),0_1px_2px_rgba(var(--primary-rgb)/0.5)] transition-shadow duration-500 group-hover:shadow-[0_0_18px_rgba(var(--primary-rgb)/0.55)]"
                        initial={reduce ? false : { width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{
                          duration: 1.15,
                          delay: 0.08 + i * 0.07,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                          style={
                            reduce
                              ? undefined
                              : {
                                  animation: "sheen 2.6s ease-in-out infinite",
                                  animationDelay: `${i * 0.4}s`,
                                }
                          }
                        />
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* ── rings + principles ──────────────────────────────── */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            {topThree.length > 0 && (
              <Reveal>
                <div className="glass neu-decor group spot-host relative overflow-hidden rounded-2xl md:rounded-3xl p-6 sm:p-8">
                  <Spotlight />
                  <p className="font-tag text-[10px] text-accent-ink">Top of the stack</p>
                  <div className="mt-6 flex flex-wrap items-start justify-around gap-6">
                    {topThree.map((m, i) => (
                      <Ring key={`${m.name}-${i}`} meter={m} delay={0.15 + i * 0.18} uid={`${i}`} />
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

            <Reveal delay={0.1}>
              <div className="glass-ember group spot-host relative flex-1 overflow-hidden rounded-2xl md:rounded-3xl p-6 sm:p-8">
                <Spotlight />
                <span
                  aria-hidden="true"
                  className="glass-chip orb-float-slow absolute right-6 top-6 rounded-full px-3 py-1.5 text-[10px] font-semibold text-foreground"
                >
                  WCAG 2.1 AA
                </span>
                <p className="font-tag text-[10px] text-accent-ink">How I work</p>
                <ul className="mt-5 flex flex-col gap-4">
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
          </div>

          {/* ── Toolbox — full-width chip cloud ─────────────────── */}
          {skills.chips.length > 0 && (
            <Reveal className="lg:col-span-12">
              <div className="glass neu-decor rounded-2xl md:rounded-3xl p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-tag flex items-center gap-2 text-[10px] text-accent-ink">
                    <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                    Also in the toolbox
                  </p>
                  <span className="glass-chip font-tag rounded-full px-3 py-1 text-[9px] tabular-nums text-muted-foreground">
                    {skills.chips.length} tools
                  </span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {skills.chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => playSound("tap")}
                      className="glass-chip font-tag min-h-10 rounded-full px-3.5 py-2 text-[9.5px] text-foreground/75 transition-all duration-300 hover:text-primary hover:shadow-[var(--shadow-neu)] active:scale-95"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
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

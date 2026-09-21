"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Download, GraduationCap } from "lucide-react";
import { coreStack, experience, person } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";
import { Reveal, StaggerGroup, StaggerItem } from "./reveal";
import { SectionHeading } from "./section-heading";

export function AboutSection({ onResume }: { onResume: () => void }) {
  return (
    <section id="about" aria-label="About Rayhan" className="relative scroll-mt-28 px-5 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="01 · Introduction"
          title="Engineer by craft, designer at heart."
          description={person.philosophy}
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* Profile card */}
          <Reveal>
            <div className="glass relative flex h-full flex-col items-center overflow-hidden rounded-[2rem] p-7">
              {/* accent glow */}
              <div
                className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full opacity-60 blur-3xl"
                style={{ background: "var(--orb-1)" }}
                aria-hidden="true"
              />
              <ProfileAvatar />
              <h3 className="mt-6 text-xl font-semibold tracking-tight">{person.name}</h3>
              <p className="mt-1 text-center text-[13px] text-muted-foreground">{person.role}</p>
              <div className="glass-divider my-5 w-full" aria-hidden="true" />
              <div className="flex flex-wrap items-center justify-center gap-2">
                {coreStack.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[var(--glass-border)] px-3 py-1 font-mono text-[11px] text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <button
                onClick={() => {
                  playSound("tap");
                  onResume();
                }}
                className="glass-strong mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-95"
              >
                <Download className="h-4 w-4" />
                View Full Resume
              </button>
            </div>
          </Reveal>

          {/* Story + timeline */}
          <div className="flex flex-col gap-6">
            <Reveal delay={0.08}>
              <div className="glass rounded-[2rem] p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--apple-green)]">
                      Core Philosophy
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight">
                      Crafting resilient digital products
                    </h3>
                  </div>
                  <span className="glass rounded-full p-2.5" aria-hidden="true">
                    <GraduationCap className="h-4 w-4 text-[var(--apple-green)]" />
                  </span>
                </div>
                <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                  {person.longBio}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {coreStack.map((t) => (
                    <span
                      key={t}
                      className="glass rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    playSound("tap");
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--apple-green)] transition-colors hover:opacity-80"
                >
                  Get in touch
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </Reveal>

            {/* Experience timeline */}
            <StaggerGroup className="flex flex-col gap-3">
              {experience.map((job) => (
                <StaggerItem key={job.role}>
                  <article className="glass group rounded-3xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--glass-bg-strong)] sm:p-6">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="rounded-full bg-[var(--accent)] px-3 py-1 font-mono text-[11px] font-semibold text-[var(--accent-foreground)]">
                        {job.period}
                      </span>
                      {job.current && (
                        <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--apple-green)]">
                          <span className="status-dot" aria-hidden="true" />
                          Current
                        </span>
                      )}
                    </div>
                    <h4 className="mt-3 text-base font-semibold tracking-tight">{job.role}</h4>
                    <p className="mt-0.5 text-[13px] font-medium text-muted-foreground">{job.company}</p>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                      {job.description}
                    </p>
                  </article>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Illustrated avatar redrawn in the Apple glass palette. */
function ProfileAvatar() {
  return (
    <div className="relative mt-4">
      {/* Orbiting chips */}
      <OrbitChip className="-left-6 top-6" label="TS" delay={0} />
      <OrbitChip className="-right-7 top-16" label="⚛" delay={0.8} />
      <OrbitChip className="-left-8 bottom-10" label="Node" delay={1.6} />
      <OrbitChip className="-right-5 bottom-2" label="UI/UX" delay={2.4} />

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="mx-auto w-44 sm:w-48"
      >
        <svg viewBox="0 0 200 200" width="100%" height="100%" role="img" aria-label="Illustrated portrait of Rayhan">
          <defs>
            <linearGradient id="gl-aura" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3ddc68" />
              <stop offset="100%" stopColor="#0c7a35" />
            </linearGradient>
            <linearGradient id="gl-shirt" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5ee384" />
              <stop offset="100%" stopColor="#189a44" />
            </linearGradient>
            <radialGradient id="gl-ring" cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor="rgba(255,255,255,0)" />
              <stop offset="92%" stopColor="rgba(255,255,255,0.28)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>

          {/* glass ring + aura */}
          <circle cx="100" cy="100" r="97" fill="url(#gl-ring)" />
          <circle cx="100" cy="100" r="84" fill="url(#gl-aura)" opacity="0.9" />

          {/* torso */}
          <path d="M52,158 C54,120 74,110 100,110 C126,110 146,120 148,158 Z" fill="url(#gl-shirt)" />

          {/* head */}
          <circle cx="100" cy="74" r="32" fill="#f3ddc3" />
          {/* hair */}
          <path
            d="M68,68 C68,44 82,34 100,34 C118,34 132,44 132,68 C132,70 128,62 120,60 C110,58 90,58 80,60 C72,62 68,70 68,68 Z"
            fill="#241b16"
          />
          {/* glasses */}
          <circle cx="89" cy="74" r="10" fill="none" stroke="#241b16" strokeWidth="2.5" />
          <circle cx="111" cy="74" r="10" fill="none" stroke="#241b16" strokeWidth="2.5" />
          <line x1="99" y1="74" x2="101" y2="74" stroke="#241b16" strokeWidth="2.5" />
          {/* smile */}
          <path d="M94,87 Q100,92 106,87" stroke="#241b16" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* code badge */}
          <rect x="76" y="126" width="48" height="22" rx="7" fill="rgba(5,5,7,0.82)" />
          <text
            x="100"
            y="141"
            fill="#4ade80"
            fontFamily="var(--font-geist-mono), monospace"
            fontWeight="700"
            fontSize="11"
            textAnchor="middle"
          >
            &lt;/&gt;
          </text>
        </svg>
      </motion.div>
    </div>
  );
}

function OrbitChip({
  className,
  label,
  delay,
}: {
  className: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.span
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay }}
      className={`glass-strong absolute z-10 rounded-full px-3 py-1.5 font-mono text-[11px] font-semibold ${className}`}
      aria-hidden="true"
    >
      {label}
    </motion.span>
  );
}

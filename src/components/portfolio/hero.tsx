"use client";

import { motion } from "framer-motion";
import { ArrowDown, FileText, Sparkles } from "lucide-react";
import { heroBadges, marqueeStack, person, stats } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";
import { CountUp, staggerChild, staggerParent } from "./reveal";

export function Hero({
  onResume,
  onContact,
  onProjects,
}: {
  onResume: () => void;
  onContact: () => void;
  onProjects: () => void;
}) {
  return (
    <section id="hero" aria-label="Introduction" className="relative overflow-hidden">
      <motion.div
        variants={staggerParent}
        initial="hidden"
        animate="show"
        className="mx-auto flex max-w-4xl flex-col items-center px-5 pb-16 pt-36 text-center sm:pt-44 lg:pb-24"
      >
        {/* Availability pill */}
        <motion.div variants={staggerChild}>
          <span className="glass inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[13px] font-medium text-muted-foreground">
            <span className="status-dot" aria-hidden="true" />
            {person.availability}
          </span>
        </motion.div>

        {/* Name */}
        <motion.h1
          variants={staggerChild}
          className="mt-8 text-[clamp(3.6rem,13vw,8.5rem)] font-semibold leading-[0.95] tracking-[-0.045em]"
        >
          {person.name}
          <span className="text-[var(--apple-green)]">.</span>
        </motion.h1>

        {/* Role */}
        <motion.p
          variants={staggerChild}
          className="text-glow-green mt-5 text-lg font-medium tracking-tight sm:text-2xl"
        >
          {person.role}
        </motion.p>

        {/* Bio */}
        <motion.p
          variants={staggerChild}
          className="mt-5 max-w-2xl text-balance text-[15px] leading-relaxed text-muted-foreground sm:text-base"
        >
          {person.bio}
        </motion.p>

        {/* Badges */}
        <motion.div variants={staggerChild} className="mt-7 flex flex-wrap items-center justify-center gap-2">
          {heroBadges.map((b) => (
            <span
              key={b.label}
              className="glass rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground"
            >
              {b.label}
            </span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          variants={staggerChild}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <button
            onClick={() => {
              playSound("tap");
              onProjects();
            }}
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-7 text-sm font-semibold text-background transition-all duration-300 hover:scale-[1.03] hover:opacity-90 active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            View My Work
          </button>
          <button
            onClick={() => {
              playSound("tap");
              onContact();
            }}
            className="glass inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-95"
          >
            Let&apos;s Talk
            <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
          </button>
          <button
            onClick={() => {
              playSound("tap");
              onResume();
            }}
            className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground"
          >
            <FileText className="h-4 w-4" />
            Resume
          </button>
        </motion.div>

        {/* Stats */}
        <motion.dl
          variants={staggerChild}
          className="mt-14 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="glass rounded-3xl px-5 py-5 transition-transform duration-300 hover:-translate-y-1"
            >
              <dd className="text-3xl font-semibold tracking-tight">
                <CountUp value={s.value} suffix={s.suffix} decimals={s.value % 1 === 0 ? 0 : 1} />
              </dd>
              <dt className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {s.label}
              </dt>
              <p className="mt-0.5 text-[11px] text-muted-foreground/70">{s.detail}</p>
            </div>
          ))}
        </motion.dl>
      </motion.div>

      {/* Tech marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 1 }}
        className="marquee-mask relative mx-auto max-w-5xl overflow-hidden pb-4"
        aria-hidden="true"
      >
        <div className="animate-marquee flex w-max items-center gap-8 pr-8">
          {[...marqueeStack, ...marqueeStack].map((tech, i) => (
            <span
              key={`${tech}-${i}`}
              className="flex items-center gap-8 whitespace-nowrap text-[13px] font-medium tracking-wide text-muted-foreground/70"
            >
              {tech}
              <span className="h-1 w-1 rounded-full bg-[var(--apple-green)]/60" />
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

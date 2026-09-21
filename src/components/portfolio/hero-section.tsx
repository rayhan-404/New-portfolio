"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowDown, CalendarClock, Layers, Sparkles } from "lucide-react";
import { person, stats } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";
import { scrollToSection } from "./nav";
import { CountUp } from "./reveal";

const EASE = [0.22, 1, 0.36, 1] as const;

/* hero-cutout.png intrinsic size (kept in sync by scripts/make-cutout.mjs) */
const CUTOUT_W = 761;
const CUTOUT_H = 1065;

/* ── Shared hero pieces ─────────────────────────────────────────── */

function HeroCTAs() {
  return (
    <>
      <button
        onClick={() => {
          playSound("notch");
          scrollToSection("projects");
        }}
        className="btn-light inline-flex h-12 items-center gap-2.5 rounded-full px-7 text-[15px] font-semibold"
      >
        Explore Selected Works
        <ArrowDown className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        onClick={() => {
          playSound("chime");
          scrollToSection("contact");
        }}
        className="glass-strong inline-flex h-12 items-center gap-2.5 rounded-full px-7 text-[15px] font-semibold text-foreground transition-all duration-300 hover:bg-white/25 active:scale-[0.97]"
      >
        <CalendarClock className="h-4 w-4" aria-hidden="true" />
        Book a Discovery Call
      </button>
    </>
  );
}

function StatsGrid() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
      {stats.map((s) => (
        <div key={s.label} className="glass rounded-2xl px-4 py-4 text-center lg:text-left">
          <p className="font-display text-[1.65rem] leading-none text-gold-gradient sm:text-3xl">
            <CountUp
              value={s.value}
              suffix={s.suffix}
              decimals={s.value % 1 !== 0 ? 1 : 0}
            />
          </p>
          <p className="mt-2 text-[11px] font-semibold text-foreground/90 sm:text-xs">
            {s.label}
          </p>
          <p className="mt-0.5 hidden text-[10px] text-white/55 sm:block">{s.detail}</p>
        </div>
      ))}
    </div>
  );
}

export function HeroSection() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  /* Gentle parallax on the desktop portrait card */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 55, damping: 18 });
  const sy = useSpring(my, { stiffness: 55, damping: 18 });
  const cardX = useTransform(sx, [-0.5, 0.5], [-10, 10]);
  const cardY = useTransform(sy, [-0.5, 0.5], [-8, 8]);
  const cardR = useTransform(sx, [-0.5, 0.5], [-1.6, 1.6]);

  const onMouseMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section
      id="home"
      ref={ref}
      aria-label="Introduction"
      onMouseMove={onMouseMove}
      className="relative flex min-h-svh flex-col justify-center overflow-hidden px-5 pb-14 pt-20 sm:px-8 sm:pt-24 md:px-10 lg:pt-32"
    >
      {/* soft light bloom behind the type */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_58%_42%_at_50%_30%,rgba(255,214,138,0.2),transparent_70%)]"
      />

      {/* ══ MOBILE / TABLET — full-width transparent cutout portrait ══ */}
      <div className="relative -mx-5 sm:-mx-8 lg:hidden" aria-label="Introduction">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 26, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.95, delay: 0.12, ease: EASE }}
          className="relative"
        >
          <div className="relative mx-auto w-full max-w-[560px]">
            {/* warm halo behind the cutout */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-[10%] h-[60%] w-[92%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,205,120,0.34),transparent_66%)] blur-2xl"
            />

            <div className="hero-cutout-fade relative">
              <Image
                src="/generated/hero-cutout.png"
                alt="Portrait of Rayhan Ahmed"
                width={CUTOUT_W}
                height={CUTOUT_H}
                priority
                loading="eager"
                sizes="(max-width: 640px) 100vw, 560px"
                quality={88}
                className="relative h-auto w-full object-contain drop-shadow-[0_30px_44px_rgba(60,5,0,0.42)]"
              />
              {/* "Hello.." — top-left corner of the picture */}
              <motion.span
                initial={reduce ? false : { opacity: 0, x: -16, y: -8 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
                className="text-glow absolute left-5 top-3 font-display text-4xl font-medium tracking-[-0.02em] text-white sm:left-8 sm:top-5 sm:text-5xl"
              >
                Hello..
              </motion.span>
            </div>
          </div>
        </motion.div>

        {/* Glass panel — the picture's faded bottom melts into it */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, delay: 0.32, ease: EASE }}
          className="glass-strong relative z-10 -mt-14 rounded-t-[2.75rem] px-6 pb-9 pt-9 text-center sm:-mt-20 sm:px-10"
        >
          <span className="glass-chip inline-flex items-center gap-2.5 rounded-full px-4 py-2">
            <span className="status-dot" aria-hidden="true" />
            <span className="text-xs font-medium text-foreground/90">
              Available for new projects
            </span>
          </span>

          <h1 className="font-display mt-5 text-[2.6rem] leading-[1.04] tracking-[-0.03em] text-foreground sm:text-6xl">
            I am <span className="text-gold-gradient">M Rayhan</span>
          </h1>

          <p className="font-tag mt-3 text-[10px] uppercase tracking-[0.32em] text-white/70">
            {person.role}
          </p>

          <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-white/85">
            Full-stack engineer &amp; UI/UX specialist behind Blue Nile Studio, crafting
            resilient apps, scalable systems and glass-grade interfaces with
            obsession-level polish.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <HeroCTAs />
          </div>

          <div className="mt-8 text-left sm:text-center">
            <StatsGrid />
          </div>
        </motion.div>
      </div>

      {/* ══ DESKTOP — keynote column + portrait card ══ */}
      <div className="relative z-10 mx-auto hidden w-full max-w-6xl lg:block">
        <div className="grid items-center grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-10">
          {/* ── Keynote column ─────────────────────────────────── */}
          <div className="text-left">
            {/* availability pill */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
              className="mb-7 inline-flex"
            >
              <span className="glass-chip inline-flex items-center gap-2.5 rounded-full px-4 py-2">
                <span className="status-dot" aria-hidden="true" />
                <span className="text-xs font-medium text-foreground/90">
                  Available for new projects
                </span>
              </span>
            </motion.div>

            {/* headline */}
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.32, ease: EASE }}
              className="font-display text-glow text-[4.4rem] leading-[1.02] tracking-[-0.03em] text-foreground"
            >
              Products that
              <br />
              <span className="text-gold-gradient">feel inevitable.</span>
            </motion.h1>

            {/* subcopy */}
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.44, ease: EASE }}
              className="mt-6 max-w-xl text-base leading-relaxed text-white/80"
            >
              <span className="font-semibold text-foreground">{person.name}</span> —
              full-stack engineer &amp; UI/UX specialist behind Blue Nile Studio, crafting
              resilient apps, scalable systems and glass-grade interfaces with
              obsession-level polish.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.56, ease: EASE }}
              className="mt-9 flex flex-wrap items-center justify-start gap-3"
            >
              <HeroCTAs />
            </motion.div>

            {/* stats strip */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
              className="mt-10"
            >
              <StatsGrid />
            </motion.div>
          </div>

          {/* ── Portrait card ──────────────────────────────────── */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 34, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.05, delay: 0.5, ease: EASE }}
            className="relative mx-auto w-full max-w-[400px]"
            style={reduce ? undefined : { x: cardX, y: cardY, rotate: cardR }}
          >
            {/* glow underlay */}
            <div
              aria-hidden="true"
              className="absolute -inset-8 rounded-[3.5rem] bg-[radial-gradient(circle_at_50%_45%,rgba(255,170,80,0.35),transparent_68%)] blur-2xl"
            />

            <div className="glass-strong relative overflow-hidden rounded-[2.5rem] p-2.5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
                <Image
                  src="/generated/hero-portrait.png"
                  alt={`Portrait of ${person.name}`}
                  fill
                  priority
                  loading="eager"
                  sizes="400px"
                  quality={88}
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-[image:var(--img-vignette)]" />
                {/* bottom nameplate */}
                <div className="glass-strong absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold leading-tight text-foreground">
                      {person.name}
                    </p>
                    <p className="font-tag mt-0.5 truncate text-[8.5px] text-white/70">
                      {person.role}
                    </p>
                  </div>
                  <span className="status-dot shrink-0" aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* floating glass chips */}
            <div
              aria-hidden="true"
              className="glass-chip orb-float absolute -right-8 top-8 flex items-center gap-2 rounded-2xl px-3.5 py-2.5"
            >
              <Sparkles className="h-4 w-4 text-gold" />
              <span className="text-xs font-semibold text-foreground">35+ Apps Shipped</span>
            </div>
            <div
              aria-hidden="true"
              className="glass-chip orb-float-slow absolute -left-8 bottom-24 flex items-center gap-2 rounded-2xl px-3.5 py-2.5"
            >
              <Layers className="h-4 w-4 text-gold" />
              <span className="text-xs font-semibold text-foreground">Design Systems</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* scroll cue */}
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 1.05, ease: EASE }}
        className="relative z-10 mt-12 flex justify-center"
      >
        <button
          onClick={() => {
            playSound("notch");
            scrollToSection("projects");
          }}
          aria-label="Scroll to projects"
          className="glass-chip group flex items-center gap-2.5 rounded-full py-2 pl-3 pr-5 transition-all duration-300 hover:bg-white/20 active:scale-[0.98]"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition-colors duration-300 group-hover:bg-white/30">
            <ArrowDown className="animate-nudge h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="text-[13px] font-medium text-white/85">Scroll to explore</span>
        </button>
      </motion.div>
    </section>
  );
}

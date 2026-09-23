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
import {
  ArrowRight,
  ChevronDown,
  GraduationCap,
  Mail,
  Telescope,
} from "lucide-react";
import { person } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";
import { scrollToSection } from "./nav";
import { EmberCanvas } from "./ember-canvas";

const EASE = [0.22, 1, 0.36, 1] as const;

/* hero-cutout.png intrinsic size (uploaded portrait, Photoroom cutout) */
const CUTOUT_W = 1369;
const CUTOUT_H = 1149;

/* ── Hero interests ticker ───────────────────────────────────── */

const INTERESTS = [
  "Artificial Intelligence",
  "Robotics",
  "Electronics",
  "New Gadgets",
  "How Things Work",
  "Building Stuff",
  "Web & Code",
  "The Universe",
];

function InterestList({ hidden = false }: { hidden?: boolean }) {
  return (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {INTERESTS.map((item) => (
        <span
          key={item}
          className="flex items-center font-tag text-[9px] tracking-[0.24em] text-white/60"
        >
          <span className="px-7">{item}</span>
          <span className="text-[8px] text-gold">✦</span>
        </span>
      ))}
    </div>
  );
}

function InterestTicker() {
  return (
    <div className="relative z-20 border-t border-white/10 bg-[rgba(58,9,3,0.32)] backdrop-blur-md">
      <div className="marquee-mask overflow-hidden py-3.5">
        <div className="animate-marquee flex w-max" style={{ animationDuration: "48s" }}>
          <InterestList />
          <InterestList hidden />
        </div>
      </div>
    </div>
  );
}

/* ── Gold swash — the hand-drawn underline that draws itself in ── */

function GoldSwash({
  id,
  className = "",
  delay = 1.15,
}: {
  id: string;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      viewBox="0 0 140 14"
      aria-hidden="true"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className={className}
    >
      <motion.path
        d="M3 9 C 30 3, 58 12.5, 86 7.5 S 128 4.5, 137 7"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="3"
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.85, delay: delay + 0.1, ease: EASE }}
      />
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffe3ae" />
          <stop offset="55%" stopColor="#ffb45e" />
          <stop offset="100%" stopColor="#ff7a1c" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}

/* ── Availability chip ───────────────────────────────────────── */

function AvailabilityChip({ delay }: { delay: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className="glass-chip inline-flex items-center gap-2.5 rounded-full px-4 py-2"
    >
      <span className="status-dot" aria-hidden="true" />
      <span className="font-tag text-[9px] text-white/80">{person.availability}</span>
    </motion.span>
  );
}

/* ── The hook — short editorial intro (full story lives in About) ── */

function HeroHook() {
  return (
    <>
      <p className="font-bio text-[15px] leading-[1.65] text-white/85 sm:text-[16px]">
        I&apos;m basically a boring and curious guy who wants to know{" "}
        <strong className="font-semibold text-foreground">
          how everything works
        </strong>{" "}
        — from my cell, brain, everything surrounding me, to the universe, and
        what&apos;s going on behind the screen.
      </p>
      <p className="border-l-2 border-gold/70 pl-3.5 font-serif text-[15px] italic leading-[1.5] text-white/75">
        Curious about almost everything — and I love building things just to
        see what happens.
      </p>
    </>
  );
}

/* ── CTA pair ────────────────────────────────────────────────── */

function CtaRow({ delay }: { delay: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className="flex flex-wrap items-center gap-3"
    >
      <button
        type="button"
        onClick={() => {
          playSound("notch");
          scrollToSection("journey");
        }}
        className="btn-light group inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold"
      >
        Explore my journey
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </button>
      <button
        type="button"
        onClick={() => {
          playSound("notch");
          scrollToSection("contact");
        }}
        className="glass-chip inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold text-foreground transition-colors duration-300 hover:bg-white/15"
      >
        <Mail className="h-4 w-4 text-gold" />
        Say hello
      </button>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════ */

export function HeroSection() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  /* Mouse parallax — portrait drifts with the cursor, ghost word
     drifts against it (depth layers move in opposition). */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 55, damping: 18 });
  const sy = useSpring(my, { stiffness: 55, damping: 18 });
  const portraitX = useTransform(sx, [-0.5, 0.5], [-12, 12]);
  const portraitY = useTransform(sy, [-0.5, 0.5], [-9, 9]);
  const ghostX = useTransform(sx, [-0.5, 0.5], [26, -26]);

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
      className="relative flex min-h-svh flex-col overflow-hidden px-5 pb-10 pt-24 sm:px-8 sm:pt-28 md:px-10 lg:pb-8 lg:pt-16"
    >
      {/* warm stage bloom — slowly breathing */}
      <div
        aria-hidden="true"
        className="animate-breathe pointer-events-none absolute right-[-8%] top-[4%] h-[62vh] w-[58vw] rounded-full bg-[radial-gradient(circle,rgba(255,196,110,0.30),transparent_65%)] blur-3xl"
      />

      {/* drifting embers */}
      <EmberCanvas className="pointer-events-none absolute inset-0 z-[5] h-full w-full" />

      {/* ══ MOBILE / TABLET — cinematic cutout + layered type ══ */}
      <div className="relative -mx-5 sm:-mx-8 lg:hidden">
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
              className="animate-breathe absolute left-1/2 top-[6%] h-[58%] w-[94%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,205,120,0.34),transparent_66%)] blur-2xl"
            />

            {/* "Hello.." — editorial serif italic + gold dots + swash */}
            <motion.span
              initial={reduce ? false : { opacity: 0, x: -16, y: -8 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
              className="text-glow absolute left-5 top-4 z-10 sm:left-8 sm:top-6"
            >
              <span className="font-serif block text-[3rem] font-normal italic leading-[0.95] tracking-[-0.015em] text-[#fff9f1] sm:text-[3.6rem]">
                Hello<span className="text-gold-gradient">..</span>
              </span>
              <GoldSwash id="swash-hello" delay={1} className="mt-1.5 block h-[13px] w-[118px] drop-shadow-[0_2px_6px_rgba(96,14,0,0.45)] sm:h-[15px] sm:w-[142px]" />
            </motion.span>

            {/* The cutout — Task 39 tuning kept (fade follows the photo) */}
            <div className="hero-cutout-fade relative origin-top -translate-x-[4%] scale-[1.16] sm:scale-[1.1]">
              <Image
                src="/generated/m-rayhan-cutout.png"
                alt="Portrait of M Rayhan"
                width={CUTOUT_W}
                height={CUTOUT_H}
                priority
                loading="eager"
                sizes="(max-width: 640px) 100vw, 560px"
                quality={88}
                className="relative h-auto w-full object-contain drop-shadow-[0_30px_44px_rgba(60,5,0,0.42)]"
              />
            </div>

            {/* Intro begins where the fade starts */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, delay: 0.32, ease: EASE }}
              className="relative z-10 -mt-20 px-5 pb-2 text-left sm:-mt-24 sm:px-8"
            >
              <AvailabilityChip delay={0.7} />

              <p className="font-serif mt-4 text-[1.7rem] font-normal italic leading-none text-[#fff9f1] sm:text-[2.1rem]">
                I am<span className="text-gold-gradient">,</span>
              </p>

              <h1 className="font-script text-glow mt-2 text-[3.3rem] leading-[1.05] sm:text-7xl">
                <span className="text-gold-gradient">M Rayhan</span>
              </h1>
              <GoldSwash id="swash-name-m" delay={1.25} className="mt-2 block h-[13px] w-[148px] drop-shadow-[0_2px_6px_rgba(96,14,0,0.45)]" />

              <p className="font-tag mt-3.5 text-[9px] text-white/65">
                CSE Student · North Western University
              </p>

              <div className="glass mt-5 rounded-3xl p-5">
                <div className="flex flex-col gap-3">
                  <HeroHook />
                </div>
              </div>

              <div className="mt-5 pb-4">
                <CtaRow delay={1.35} />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ══ DESKTOP — copy column + free-floating portrait stage ══ */}
      <div className="relative z-10 mx-auto hidden w-full max-w-6xl flex-1 flex-col justify-center lg:block">
        {/* ghost display word — behind everything, drifting against the cursor */}
        <motion.div
          aria-hidden="true"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.8, delay: 0.15, ease: EASE }}
          className="pointer-events-none absolute inset-x-0 top-[6%] flex justify-center"
        >
          <motion.span
            className="font-name select-none whitespace-nowrap leading-[0.85]"
            style={
              {
                x: ghostX,
                fontSize: "clamp(150px, 16.5vw, 252px)",
                letterSpacing: "-0.02em",
                color: "transparent",
                WebkitTextStroke: "1.5px rgba(255, 224, 170, 0.15)",
              } as React.CSSProperties
            }
          >
            RAYHAN
          </motion.span>
        </motion.div>

        <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,53fr)_minmax(0,47fr)]">
          {/* ── Copy column ─────────────────────────────────── */}
          <div className="relative z-20 py-10">
            <AvailabilityChip delay={0.55} />

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65, ease: EASE }}
              className="font-serif mt-7 text-[2.2rem] font-normal italic leading-none text-[#fff9f1]"
            >
              I am<span className="text-gold-gradient">,</span>
            </motion.p>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.78, ease: EASE }}
              className="font-script text-glow mt-2 whitespace-nowrap text-[clamp(4.6rem,6.6vw,7rem)] leading-[1.04]"
            >
              <span className="text-gold-gradient">M Rayhan</span>
            </motion.h1>
            <GoldSwash id="swash-name-d" delay={1.3} className="mt-3 block h-[15px] w-[210px] drop-shadow-[0_2px_8px_rgba(96,14,0,0.5)]" />

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.95, ease: EASE }}
              className="font-tag mt-5 text-[10px] text-white/65"
            >
              CSE Student <span className="text-gold">✦</span> North Western
              University <span className="text-gold">✦</span> Khulna
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 1.08, ease: EASE }}
              className="mt-6 flex max-w-[27rem] flex-col gap-3.5"
            >
              <HeroHook />
            </motion.div>

            <div className="mt-8">
              <CtaRow delay={1.28} />
            </div>
          </div>

          {/* ── Portrait stage — cutout floats free, no card ── */}
          <div className="relative z-10 flex justify-center pb-10">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 44, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.15, delay: 0.35, ease: EASE }}
              className="relative w-[min(45vw,600px)]"
              style={reduce ? undefined : { x: portraitX, y: portraitY }}
            >
              {/* gold orbit ring + satellite dot */}
              <motion.div
                aria-hidden="true"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.4, delay: 1, ease: EASE }}
                className="pointer-events-none absolute left-1/2 top-[46%] h-[min(50vw,660px)] w-[min(50vw,660px)] -translate-x-1/2 -translate-y-1/2"
              >
                <div className="animate-orbit absolute inset-0 rounded-full border border-[rgba(255,208,140,0.28)]">
                  <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffd58a] shadow-[0_0_16px_rgba(255,200,110,0.95)]" />
                </div>
                <div className="absolute inset-[9%] rounded-full border border-[rgba(255,208,140,0.10)]" />
              </motion.div>

              {/* floor glow — grounds the floating subject */}
              <div
                aria-hidden="true"
                className="absolute bottom-[2%] left-1/2 h-20 w-[72%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(66,6,1,0.6),transparent_70%)] blur-xl"
              />

              <div className="hero-cutout-stage relative origin-top -translate-x-[5%] scale-[1.1]">
                <Image
                  src="/generated/m-rayhan-cutout.png"
                  alt="Portrait of M Rayhan"
                  width={CUTOUT_W}
                  height={CUTOUT_H}
                  priority
                  loading="eager"
                  sizes="(max-width: 1024px) 0vw, 540px"
                  quality={88}
                  className="relative z-10 h-auto w-full object-contain drop-shadow-[0_44px_64px_rgba(58,4,0,0.5)]"
                />
              </div>

              {/* floating glass chips */}
              <motion.div
                initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 1.15, ease: EASE }}
                aria-hidden="true"
                className="glass-chip orb-float absolute -right-6 top-10 z-20 flex items-center gap-2 rounded-2xl px-3.5 py-2.5"
              >
                <GraduationCap className="h-4 w-4 text-gold" />
                <span className="text-xs font-semibold text-foreground">CSE Student</span>
              </motion.div>
              <motion.div
                initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 1.3, ease: EASE }}
                aria-hidden="true"
                className="glass-chip orb-float-slow absolute -left-4 bottom-24 z-20 flex items-center gap-2 rounded-2xl px-3.5 py-2.5"
              >
                <Telescope className="h-4 w-4 text-gold" />
                <span className="text-xs font-semibold text-foreground">Curious Builder</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* scroll cue — desktop only, above the ticker */}
      <motion.button
        type="button"
        onClick={() => {
          playSound("notch");
          scrollToSection("journey");
        }}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, delay: 1.9, ease: EASE }}
        aria-label="Scroll to the journey section"
        className="group absolute bottom-[74px] left-1/2 z-30 hidden -translate-x-1/2 flex-col items-center gap-1 lg:flex"
      >
        <span className="font-tag text-[9px] text-white/55 transition-colors duration-300 group-hover:text-foreground">
          Scroll
        </span>
        <ChevronDown className="animate-nudge h-4 w-4 text-white/60 transition-colors duration-300 group-hover:text-foreground" />
      </motion.button>

      {/* interests ticker — the hero's closing strip */}
      <div className="relative -mx-5 mt-8 sm:-mx-8 md:-mx-10 lg:mt-0">
        <InterestTicker />
      </div>
    </section>
  );
}

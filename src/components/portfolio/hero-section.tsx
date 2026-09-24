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
import { ChevronDown, GraduationCap, Telescope } from "lucide-react";
import { person } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";
import { scrollToSection } from "./nav";

const EASE = [0.22, 1, 0.36, 1] as const;

/* hero-cutout.png intrinsic size (uploaded portrait, Photoroom cutout) */
const CUTOUT_W = 1369;
const CUTOUT_H = 1149;

/* ── Personal intro copy ─────────────────────────────────────── */

function IntroBio({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Lead line — bigger, editorial serif italic, the "special" opener */}
      <p className="font-serif text-[1.3rem] italic leading-[1.35] tracking-[-0.01em] text-foreground/80 sm:text-[1.5rem]">
        I&apos;m a CSE student at{" "}
        <span className="font-medium text-foreground">
          North Western University, Khulna
        </span>
        , and originally from{" "}
        <span className="font-medium text-foreground">Shyamnagar, Satkhira, Bangladesh</span>.
      </p>
      <p className="font-bio text-justify text-[14.5px] leading-[1.78] text-foreground/75 sm:text-[15.5px]">
        I&apos;m basically a boring and curious guy who wants to know{" "}
        <strong className="font-semibold text-foreground">
          how everything works, from my cell, brain, everything surrounding me,
          to the universe, and what&apos;s going on behind the screen
        </strong>{" "}
        🤔 If I find something interesting, there&apos;s a pretty good chance
        I&apos;ll spend hours trying to figure it out and understand how it
        works.
      </p>
      <p className="font-bio text-justify text-[14.5px] leading-[1.78] text-foreground/75 sm:text-[15.5px]">
        I like learning new things, trying random ideas, and building stuff
        just to see if I can actually make it work. I&apos;ve already built a
        few small projects because of this habit, and honestly, I enjoy the
        process more than the final result, and it satisfies me more than
        anything.
      </p>
      <p className="font-bio text-justify text-[14.5px] leading-[1.78] text-foreground/75 sm:text-[15.5px]">
        Sometimes I build something useful. Sometimes I build something
        completely unnecessary. And sometimes I break something and then spend
        the next few hours figuring out how it actually works. 🧐
      </p>
      <p className="font-bio text-justify text-[14.5px] leading-[1.78] text-foreground/75 sm:text-[15.5px]">
        If you ask,{" "}
        <strong className="font-semibold text-foreground">
          what is this guy interested in?
        </strong>{" "}
        🤨 Then I&apos;m interested in{" "}
        <strong className="font-semibold text-foreground">
          Artificial Intelligence, Robotics, Electronics, new gadgets and
          technologies
        </strong>
        . I don&apos;t know where this curiosity will take me yet, but I&apos;m
        having fun finding out.
      </p>
      <p className="font-bio text-justify text-[14.5px] font-semibold leading-[1.78] text-foreground sm:text-[15.5px]">
        I&apos;m curious about almost everything, and I love building things
        just to see what happens.
      </p>
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
      className="relative flex min-h-svh flex-col justify-center overflow-hidden px-5 pb-14 pt-20 sm:px-8 sm:pt-24 md:px-10 lg:pt-28"
    >
      {/* soft light bloom behind the type */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_58%_42%_at_50%_30%,rgba(var(--primary-rgb)/0.08),transparent_70%)]"
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
              className="absolute left-1/2 top-[6%] h-[58%] w-[94%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(var(--accent-rgb)/0.16),transparent_66%)] blur-2xl"
            />

            {/* "Hello.." — anchored to the column (not the scaled photo):
                editorial serif italic + gold-gradient dots + a hand-drawn
                gold swash that draws itself in. */}
            <motion.span
              initial={reduce ? false : { opacity: 0, x: -16, y: -8 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
              className="text-glow absolute left-5 top-4 z-10 sm:left-8 sm:top-6"
            >
              <span className="font-serif block text-[3rem] font-normal italic leading-[0.95] tracking-[-0.015em] text-foreground sm:text-[3.6rem]">
                Hello<span className="text-gold-gradient">..</span>
              </span>
              <motion.svg
                viewBox="0 0 140 14"
                aria-hidden="true"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="mt-1.5 block h-[13px] w-[118px] drop-shadow-[0_2px_6px_rgba(97,49,24,0.35)] sm:h-[15px] sm:w-[142px]"
              >
                <motion.path
                  d="M3 9 C 30 3, 58 12.5, 86 7.5 S 128 4.5, 137 7"
                  fill="none"
                  stroke="url(#hello-swash-gold)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.85, delay: 1.05, ease: EASE }}
                />
                <defs>
                  <linearGradient id="hello-swash-gold" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" style={{ stopColor: "var(--primary2-ref)" }} />
                    <stop offset="55%" style={{ stopColor: "var(--primary)" }} />
                    <stop offset="100%" style={{ stopColor: "var(--accent-ref)" }} />
                  </linearGradient>
                </defs>
              </motion.svg>
            </motion.span>

            {/* The photo itself grows a touch beyond the column
                (transform-only: layout box, text flow and the fade
                seam all stay exactly where they were) — zoomed in
                further and nudged left so the subject sits bigger
                and more centered in frame */}
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
                className="relative h-auto w-full object-contain drop-shadow-[0_30px_44px_rgba(58,28,84,0.35)]"
              />
            </div>

            {/* Intro begins where the fade starts — left aligned */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, delay: 0.32, ease: EASE }}
              className="relative z-10 -mt-20 px-5 pb-2 text-left sm:-mt-28 sm:px-8"
            >
              {/* Name — "I am," on top, the script name on its own line below */}
              <p className="font-serif text-[1.7rem] font-normal italic leading-none text-foreground sm:text-[2.1rem]">
                I am<span className="text-gold-gradient">,</span>
              </p>

              <h1 className="font-script text-glow mt-2.5 text-[2.7rem] leading-[1.05] text-foreground sm:text-6xl">
                M Rayhan
              </h1>

              <IntroBio className="mt-6" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ══ DESKTOP — intro column + portrait card ══ */}
      <div className="relative z-10 mx-auto hidden w-full max-w-6xl lg:block">
        <div className="grid items-center grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-12">
          {/* ── Intro column ───────────────────────────────────── */}
          <div className="text-left">
            {/* Name — "I am," on top, the script name on its own line below */}
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
              className="font-serif text-[2.3rem] font-normal italic leading-none text-foreground"
            >
              I am<span className="text-gold-gradient">,</span>
            </motion.p>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.32, ease: EASE }}
              className="font-script text-glow mt-3 text-[4.4rem] leading-[1.05] text-foreground xl:text-[4.9rem]"
            >
              M Rayhan
            </motion.h1>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.44, ease: EASE }}
              className="mt-7 max-w-xl"
            >
              <IntroBio />
            </motion.div>
          </div>

          {/* ── Portrait card ──────────────────────────────────── */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 34, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.05, delay: 0.5, ease: EASE }}
            className="relative mx-auto w-full max-w-[440px]"
            style={reduce ? undefined : { x: cardX, y: cardY, rotate: cardR }}
          >
            {/* glow underlay */}
            <div
              aria-hidden="true"
              className="absolute -inset-8 rounded-[3.5rem] bg-[radial-gradient(circle_at_50%_45%,rgba(var(--accent-rgb)/0.14),transparent_68%)] blur-2xl"
            />

            <div className="glass-strong neu-decor relative overflow-hidden rounded-[2.5rem] p-2.5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
                {/* warm studio backdrop behind the transparent cutout */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(var(--accent-rgb)/0.4),rgba(var(--primary-rgb)/0.6)_55%,rgba(58,34,20,0.95)_100%)]"
                />
                <Image
                  src="/generated/m-rayhan-portrait.png"
                  alt={`Portrait of ${person.name}`}
                  fill
                  priority
                  loading="eager"
                  sizes="440px"
                  quality={88}
                  className="origin-top -translate-x-[6%] scale-[1.18] object-cover object-top"
                />
                <div className="absolute inset-0 bg-[image:var(--img-vignette)]" />
                {/* bottom nameplate */}
                <div className="glass-strong absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold leading-tight text-foreground">
                      {person.name}
                    </p>
                    <p className="font-tag mt-0.5 truncate text-[8.5px] text-muted-foreground">
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
              <GraduationCap className="h-4 w-4 text-gold" />
              <span className="text-xs font-semibold text-foreground">CSE Student</span>
            </div>
            <div
              aria-hidden="true"
              className="glass-chip orb-float-slow absolute -left-8 bottom-24 flex items-center gap-2 rounded-2xl px-3.5 py-2.5"
            >
              <Telescope className="h-4 w-4 text-gold" />
              <span className="text-xs font-semibold text-foreground">Curious Builder</span>
            </div>

            {/* Scroll cue — sits just under the card, clear of all copy */}
            <motion.button
              type="button"
              onClick={() => {
                playSound("notch");
                scrollToSection("journey");
              }}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 1.7, ease: EASE }}
              aria-label="Scroll to the journey section"
              className="group absolute -bottom-[74px] left-1/2 flex -translate-x-1/2 flex-col items-center gap-1"
            >
              <span className="font-tag text-[9px] text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                Scroll
              </span>
              <ChevronDown className="animate-nudge h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-foreground" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

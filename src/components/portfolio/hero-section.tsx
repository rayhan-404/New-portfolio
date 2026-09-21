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
import { ChevronDown } from "lucide-react";
import { heroAward, person } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";
import { scrollToSection } from "./side-rail";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Floating pixel artifacts — signature of the layout */
function PixelCluster() {
  return (
    <>
      {/* Left cluster */}
      <div aria-hidden="true" className="absolute left-[6%] top-[46%] hidden sm:block">
        <span className="pixel pixel-float block h-5 w-5" />
        <span className="pixel pixel-float-slow mt-6 ml-7 block h-5 w-5" style={{ animationDelay: "-2s" }} />
        <span className="pixel pixel-dim pixel-float mt-1 block h-3 w-3" style={{ animationDelay: "-4s" }} />
      </div>
      {/* Right cluster */}
      <div aria-hidden="true" className="absolute bottom-[34%] right-[9%] hidden sm:block">
        <span className="pixel pixel-float block h-5 w-5" style={{ animationDelay: "-1s" }} />
        <span className="pixel pixel-float-slow mt-7 ml-8 block h-3.5 w-3.5" style={{ animationDelay: "-5s" }} />
      </div>
      {/* Top-right dim pixel */}
      <span aria-hidden="true" className="pixel pixel-dim pixel-float-slow absolute right-[26%] top-[14%] hidden h-2.5 w-2.5 lg:block" />
    </>
  );
}

export function HeroSection({ onOpenMenu }: { onOpenMenu: () => void }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  /* Gentle parallax on the portrait */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 55, damping: 18 });
  const sy = useSpring(my, { stiffness: 55, damping: 18 });
  const imgX = useTransform(sx, [-0.5, 0.5], [-14, 14]);
  const imgY = useTransform(sy, [-0.5, 0.5], [-10, 10]);

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
      className="relative flex min-h-svh flex-col overflow-hidden md:pl-20 lg:pl-24"
    >
      {/* ── Portrait ─────────────────────────────────────────── */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 flex justify-center"
        style={reduce ? undefined : { x: imgX, y: imgY }}
      >
        <motion.div
          initial={reduce ? false : { scale: 1.07, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: EASE }}
          className="relative h-full w-full max-w-[860px]"
        >
          <Image
            src="/generated/hero-portrait.png"
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 860px"
            quality={88}
            className="object-cover object-top [mask-image:linear-gradient(to_right,transparent,black_9%,black_91%,transparent)]"
          />
          {/* cinematic blends */}
          <div className="absolute inset-0 bg-[image:var(--img-vignette)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70" />
        </motion.div>
      </motion.div>

      {/* warm ember glow + blueprint grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_38%_at_50%_-4%,rgba(232,99,44,0.22),transparent_68%)]"
      />
      <div aria-hidden="true" className="grid-overlay pointer-events-none absolute inset-0" />

      <PixelCluster />

      {/* ── Header overlay (desktop — mobile uses the fixed MobileHeader) ── */}
      <header className="relative z-10 hidden items-start justify-between px-5 pb-2 pt-6 sm:px-8 md:flex md:px-10 md:pt-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
        >
          <h1 className="font-display text-[2.6rem] leading-[0.92] tracking-tight text-foreground sm:text-6xl">
            Blue
            <br />
            Nile
          </h1>
          <p className="mt-3 flex items-center gap-2.5">
            <span className="status-dot" aria-hidden="true" />
            <span className="font-tag text-[10px] font-bold text-foreground/90">
              {person.name}
            </span>
          </p>
        </motion.div>

        <motion.button
          initial={reduce ? false : { opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          onClick={() => {
            playSound("notch");
            onOpenMenu();
          }}
          aria-label="Open menu"
          aria-haspopup="dialog"
          className="group mt-1 flex h-12 w-12 flex-col items-center justify-center gap-[7px] rounded-full border border-[var(--line-strong)] transition-all duration-300 hover:border-ember/70 active:scale-95"
        >
          <span className="h-px w-5 bg-foreground transition-all duration-300 group-hover:w-6 group-hover:bg-ember" />
          <span className="h-px w-3.5 self-end mr-[13px] bg-foreground transition-all duration-300 group-hover:bg-ember" />
        </motion.button>
      </header>

      {/* flexible space */}
      <div className="relative z-10 flex-1" aria-hidden="true" />

      {/* ── Bottom bar ───────────────────────────────────────── */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.55, ease: EASE }}
        className="relative z-10 px-5 pb-7 sm:px-8 md:px-10 md:pb-9"
      >
        <div className="hairline-t mb-6 pt-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            {/* [ 12+ ] badge */}
            <button
              onClick={() => {
                playSound("tap");
                scrollToSection("about");
              }}
              aria-label="Twelve plus awards — see about"
              className="group flex items-center gap-1 rounded-2xl border border-[var(--line-strong)] px-6 py-3.5 transition-all duration-300 hover:border-ember/70 hover:bg-ember/5 active:scale-95"
            >
              <span className="font-display text-3xl text-foreground/55 transition-colors group-hover:text-ember/80">
                [
              </span>
              <span className="font-display text-3xl tracking-tight text-foreground">
                {heroAward.count}+
              </span>
              <span className="font-display text-3xl text-foreground/55 transition-colors group-hover:text-ember/80">
                ]
              </span>
            </button>

            {/* Awards statement */}
            <p className="text-right font-tag text-[13px] font-bold leading-[1.5] text-foreground sm:text-[15px]">
              {heroAward.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>

          {/* Scroll pill */}
          <div className="mt-7 flex justify-center">
            <button
              onClick={() => {
                playSound("notch");
                scrollToSection("projects");
              }}
              className="pill-dark group flex items-center gap-3 rounded-full py-2 pl-2 pr-6 transition-all duration-300 hover:border-ember/60 hover:bg-[rgba(26,17,9,0.7)] active:scale-[0.98]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(243,236,227,0.08)] transition-all duration-300 group-hover:bg-ember">
                <ChevronDown className="animate-nudge h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-foreground/90">
                Scroll Down To Explore Works
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

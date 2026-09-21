"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import {
  Dribbble,
  Github,
  Linkedin,
  Mail,
  Twitter,
  type LucideIcon,
} from "lucide-react";
import { socials } from "@/lib/portfolio-data";

const EASE = [0.22, 1, 0.36, 1] as const;

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  GitHub: Github,
  LinkedIn: Linkedin,
  "X / Twitter": Twitter,
  Dribbble: Dribbble,
};

/**
 * Micro glass tooltip that floats beside a rail button.
 * Pure CSS (group-hover / group-focus-visible) — no portals.
 */
function RailTip({ label, side }: { label: string; side: "left" | "right" }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute top-1/2 z-50 -translate-y-1/2 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 ${
        side === "right"
          ? "left-full ml-3 -translate-x-2"
          : "right-full mr-3 translate-x-2"
      }`}
    >
      <span className="glass-strong block whitespace-nowrap rounded-full border-white/30 px-3 py-1.5 text-[11px] font-semibold text-foreground">
        {label}
      </span>
    </span>
  );
}

function RailDivider() {
  return (
    <span
      aria-hidden="true"
      className="h-px w-8 bg-gradient-to-r from-transparent via-white/25 to-transparent"
    />
  );
}

/**
 * RIGHT RAIL — full-height (100svh) liquid-glass utility sidebar.
 * Availability pulse → vertical social links → brand wordmark →
 * "start a project" CTA, plus a scroll-progress seam on the inner edge.
 * (Primary navigation lives in SidebarNotchNav on the left.)
 */
export function SideRailRight() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.4,
  });

  return (
    <motion.aside
      aria-label="Social links and shortcuts"
      initial={reduce ? false : { x: 84, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
      className="glass-rail-r fixed inset-y-0 right-0 z-40 hidden w-[76px] flex-col items-center md:flex"
    >
      {/* Scroll progress seam (inner edge) */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[2px] overflow-hidden bg-white/10"
      >
        <motion.div
          style={{ scaleY: progress }}
          className="h-full w-full origin-top bg-gradient-to-b from-[#ffe3ae] via-[#ffb45e] to-[#ff7a1c]"
        />
      </div>

      {/* Availability pulse */}
      <div className="pt-5">
        <div className="glass-chip group relative flex h-10 w-10 items-center justify-center rounded-full">
          <span className="status-dot" aria-hidden="true" />
          <RailTip label="Available for projects" side="left" />
        </div>
      </div>

      <div className="my-4">
        <RailDivider />
      </div>

      {/* Vertical social links */}
      <ul
        role="list"
        aria-label="Social links"
        className="no-scrollbar flex min-h-0 flex-1 flex-col items-center justify-center gap-2 overflow-y-auto py-2"
      >
        {socials.map((s, i) => {
          const Icon = SOCIAL_ICONS[s.label];
          return (
            <motion.li
              key={s.label}
              initial={reduce ? false : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.06, duration: 0.55, ease: EASE }}
            >
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${s.label} — ${s.handle}`}
                className="group relative flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 transition-all duration-300 hover:bg-white/15 hover:text-foreground active:scale-95"
              >
                <Icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
                <RailTip label={s.label} side="left" />
              </a>
            </motion.li>
          );
        })}
      </ul>

      {/* Bottom: vertical wordmark + CTA */}
      <div className="flex flex-col items-center gap-4 pb-5 pt-2">
        <div className="my-1">
          <RailDivider />
        </div>
        <p
          aria-hidden="true"
          className="hidden max-h-40 overflow-hidden whitespace-nowrap font-tag text-[9px] tracking-[0.32em] text-white/40 [writing-mode:vertical-rl] lg:block"
        >
          Blue Nile
        </p>
        <button
          onClick={() => scrollToContact()}
          aria-label="Start a project — go to contact"
          className="btn-light group relative flex h-10 w-10 items-center justify-center rounded-full"
        >
          <Mail className="h-4 w-4" strokeWidth={2} />
          <RailTip label="Start a project" side="left" />
        </button>
      </div>
    </motion.aside>
  );
}

function scrollToContact() {
  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

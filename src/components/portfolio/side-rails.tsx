"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import {
  BriefcaseBusiness,
  Dribbble,
  FolderKanban,
  Github,
  Home,
  LayoutGrid,
  Linkedin,
  Mail,
  Sparkles,
  Twitter,
  UserRound,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "lucide-react";
import { socials } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";
import { NAV_ITEMS, scrollToSection, useSoundEngine, type NavId } from "./nav";

const EASE = [0.22, 1, 0.36, 1] as const;

const NAV_ICONS: Record<NavId, LucideIcon> = {
  home: Home,
  projects: FolderKanban,
  about: UserRound,
  skills: Sparkles,
  services: BriefcaseBusiness,
  contact: Mail,
};

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
      className="h-px w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent"
    />
  );
}

/**
 * LEFT RAIL — full-height (100svh) liquid-glass navigation.
 * Brand monogram → vertical section icons with sliding active pill →
 * sound toggle + full menu. Desktop only (mobile keeps the top header).
 */
export function SideRailLeft({
  active,
  onOpenMenu,
}: {
  active: NavId;
  onOpenMenu: () => void;
}) {
  const reduce = useReducedMotion();
  const { mounted, soundOn, toggle } = useSoundEngine();

  return (
    <motion.nav
      aria-label="Primary navigation"
      initial={reduce ? false : { x: -84, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
      className="glass-rail-l fixed inset-y-0 left-0 z-40 hidden w-[76px] flex-col items-center md:flex"
    >
      {/* Brand monogram */}
      <div className="pt-5">
        <button
          onClick={() => {
            playSound("tap");
            scrollToSection("home");
          }}
          aria-label="Blue Nile — back to top"
          className="group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300 hover:scale-105 active:scale-95"
        >
          <span className="glass-strong flex h-10 w-10 items-center justify-center rounded-2xl font-display text-[11px] text-[#7c1a06]">
            BN
          </span>
        </button>
      </div>

      <div className="my-4">
        <RailDivider />
      </div>

      {/* Vertical section navigation */}
      <ul
        role="list"
        className="no-scrollbar flex min-h-0 flex-1 flex-col items-center justify-center gap-1.5 overflow-y-auto py-2"
      >
        {NAV_ITEMS.map((item, i) => {
          const Icon = NAV_ICONS[item.id];
          const isActive = active === item.id;
          return (
            <motion.li
              key={item.id}
              initial={reduce ? false : { opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.05, duration: 0.55, ease: EASE }}
            >
              <button
                onClick={() => {
                  playSound("tap");
                  scrollToSection(item.id);
                }}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-colors duration-300 ${
                  isActive
                    ? "text-[#7c1a06]"
                    : "text-foreground/70 hover:bg-white/10 hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="rail-active-pill"
                    className="absolute inset-0 rounded-2xl bg-white shadow-[0_8px_20px_-6px_rgba(84,12,0,0.55),inset_0_1px_0_rgba(255,255,255,0.9)]"
                    transition={{ type: "spring", bounce: 0.22, duration: 0.55 }}
                  />
                )}
                <Icon
                  className="relative z-10 h-[18px] w-[18px]"
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <RailTip label={item.label} side="right" />
              </button>
            </motion.li>
          );
        })}
      </ul>

      {/* Bottom utilities */}
      <div className="flex flex-col items-center gap-2 pb-5 pt-2">
        <RailDivider />
        <button
          onClick={toggle}
          aria-label={soundOn ? "Mute interface sounds" : "Enable interface sounds"}
          className="glass-chip group relative flex h-10 w-10 items-center justify-center rounded-full text-foreground/85 transition-all duration-300 hover:bg-white/20 active:scale-95"
        >
          {mounted &&
            (soundOn ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            ))}
          {mounted && (
            <RailTip label={soundOn ? "Sound on" : "Sound off"} side="right" />
          )}
        </button>
        <button
          onClick={() => {
            playSound("notch");
            onOpenMenu();
          }}
          aria-label="Open full menu"
          aria-haspopup="dialog"
          className="group relative flex h-10 w-10 items-center justify-center rounded-2xl text-foreground/85 transition-all duration-300 hover:bg-white/10 active:scale-95"
        >
          <LayoutGrid className="h-[18px] w-[18px]" />
          <RailTip label="Menu" side="right" />
        </button>
      </div>
    </motion.nav>
  );
}

/**
 * RIGHT RAIL — full-height (100svh) liquid-glass utility sidebar.
 * Availability pulse → vertical social links → brand wordmark →
 * "start a project" CTA, plus a scroll-progress seam on the inner edge.
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
          onClick={() => {
            playSound("chime");
            scrollToSection("contact");
          }}
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

"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import {
  initSoundEngine,
  isSoundEnabled,
  playSound,
  toggleSound,
} from "@/lib/sound";

const emptySubscribe = () => () => {};

/* External store so the sound toggle stays in sync without setState-in-effect */
const soundListeners = new Set<() => void>();
function subscribeSound(cb: () => void) {
  soundListeners.add(cb);
  return () => {
    soundListeners.delete(cb);
  };
}
function notifySoundChange() {
  soundListeners.forEach((l) => l());
}

export const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "services", label: "Services" },
  { id: "contact", label: "Contact" },
] as const;

export type NavId = (typeof NAV_ITEMS)[number]["id"];

/** Scroll-spy across the page sections. */
export function useActiveSection(): NavId {
  const [active, setActive] = useState<NavId>("home");

  useEffect(() => {
    const sections = NAV_ITEMS.map((n) => document.getElementById(n.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id as NavId);
          }
        }
      },
      // A slim horizontal band around the upper-middle of the viewport
      { rootMargin: "-38% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return active;
}

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Decorative ember arc + dot that marks the active nav item. */
function ActiveArc() {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pointer-events-none absolute -right-8 top-1/2 hidden -translate-y-1/2 lg:block"
      width="30"
      height="88"
      viewBox="0 0 30 88"
      fill="none"
      aria-hidden="true"
    >
      <motion.path
        d="M26 2 C 6 22, 6 56, 20 76"
        stroke="var(--ember)"
        strokeWidth="1.6"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.circle
        cx="20"
        cy="82"
        r="3.2"
        fill="var(--ember)"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.45, type: "spring", stiffness: 400, damping: 16 }}
      />
    </motion.svg>
  );
}

export function SideRail() {
  const active = useActiveSection();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const soundOn = useSyncExternalStore(subscribeSound, isSoundEnabled, () => false);

  useEffect(() => {
    // Initializes the WebAudio engine from localStorage (external system)
    initSoundEngine();
    notifySoundChange();
  }, []);

  return (
    <aside
      aria-label="Primary navigation"
      className="fixed inset-y-0 left-0 z-40 hidden w-20 flex-col items-center justify-between border-r border-[var(--line)] bg-[rgba(11,7,5,0.72)] py-5 backdrop-blur-md md:flex lg:w-24"
    >
      {/* Brand mark */}
      <button
        onClick={() => scrollToSection("home")}
        aria-label="Blue Nile — back to top"
        className="group flex flex-col items-center gap-1"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(232,99,44,0.45)] bg-[rgba(232,99,44,0.12)] font-display text-sm text-ember-bright transition-transform duration-300 group-hover:scale-105">
          BN
        </span>
        <span className="font-tag text-[8px] text-muted-foreground">Nile</span>
      </button>

      {/* Vertical nav */}
      <nav className="flex flex-1 flex-col items-center justify-center gap-7 py-6">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                playSound("tap");
                scrollToSection(item.id);
              }}
              aria-current={isActive ? "true" : undefined}
              className="group relative flex items-center justify-center"
            >
              <span
                className={`v-text font-tag text-[10px] font-bold transition-colors duration-300 lg:text-[11px] ${
                  isActive
                    ? "text-ember"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {item.label}
              </span>
              {isActive && <ActiveArc />}
              {/* hover dot */}
              {!isActive && (
                <span
                  className="absolute -right-4 h-1 w-1 rounded-full bg-ember opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Sound toggle */}
      <button
        onClick={() => {
          toggleSound();
          notifySoundChange();
        }}
        aria-label={soundOn ? "Mute interface sounds" : "Enable interface sounds"}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line-strong)] text-foreground/85 transition-all duration-300 hover:border-ember/60 hover:text-ember active:scale-95"
      >
        {mounted && (soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />)}
        {/* notification accent — decorative */}
        <span
          aria-hidden="true"
          className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-ember font-tag text-[8px] font-bold text-white shadow-[0_0_12px_rgba(232,99,44,0.7)]"
        >
          2
        </span>
      </button>
    </aside>
  );
}

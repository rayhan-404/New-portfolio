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

export function useSoundEngine() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const soundOn = useSyncExternalStore(subscribeSound, isSoundEnabled, () => false);

  useEffect(() => {
    // Initializes the WebAudio engine from localStorage (external system)
    initSoundEngine();
    notifySoundChange();
  }, []);

  return {
    mounted,
    soundOn,
    toggle: () => {
      toggleSound();
      notifySoundChange();
    },
  };
}

/**
 * Floating liquid-glass navigation — an Apple-style centered pill
 * anchored to the top of the viewport (desktop).
 */
export function FloatingNav() {
  const active = useActiveSection();
  const { mounted, soundOn, toggle } = useSoundEngine();

  return (
    <motion.nav
      aria-label="Primary navigation"
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className="fixed inset-x-0 top-4 z-40 hidden justify-center px-4 md:flex"
    >
      <div className="glass-nav flex items-center gap-1 rounded-full py-1.5 pl-3 pr-1.5">
        {/* Brand mark */}
        <button
          onClick={() => {
            playSound("tap");
            scrollToSection("home");
          }}
          aria-label="Blue Nile — back to top"
          className="group mr-1 flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition-colors duration-300 hover:bg-white/10"
        >
          <span className="glass-strong flex h-8 w-8 items-center justify-center rounded-full font-display text-[11px] text-[#7c1a06] transition-transform duration-300 group-hover:scale-105">
            BN
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Blue Nile
          </span>
        </button>

        {/* Links with sliding glass pill */}
        <ul className="flex items-center" role="list">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    playSound("tap");
                    scrollToSection(item.id);
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-300 lg:px-4 ${
                    isActive ? "text-[#7c1a06]" : "text-foreground/80 hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full bg-white shadow-[0_6px_18px_-6px_rgba(84,12,0,0.5),inset_0_1px_0_rgba(255,255,255,0.9)]"
                      transition={{ type: "spring", bounce: 0.22, duration: 0.55 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Divider */}
        <span className="mx-2 hidden h-5 w-px bg-white/25 lg:block" aria-hidden="true" />

        {/* Sound toggle */}
        <button
          onClick={toggle}
          aria-label={soundOn ? "Mute interface sounds" : "Enable interface sounds"}
          className="glass-chip relative flex h-9 w-9 items-center justify-center rounded-full text-foreground/90 transition-all duration-300 hover:bg-white/20 active:scale-95"
        >
          {mounted && (soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />)}
        </button>

        {/* CTA */}
        <button
          onClick={() => {
            playSound("chime");
            scrollToSection("contact");
          }}
          className="btn-light ml-1 hidden h-9 items-center rounded-full px-4 text-[13px] font-semibold lg:flex"
        >
          Hire Me
        </button>
      </div>
    </motion.nav>
  );
}

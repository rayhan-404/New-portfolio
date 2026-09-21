"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  initSoundEngine,
  isSoundEnabled,
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

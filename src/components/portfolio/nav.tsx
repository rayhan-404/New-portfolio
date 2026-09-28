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
  { id: "journey", label: "Journey" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "services", label: "Services" },
  { id: "contact", label: "Contact" },
] as const;

export type NavId = (typeof NAV_ITEMS)[number]["id"];

/**
 * Custom event fired by every "go to section" action. Each section is
 * wrapped in a <SlideSection id=…> which listens for its own id and
 * performs the instant landing + slide-in reveal.
 */
export const SECTION_NAVIGATE_EVENT = "portfolio:section-navigate";

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

/**
 * Navigate to a section. Fires SECTION_NAVIGATE_EVENT — the matching
 * SlideSection instantly lands flush with the viewport top and plays
 * its slide-in reveal. (Never scrollIntoView: scroll-margin/padding
 * would offset the landing.)
 */
export function scrollToSection(id: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SECTION_NAVIGATE_EVENT, { detail: id }));
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

"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { playSound } from "@/lib/sound";

const STORAGE_KEY = "mr-theme";
const emptySubscribe = () => () => {};

/* The external system is the <html> class list (mutated by the
   pre-paint bootstrap script in layout.tsx and by toggle() below).
   A MutationObserver turns class changes into re-renders without any
   setState-in-effect cascades. */
function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}
const isDark = () => document.documentElement.classList.contains("dark");

/**
 * Light/dark switch for the deep-orange neumorphic theme.
 * Default is the signature warm cream light theme;
 * the choice persists in localStorage ("mr-theme").
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const dark = useSyncExternalStore(subscribeTheme, isDark, () => false);

  const toggle = useCallback(() => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      /* private mode — theme just won't persist */
    }
    playSound("tap");
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={dark}
      className={`glass-chip group flex h-10 w-10 items-center justify-center rounded-full text-primary transition-all duration-300 hover:shadow-[var(--shadow-neu)] active:scale-95 ${className}`}
    >
      {dark ? (
        <Moon className="h-[17px] w-[17px]" strokeWidth={1.9} />
      ) : (
        <Sun className="h-[17px] w-[17px]" strokeWidth={1.9} />
      )}
    </button>
  );
}

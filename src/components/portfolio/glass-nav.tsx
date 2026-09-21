"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, Moon, Sun, Volume2, VolumeX, X } from "lucide-react";
import { useTheme } from "next-themes";
import { person } from "@/lib/portfolio-data";
import { initSoundEngine, isSoundEnabled, playSound, toggleSound } from "@/lib/sound";

const NAV_LINKS = [
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
] as const;

export function GlassNav({ onResume }: { onResume: () => void }) {
  const [active, setActive] = useState<string>("about");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 28);
  });

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    NAV_LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => window.innerWidth >= 768 && setMobileOpen(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const go = (id: string) => {
    playSound("notch");
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:top-4 sm:px-4"
    >
      <nav
        aria-label="Primary"
        className={`glass-nav relative flex w-full max-w-3xl items-center gap-2 rounded-full py-2 pl-3 pr-2 transition-shadow duration-500 ${
          scrolled ? "shadow-[0_22px_50px_-16px_rgba(0,0,0,0.55)]" : ""
        }`}
      >
        {/* Monogram */}
        <button
          onClick={() => go("about")}
          aria-label="Back to top"
          className="glass-strong group flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        >
          <span className="font-mono text-sm font-bold tracking-tight transition-transform duration-300 group-hover:scale-110">
            {person.monogram}
          </span>
        </button>

        {/* Name */}
        <button
          onClick={() => go("about")}
          className="mr-1 hidden shrink-0 items-center gap-2 sm:flex"
          aria-label="Rayhan — home"
        >
          <span className="text-sm font-semibold tracking-tight">{person.name}</span>
          <span className="status-dot" aria-hidden="true" />
        </button>

        {/* Desktop links */}
        <ul className="mx-auto hidden items-center gap-0.5 md:flex" role="list">
          {NAV_LINKS.map(({ id, label }) => (
            <li key={id} className="relative">
              <button
                onClick={() => go(id)}
                aria-current={active === id ? "true" : undefined}
                className={`relative rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-300 ${
                  active === id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active === id && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="glass-strong absolute inset-0 rounded-full"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.55 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <SoundToggle />
          <ThemeToggle />
          <button
            onClick={() => go("contact")}
            className="hidden rounded-full bg-foreground px-4 py-1.5 text-[13px] font-semibold text-background transition-all duration-300 hover:scale-[1.04] hover:opacity-90 active:scale-95 md:inline-flex"
          >
            Let&apos;s Talk
          </button>
          <button
            onClick={() => {
              playSound("tap");
              setMobileOpen((v) => !v);
            }}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
            className="glass flex h-9 w-9 items-center justify-center rounded-full md:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile dropdown — portaled to <body> so its backdrop blur covers the page,
            not just the nav (backdrop-filter ancestors act as backdrop roots) */}
        {typeof document !== "undefined" &&
          createPortal(
            <AnimatePresence>
              {mobileOpen && (
                <>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    aria-label="Close menu"
                    tabIndex={-1}
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 z-40 cursor-default bg-black/30 backdrop-blur-[2px] md:hidden"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="glass-solid fixed inset-x-3 top-[74px] z-50 rounded-3xl p-2 md:hidden"
                  >
                    <ul role="list" className="flex flex-col">
                      {NAV_LINKS.map(({ id, label }) => (
                        <li key={id}>
                          <button
                            onClick={() => go(id)}
                            className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                              active === id ? "glass text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {label}
                          </button>
                        </li>
                      ))}
                      <li className="p-1.5">
                        <button
                          onClick={() => {
                            setMobileOpen(false);
                            onResume();
                          }}
                          className="w-full rounded-2xl border border-[var(--glass-border)] px-4 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                          Resume / CV
                        </button>
                      </li>
                    </ul>
                  </motion.div>
                </>
              )}
            </AnimatePresence>,
            document.body
          )}
      </nav>
    </motion.header>
  );
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => {
        playSound("tap");
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
      }}
      aria-label="Toggle theme"
      className="glass flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-300 hover:scale-105 active:scale-95"
    >
      {/* CSS-driven icon swap — hydration safe */}
      <Sun className="hidden h-4 w-4 dark:block" />
      <Moon className="h-4 w-4 dark:hidden" />
    </button>
  );
}

function SoundToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    initSoundEngine();
    // Deferred so the persisted preference syncs after paint (avoids sync setState in effect)
    const id = window.setTimeout(() => setOn(isSoundEnabled()), 0);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <button
      onClick={() => setOn(toggleSound())}
      aria-label={on ? "Mute sound effects" : "Enable sound effects"}
      aria-pressed={on}
      className="glass hidden h-9 w-9 items-center justify-center rounded-full transition-transform duration-300 hover:scale-105 active:scale-95 sm:flex"
    >
      {on ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
    </button>
  );
}

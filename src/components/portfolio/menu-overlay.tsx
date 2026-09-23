"use client";

import { useEffect, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { NAV_ITEMS, scrollToSection } from "./nav";
import { socials } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";

const EASE = [0.22, 1, 0.36, 1] as const;
const emptySubscribe = () => () => {};

export function MenuOverlay({
  open,
  onOpenChange,
  active,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  active: string;
}) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  const go = (id: string) => {
    playSound("notch");
    onOpenChange(false);
    // Wait for the overlay exit before scrolling
    window.setTimeout(() => scrollToSection(id), 180);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-[80] flex flex-col bg-[rgba(70,12,4,0.55)] backdrop-blur-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Top row */}
          <div className="relative flex items-center justify-between px-5 py-5 md:px-10">
            <span className="font-display text-xl leading-none text-foreground">
              M<br />Rayhan
            </span>
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close menu"
              className="glass-chip flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-all duration-300 hover:bg-white/25 active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Big links */}
          <nav className="relative flex flex-1 flex-col justify-center px-5 md:px-10" aria-label="Menu">
            <ul className="flex flex-col gap-1 sm:gap-2">
              {NAV_ITEMS.map((item, i) => {
                const isActive = active === item.id;
                return (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ delay: 0.06 + i * 0.05, duration: 0.55, ease: EASE }}
                  >
                    <button
                      onClick={() => go(item.id)}
                      className="group flex items-baseline gap-4 text-left"
                    >
                      <span className="font-tag text-[10px] text-gold-bright/80">
                        0{i + 1}
                      </span>
                      <span
                        className={`font-display text-[clamp(2.2rem,7vw,4.5rem)] uppercase leading-[1.02] tracking-tight transition-colors duration-300 ${
                          isActive
                            ? "text-gold-bright"
                            : "text-foreground/85 group-hover:text-gold-bright"
                        }`}
                      >
                        {item.label}
                      </span>
                      <span
                        aria-hidden="true"
                        className="ml-2 hidden h-2 w-2 self-center rounded-full bg-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block"
                      />
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          {/* Footer of overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="relative flex flex-col gap-4 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-10"
          >
            <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Social links">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="font-tag text-[10px] text-white/65 transition-colors duration-300 hover:text-foreground"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            {mounted && (
              <p className="font-tag text-[10px] text-white/45">
                © {new Date().getFullYear()} M Rayhan
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

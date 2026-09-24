"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { person } from "@/lib/portfolio-data";
import { playSound } from "@/lib/sound";

export function MobileHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  /* Gold scroll-progress seam — the mobile twin of the desktop right
     rail's progress bar. Transform-only (scaleX) so it never triggers
     layout work while scrolling. */
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.4,
  });

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="glass-nav fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-border px-5 py-3 md:hidden"
      aria-label="Mobile navigation"
    >
      <button
        onClick={() => playSound("tap")}
        className="flex items-center gap-2.5 text-left"
        aria-label="M Rayhan home"
      >
        <span className="font-display text-lg leading-none text-foreground">
          M <span className="text-gold">Rayhan</span>
        </span>
        <span className="font-tag hidden text-[8px] text-muted-foreground xs:block">
          {person.name}
        </span>
      </button>

      <button
        onClick={() => {
          playSound("notch");
          onOpenMenu();
        }}
        aria-label="Open menu"
        aria-haspopup="dialog"
        className="glass-chip flex h-10 w-10 flex-col items-center justify-center gap-[6px] rounded-full transition-all duration-300 active:scale-95"
      >
        <span className="h-px w-4.5 bg-foreground" />
        <span className="mr-2 h-px w-3 self-end bg-foreground" />
      </button>

      {/* Scroll progress seam — along the header's bottom edge */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-[#ab47bc] via-[#c26bdc] to-[#e040fb]"
      />
    </motion.header>
  );
}

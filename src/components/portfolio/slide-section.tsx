"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  motion,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import { SECTION_NAVIGATE_EVENT } from "./nav";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * SlideSection — wraps every portfolio section.
 *
 * When SECTION_NAVIGATE_EVENT fires with this section's id, the block
 * lands flush with the viewport top (instant, bypassing every
 * scroll-margin/padding) and slides in from the left while opacity
 * ramps 0.35 → 1.
 *
 * Mobile performance contract:
 * • Animate transform + opacity ONLY — both composite on the GPU,
 *   zero layout / zero paint work per frame.
 * • No scroll-linked JS lives inside this wrapper, so free scrolling
 *   never triggers React work here.
 * • framer-motion raises `will-change` only while animating and drops
 *   it afterwards, so no oversized layer is kept alive during scroll.
 */
export function SlideSection({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const reduce = useReducedMotion();

  useEffect(() => {
    const onNavigate = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== id) return;
      const el = document.getElementById(id);
      if (!el) return;

      const rect = el.getBoundingClientRect();
      // Already comfortably on screen → don't replay the reveal.
      const alreadyInView =
        rect.top > -80 && rect.top < window.innerHeight * 0.4;

      // Land flush: scroll so the SECTION's own top = viewport top.
      // (Measured before the reveal transform starts, so the rect is
      // the true static position. Using the outer wrapper here used
      // to land short whenever the section's top margin/padding was
      // trapped inside the wrapper's will-change containing block —
      // the band stayed inside the previous section and the tapped
      // nav tile never activated.)
      const y = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y, behavior: "instant" });

      if (reduce || alreadyInView) return;
      void controls.start({
        x: ["-100%", "0%"],
        opacity: [0.35, 1],
        transition: { duration: 0.8, ease: EASE },
      });
    };

    window.addEventListener(SECTION_NAVIGATE_EVENT, onNavigate);
    return () =>
      window.removeEventListener(SECTION_NAVIGATE_EVENT, onNavigate);
  }, [controls, id, reduce]);

  return (
    <div ref={ref} data-slide-section={id} className="relative">
      <motion.div animate={controls} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

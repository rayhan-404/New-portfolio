"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Fixed aurora scene: ambient gradient orbs drifting behind all content,
 * plus film grain. The whole scene gently parallaxes with scroll.
 */
export function AuroraBackground() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const ySlow = useTransform(scrollY, [0, 3000], [0, -180]);
  const yFast = useTransform(scrollY, [0, 3000], [0, -320]);

  return (
    <>
      <div className="aurora-scene" aria-hidden="true">
        <motion.div style={reduce ? undefined : { y: ySlow }} className="absolute inset-0">
          <div
            className="aurora-orb h-[52vw] w-[52vw] -top-[18vw] -left-[10vw]"
            style={{ background: "var(--orb-1)" }}
          />
          <div
            className="aurora-orb h-[38vw] w-[38vw] top-[8vh] -right-[12vw]"
            style={{ background: "var(--orb-2)" }}
          />
        </motion.div>
        <motion.div style={reduce ? undefined : { y: yFast }} className="absolute inset-0">
          <div
            className="aurora-orb h-[30vw] w-[30vw] top-[70vh] left-[8vw]"
            style={{ background: "var(--orb-3)" }}
          />
          <div
            className="aurora-orb h-[36vw] w-[36vw] top-[160vh] right-[4vw]"
            style={{ background: "var(--orb-4)" }}
          />
          <div
            className="aurora-orb h-[40vw] w-[40vw] top-[280vh] -left-[14vw]"
            style={{ background: "var(--orb-1)" }}
          />
        </motion.div>
        {/* Hairline grid for texture */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse 90% 60% at 50% 0%, black 30%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 90% 60% at 50% 0%, black 30%, transparent 80%)",
          }}
        />
      </div>
      <div className="aurora-grain" aria-hidden="true" />
    </>
  );
}

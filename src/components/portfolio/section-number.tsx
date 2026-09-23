"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

/**
 * SectionNumber — giant outlined ghost numeral floating behind a
 * section (text-outline utility supplies the stroke).
 *
 * Parallax contract (user spec): the numeral drifts BACKWARD by 5%
 * of its own height across the section's scroll journey — subtle,
 * never distracting. `speed` only nudges that drift (1.1 ≈ 5.5%).
 *
 * The outer span is absolutely positioned by the parent via
 * `className` (e.g. "-top-4 right-0 hidden text-[11rem] lg:block").
 */
export function SectionNumber({
  index,
  className = "",
  speed = 1,
}: {
  index: string;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `${(-5 * speed).toFixed(2)}%`]
  );

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`text-outline font-display pointer-events-none absolute select-none leading-none ${className}`}
    >
      <motion.span
        style={reduce ? undefined : { y }}
        className="block will-change-transform"
      >
        {index}
      </motion.span>
    </span>
  );
}

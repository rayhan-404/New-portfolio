"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "./reveal";

const EASE = [0.22, 1, 0.36, 1] as const;

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  const reduce = useReducedMotion();

  return (
    <Reveal className={centered ? "text-center" : ""}>
      <div className={`flex items-center gap-3 ${centered ? "justify-center" : ""}`}>
        {/* v93: the rule DRAWS itself in (scaleX) instead of fading —
            a quiet drafting-table cue under every section eyebrow */}
        <motion.span
          aria-hidden="true"
          className="h-px w-10 origin-right"
          style={{
            background: centered
              ? "linear-gradient(90deg, transparent, var(--gold))"
              : "linear-gradient(90deg, transparent, var(--gold))",
          }}
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
        />
        <p className="font-tag text-[10.5px] font-bold text-accent-ink">{eyebrow}</p>
        {centered && (
          <motion.span
            aria-hidden="true"
            className="h-px w-10 origin-left"
            style={{ background: "linear-gradient(90deg, var(--gold), transparent)" }}
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          />
        )}
      </div>
      <h2 className="font-display text-glow text-foreground mt-4 text-3xl leading-[1.04] tracking-tight sm:text-4xl lg:text-[2.9rem]">
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground ${centered ? "mx-auto" : ""}`}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}

"use client";

/**
 * Site-wide storm — the hero's procedural bolts, let loose across the
 * whole viewport. A fixed overlay (under the nav rail, above the page)
 * strikes wherever you are on the site: fresh geometry from a top
 * corner and the sky flash radiating from the bolt's own origin.
 * Silent by design — the storm is visual only. Independent clock
 * from the hero's in-card storm, slightly offset so bursts
 * alternate. Reduced motion = clear skies.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FLASH_OPACITY,
  FLASH_TIMES,
  STRIKE_MS,
  genStrike,
  LightningBolt,
} from "./hero-section";

/* bolt size relative to the viewport — smaller than the hero's
   in-card strikes (the whole page is the sky here, not one frame) */
const GLOBAL_DESKTOP = { wMin: 17, wMax: 28, hMin: 24, hMax: 38, reachMin: 92, reachMax: 120 };
const GLOBAL_MOBILE = { wMin: 32, wMax: 50, hMin: 22, hMax: 34, reachMin: 86, reachMax: 112 };

export function GlobalThunder() {
  const reduce = useReducedMotion();
  const [strike, setStrike] = useState(0);
  const chainRef = useRef({ remaining: 0 });

  /* same storm rhythm as the hero (bursts, then a sky that rests),
     first bolt joining the hero's a beat later so they alternate */
  useEffect(() => {
    if (reduce) return;
    chainRef.current = { remaining: 1 + Math.floor(Math.random() * 3) };
    let alive = true;
    let t: number;
    const gap = () => {
      const c = chainRef.current;
      if (c.remaining > 0) {
        c.remaining--;
        return 150 + Math.random() * 350;
      }
      c.remaining = 1 + Math.floor(Math.random() * 3);
      return 4400 + Math.random() * 4600;
    };
    const loop = (delay: number) => {
      t = window.setTimeout(() => {
        if (!alive) return;
        setStrike((s) => s + 1);
        loop(gap());
      }, delay);
    };
    loop(2400 + Math.random() * 1800);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [reduce]);

  /* fresh bolt at a fresh corner every strike — sides alternate,
     geometry sized to the current viewport; runs client-side only */
  const strikes = useMemo(
    () =>
      strike > 0
        ? genStrike(
            window.innerWidth < 640 ? GLOBAL_MOBILE : GLOBAL_DESKTOP,
            (["left", "right"] as const)[strike % 2]
          )
        : null,
    [strike]
  );

  if (reduce) return null;

  return (
    <div
      data-global-thunder="1"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[25] overflow-hidden"
    >
      {strike > 0 && strikes && (
        <>
          <LightningBolt key={`gt-${strike}`} strike={strikes} />
          {/* room flash — one full-viewport glow centered on the bolt's
              entry corner; the radial dies inside its own box, and the
              screen blend lights every section the bolt hangs over */}
          <motion.div
            key={`gf-${strike}`}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(46% 44% at ${strikes.flashX.toFixed(2)}% ${strikes.flashY.toFixed(2)}%, rgba(var(--accent-rgb)/${strikes.far ? 0.2 : 0.32}), rgba(var(--primary-rgb)/${strikes.far ? 0.09 : 0.14}) 55%, transparent 100%)`,
              mixBlendMode: "screen",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: FLASH_OPACITY }}
            transition={{ duration: STRIKE_MS, times: FLASH_TIMES, ease: "linear", delay: 0.07 }}
          />
        </>
      )}
    </div>
  );
}

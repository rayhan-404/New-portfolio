"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ChevronDown, GraduationCap, Telescope } from "lucide-react";
import { RichBio, useSiteContent } from "@/lib/use-site-data";
import type { HeroContent } from "@/lib/site-defaults";
import {
  CUTOUT_BASE,
  HERO_ACCENT_IDS,
  PORTRAIT_BASE,
  cutoutVariant,
  portraitVariant,
} from "@/lib/hero-variants";
import { playSound } from "@/lib/sound";
import { scrollToSection } from "./nav";

const EASE = [0.22, 1, 0.36, 1] as const;

/* m-rayhan-cutout-lossless.webp intrinsic size — the user's own Photoroom
   export, bbox-trimmed +14px pad, saved LOSSLESS (verified 100%
   pixel-identical to the source) and served unoptimized, so no optimizer
   ever re-encodes or resamples a single pixel. Filename is version-stamped:
   never overwrite this asset in place — browsers cache the old bytes. */
const HEADSHOT_W = 983;
const HEADSHOT_H = 1349;

/* ── Desktop card light map ─────────────────────────────────────
   The HD portrait's white lamps (upper-right double strip, left
   strip, lower-right glow) re-lit as the drawn accent's reflected
   light. v61 tuned these on the same composition; the card's
   mirrored headroom shifts every photo feature +10% down. */
const CARD_LIGHT_BLOOMS = [
  "radial-gradient(38% 9% at 84% 25%, rgba(var(--accent-rgb)/0.5), transparent 72%)",
  "radial-gradient(30% 8% at 90% 31.5%, rgba(var(--primary-rgb)/0.4), transparent 72%)",
  "radial-gradient(18% 7% at 2% 43%, rgba(var(--accent-rgb)/0.4), transparent 75%)",
  "radial-gradient(26% 9% at 97% 79%, rgba(var(--accent-rgb)/0.45), transparent 75%)",
];

/* Direct recolor pass — `color`-blend radials painted exactly ON the
   lamp strips so their warm gold takes the drawn hue as its own;
   luminance is preserved, so they still read as lit surfaces. */
const CARD_LIGHT_RECOLOR = [
  "radial-gradient(34% 8% at 84% 25%, rgba(var(--accent-rgb)/0.6), transparent 74%)",
  "radial-gradient(26% 7% at 90% 31.5%, rgba(var(--primary-rgb)/0.5), transparent 74%)",
  "radial-gradient(16% 6% at 2% 43%, rgba(var(--accent-rgb)/0.55), transparent 76%)",
  "radial-gradient(22% 8% at 97% 79%, rgba(var(--accent-rgb)/0.5), transparent 76%)",
];

/* ── Suit that follows the theme ───────────────────────────────────
   The accent pool draws one of ten hues on every refresh (the nav
   cycle button walks them). For EACH hue a deterministic recolor of
   the hero photos exists — same pixels, suit re-tinted to the hue —
   so the drawn accent dresses the suit to match. Each variant mounts
   only after the browser has decoded it, then crossfades over the
   navy original, so no theme switch ever flashes an empty frame. */

/* the drawn accent id, kept live — the pre-paint boot script and the
   nav cycle button both write documentElement.dataset.accent */
function useAccentId(): string | null {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    const el = document.documentElement;
    const read = () => setId(el.dataset.accent ?? null);
    read();
    const mo = new MutationObserver(read);
    mo.observe(el, { attributes: true, attributeFilter: ["data-accent"] });
    return () => mo.disconnect();
  }, []);
  return id;
}

/* resolve when the browser has the pixels ready (errors resolve too —
   the base photo stays underneath as the permanent fallback) */
const decodeImage = (src: string) =>
  new Promise<void>((resolve) => {
    if (typeof window === "undefined") return resolve();
    const img = new window.Image();
    img.src = src;
    if (typeof img.decode === "function") img.decode().then(resolve, resolve);
    else {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    }
  });

/* ── Thunder — procedural lightning in the drawn hue ───────────
   No canned bolt: every strike runs a midpoint-displacement
   recursion that jags a fresh main channel — entered DIAGONALLY
   from a top corner of the frame (left ↔ right alternating),
   reaching LONG down into the picture — with 3–5 forks, some
   carrying twigs. Three stacked passes (accent haze, vivid
   channel, white-hot core) read as electric heat inside the
   drawn hue; the strike flickers with a real restrike signature
   (spike → micro-flicker decay → blackout → re-strike → fade)
   and the corner flash — positioned at the bolt's own entry —
   reflects on the face. Reduced motion = clear skies. */
type Pt = [number, number];

interface BoltBranch {
  d: string;
  depth: 0 | 1; // 0 = fork off the channel, 1 = twig off a fork
}

interface Strike {
  main: string;
  branches: BoltBranch[];
  /* landing spot across the stage, in % */
  left: number;
  width: number;
  height: number;
  /* the bolt's own origin in stage % — the flash radiates from here */
  flashX: number;
  flashY: number;
  /* depth: far bolts recede into the backdrop — smaller, dimmer, softer */
  far: boolean;
}

interface StrikeRanges {
  wMin: number;
  wMax: number;
  hMin: number;
  hMax: number;
  /* how deep the channel reaches, in unit-space y (150 = box bottom) */
  reachMin: number;
  reachMax: number;
}

const MOBILE_STRIKE: StrikeRanges = { wMin: 42, wMax: 62, hMin: 55, hMax: 80, reachMin: 128, reachMax: 148 };
const DESKTOP_STRIKE: StrikeRanges = { wMin: 30, wMax: 48, hMin: 34, hMax: 48, reachMin: 106, reachMax: 128 };

const clampN = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* midpoint-displacement recursion — subdivides the segment, kicks
   each midpoint sideways by a random share of the displacement
   budget, halves the budget, recurses until fine-grained */
function jagged(x1: number, y1: number, x2: number, y2: number, disp: number): Pt[] {
  const pts: Pt[] = [[x1, y1]];
  const split = (ax: number, ay: number, bx: number, by: number, d: number) => {
    if (d < 2.4) {
      pts.push([bx, by]);
      return;
    }
    const mx = (ax + bx) / 2 + (Math.random() - 0.5) * d;
    const my = (ay + by) / 2 + (Math.random() - 0.5) * d * 0.55;
    split(ax, ay, mx, my, d / 2);
    split(mx, my, bx, by, d / 2);
  };
  split(x1, y1, x2, y2, disp);
  return pts;
}

const toPath = (pts: Pt[]) =>
  `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}`;

/* one full strike for one stage: fresh geometry that ENTERS at a top
   corner and drives diagonally across the sky, reaching long into the
   picture (geometry lives in a 100×150 unit box the placement scales
   — runs client-side only, after the strike clock mounts, so SSR
   never sees it) */
export function genStrike(r: StrikeRanges, side: "left" | "right"): Strike {
  const fromLeft = side === "left";
  /* entry pinned to a top corner, exit deep on the opposite half —
     the diagonal trend is what makes it read as weather, not a
     straight vertical drop */
  const sx = fromLeft ? 1 + Math.random() * 7 : 92 + Math.random() * 7;
  const sy = 2 + Math.random() * 8;
  const ex = fromLeft ? 40 + Math.random() * 38 : 22 + Math.random() * 38;
  const ey = r.reachMin + Math.random() * (r.reachMax - r.reachMin);
  const mainPts = jagged(sx, sy, ex, ey, 56);

  const branches: BoltBranch[] = [];
  const forks = 3 + Math.floor(Math.random() * 3); // 3–5 forks
  for (let i = 0; i < forks; i++) {
    const t = 0.14 + Math.random() * 0.48; // forks live in the upper ⅔
    const [px, py] = mainPts[Math.floor(t * (mainPts.length - 1))];
    const ang = (Math.random() - 0.5) * 1.9; // ±~54° off the channel
    const len = 38 + Math.random() * 34;
    const bx = clampN(px + Math.sin(ang) * len, 4, 96);
    const by = clampN(py + Math.cos(ang) * len * 0.85, 20, 148);
    const bp = jagged(px, py, bx, by, len * 0.45);
    branches.push({ d: toPath(bp), depth: 0 });
    if (Math.random() < 0.5) {
      const [tx, ty] = bp[Math.floor(bp.length / 2)];
      const tang = ang + (Math.random() - 0.5) * 2.2;
      const tlen = len * (0.35 + Math.random() * 0.25);
      branches.push({
        d: toPath(
          jagged(
            tx,
            ty,
            clampN(tx + Math.sin(tang) * tlen, 4, 96),
            clampN(ty + Math.cos(tang) * tlen * 0.8, 24, 148),
            tlen * 0.4
          )
        ),
        depth: 1,
      });
    }
  }

  /* depth: near bolts dominate the sky; far bolts recede into the
     backdrop — smaller, dimmer, softer (the render dims them further) */
  const far = Math.random() < 0.45;
  let width = r.wMin + Math.random() * (r.wMax - r.wMin);
  let height = r.hMin + Math.random() * (r.hMax - r.hMin);
  if (far) {
    width *= 0.78;
    height *= 0.78;
  }
  /* pin the bolt's entry to the requested top corner — a touch beyond
     the frame edge reads as the strike arriving from outside the
     picture; the flash then radiates from that corner */
  const cornerX = fromLeft ? -3 + Math.random() * 14 : 89 + Math.random() * 14;
  const left = clampN(cornerX - (sx / 100) * width, -4, 100 - width + 4);
  const flashX = left + (sx / 100) * width;
  const flashY = (sy / 150) * height;

  return { main: toPath(mainPts), branches, left, width, height, flashX, flashY, far };
}

/* real-lightning restrike signature: spike → micro-flicker decay →
   blackout → re-strike → fade; the room answers softer than the bolt,
   the face softer still */
export const STRIKE_MS = 1.15;
const BOLT_TIMES = [0, 0.05, 0.11, 0.17, 0.25, 0.33, 0.42, 0.48, 0.56, 0.68, 0.82, 1];
const BOLT_OPACITY = [0, 1, 0.5, 0.88, 0.4, 0.72, 0.1, 0.08, 0.62, 0.3, 0.12, 0];
export const FLASH_TIMES = [0, 0.05, 0.13, 0.22, 0.33, 0.48, 0.56, 0.72, 1];
export const FLASH_OPACITY = [0, 0.95, 0.3, 0.7, 0.15, 0.12, 0.55, 0.2, 0];
const FACE_TIMES = FLASH_TIMES;
const FACE_OPACITY = [0, 1, 0.35, 0.8, 0.3, 0.25, 0.7, 0.25, 0];

export function LightningBolt({ strike: s }: { strike: Strike }) {
  return (
    <motion.svg
      viewBox="0 0 100 150"
      preserveAspectRatio="none"
      aria-hidden="true"
      data-bolt="1"
      className="pointer-events-none absolute z-0 overflow-visible"
      style={{
        left: `${s.left}%`,
        top: 0,
        width: `${s.width}%`,
        height: `${s.height}%`,
        filter: s.far
          ? "blur(1.4px) drop-shadow(0 0 4px rgba(var(--accent-rgb)/0.55)) drop-shadow(0 0 14px rgba(var(--accent-rgb)/0.3))"
          : "drop-shadow(0 0 5px rgba(var(--accent-rgb)/0.9)) drop-shadow(0 0 18px rgba(var(--accent-rgb)/0.5))",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: BOLT_OPACITY }}
      /* the in-cloud flash leads the channel by a beat — the sky lights
         up before the bolt shows itself, like real lightning */
      transition={{ duration: STRIKE_MS, times: BOLT_TIMES, ease: "linear", delay: 0.07 }}
    >
      <g
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        opacity={s.far ? 0.62 : 1}
      >
        {/* wide accent haze — the bolt's atmosphere */}
        <g stroke="rgb(var(--accent-rgb))" style={{ opacity: 0.5, filter: "blur(6px)" }}>
          <motion.path
            d={s.main}
            strokeWidth={7.5}
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
          />
          {s.branches.map((b, i) => (
            <motion.path
              key={i}
              d={b.d}
              strokeWidth={b.depth === 0 ? 4.4 : 3}
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.11, delay: 0.03 + i * 0.012, ease: "easeOut" }}
            />
          ))}
        </g>
        {/* vivid accent channel */}
        <g stroke="var(--accent-ref)">
          <motion.path
            d={s.main}
            strokeWidth={2.7}
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
          />
          {s.branches.map((b, i) => (
            <motion.path
              key={i}
              d={b.d}
              strokeWidth={b.depth === 0 ? 1.7 : 1.1}
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.11, delay: 0.03 + i * 0.012, ease: "easeOut" }}
            />
          ))}
        </g>
        {/* white-hot core — the electric heat inside the hue */}
        <g stroke="rgba(255, 255, 255, 0.92)">
          <motion.path
            d={s.main}
            strokeWidth={1.15}
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
          />
          {s.branches
            .filter((b) => b.depth === 0)
            .map((b, i) => (
              <motion.path
                key={i}
                d={b.d}
                strokeWidth={0.8}
                stroke="rgba(255, 255, 255, 0.65)"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.11, delay: 0.03 + i * 0.012, ease: "easeOut" }}
              />
            ))}
        </g>
      </g>
    </motion.svg>
  );
}

/* ── Personal intro copy — admin-editable (Admin → Hero) ─────── */

function IntroBio({
  hero,
  className = "",
}: {
  hero: HeroContent;
  className?: string;
}) {
  /* the first body paragraph after the lead wears the dropcap */
  const dropcapIndex = hero.paragraphs.findIndex(
    (p, i) => i > 0 && p.style === "body"
  );
  return (
    <div className={`flex flex-col gap-3.5 ${className}`}>
      {hero.paragraphs.map((p, i) => {
        const isDropcap = i === dropcapIndex;
        return (
          <p
            key={i}
            className={
              p.style === "lead"
                ? "font-fraunces text-[1.35rem] italic leading-[1.4] tracking-[-0.01em] text-foreground/85 sm:text-[1.55rem]"
                : p.style === "closing"
                  ? "font-book text-left text-[15px] font-semibold leading-[1.72] text-foreground sm:text-[16px]"
                  : "font-book text-left text-[15px] leading-[1.72] text-foreground/80 sm:text-[16px]"
            }
          >
            <RichBio paragraph={p} dropcap={isDropcap} />
          </p>
        );
      })}
    </div>
  );
}

export function HeroSection() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { hero } = useSiteContent();

  /* Greeting — trailing dots get the gold-gradient treatment */
  const greetMatch = hero.greeting.match(/^(.*?)(\.{1,3})\s*$/);
  const greetMain = greetMatch ? greetMatch[1] : hero.greeting;
  const greetDots = greetMatch ? greetMatch[2] : "";

  /* ── suit follows the theme ──
     `stage` gates which of the two photos' variants to decode (the
     other stage's variant would be wasted bytes). The chosen variant
     mounts ONLY once decoded, crossfading over the navy original. */
  const accentId = useAccentId();
  const [stage, setStage] = useState<"mobile" | "desktop" | null>(null);
  const [suitShown, setSuitShown] = useState<string | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setStage(mq.matches ? "desktop" : "mobile");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!accentId || !stage) return;
    let alive = true;
    const variantOf = stage === "desktop" ? portraitVariant : cutoutVariant;
    decodeImage(variantOf(accentId)).then(() => {
      if (alive) setSuitShown(accentId);
    });
    /* progressive idle prewarm — after the drawn suit is on, quietly
       decode the remaining hues so cycling the theme is instant */
    const timers = HERO_ACCENT_IDS.filter((a) => a !== accentId).map(
      (a, i) =>
        window.setTimeout(() => {
          decodeImage(variantOf(a));
        }, 1400 + i * 700)
    );
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [accentId, stage]);

  /* Thunder strike clock — real storms burst: the first bolt arrives
     within ~1s, strikes chain 150–500ms apart (2–4 per burst), and the
     sky rests a few seconds before the next burst rolls in — storm
     like before, with room to breathe. Reduced motion = clear skies. */
  const [strike, setStrike] = useState(0);
  const chainRef = useRef({ remaining: 0 });
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
      return 3800 + Math.random() * 4200;
    };
    const loop = (delay: number) => {
      t = window.setTimeout(() => {
        if (!alive) return;
        setStrike((s) => s + 1);
        loop(gap());
      }, delay);
    };
    loop(900 + Math.random() * 700);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [reduce]);

  /* fresh bolt geometry + fresh corner entry for every strike — sides
     alternate left ↔ right so bursts rake across the frame from both
     top corners, and each bolt independently draws near or recedes
     into the backdrop. The mobile and desktop stages each get their
     own draw (only one is ever visible); runs client-side only, never
     during SSR */
  const strikes = useMemo(
    () =>
      strike > 0
        ? (() => {
            const side = (["left", "right"] as const)[strike % 2];
            return { m: genStrike(MOBILE_STRIKE, side), d: genStrike(DESKTOP_STRIKE, side) };
          })()
        : null,
    [strike]
  );

  /* Gentle parallax on the desktop portrait card */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 55, damping: 18 });
  const sy = useSpring(my, { stiffness: 55, damping: 18 });
  const cardX = useTransform(sx, [-0.5, 0.5], [-10, 10]);
  const cardY = useTransform(sy, [-0.5, 0.5], [-8, 8]);
  const cardR = useTransform(sx, [-0.5, 0.5], [-1.6, 1.6]);

  const onMouseMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section
      id="home"
      ref={ref}
      aria-label="Introduction"
      onMouseMove={onMouseMove}
      className="relative flex min-h-svh flex-col justify-start overflow-hidden px-5 pb-14 pt-5 sm:px-8 sm:pt-5 md:px-10 lg:justify-center lg:pt-28"
    >
      {/* soft light bloom behind the type */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_58%_42%_at_50%_30%,rgba(var(--primary-rgb)/0.08),transparent_70%)]"
      />

      {/* ══ MOBILE / TABLET — full-width transparent cutout portrait ══ */}
      <div className="relative -mx-5 sm:-mx-8 lg:hidden" aria-label="Introduction">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 26, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.95, delay: 0.12, ease: EASE }}
          className="relative"
        >
          <div className="relative mx-auto w-full max-w-[560px]">
            {/* warm halo behind the subject — the site's own light source
                now that the photo environment is gone */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-[16%] h-[52%] w-[100%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(var(--accent-rgb)/0.24),transparent_66%)] blur-2xl"
            />

            {/* "Hello.." — anchored to the column (not the scaled photo):
                editorial serif italic + gold-gradient dots + a hand-drawn
                gold swash that draws itself in. */}
            <motion.span
              initial={reduce ? false : { opacity: 0, x: -16, y: -8 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
              className="text-glow absolute left-4 top-0 z-10 sm:left-8"
            >
              <span className="font-fraunces block text-[3.5rem] font-semibold italic leading-[0.95] tracking-[-0.01em] text-foreground sm:text-[4rem]">
                {greetMain}
                <span className="text-gold-gradient">{greetDots}</span>
              </span>
              <motion.svg
                viewBox="0 0 140 14"
                aria-hidden="true"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="mt-1.5 block h-[13px] w-[118px] drop-shadow-[0_2px_6px_rgba(var(--primary-rgb)/0.35)] sm:h-[15px] sm:w-[142px]"
              >
                <motion.path
                  d="M3 9 C 30 3, 58 12.5, 86 7.5 S 128 4.5, 137 7"
                  fill="none"
                  stroke="url(#hello-swash-gold)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.85, delay: 1.05, ease: EASE }}
                />
                <defs>
                  <linearGradient id="hello-swash-gold" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" style={{ stopColor: "var(--primary2-ref)" }} />
                    <stop offset="55%" style={{ stopColor: "var(--primary)" }} />
                    <stop offset="100%" style={{ stopColor: "var(--accent-ref)" }} />
                  </linearGradient>
                </defs>
              </motion.svg>
            </motion.span>

            {/* The headshot as a true cutout — background removed, so the
                subject sits directly on the site's own hue-family ground.
                Four-edge melt: sides 12% and top 10% dissolve the crop-cut
                arms and crown exactly the way the bottom dissolve melts the
                waist — the figure reads lit from within, never pasted.
                Accent halo + drifting bokeh behind the subject play the
                role the photo's lights used to — the site lights the room. */}
            <div className="relative pt-20 sm:pt-24">
              {/* thunder — a fresh bolt at a fresh spot every strike
                  (procedural geometry, random landing); the strike clock
                  lives on the section so both stages share one storm,
                  and the sky flash radiates from the bolt's own origin */}
              {strike > 0 && strikes && (
                <>
                  <LightningBolt key={`mb-${strike}`} strike={strikes.m} />
                  {/* sky flash — a self-contained glow box centered on the
                      bolt's own entry corner (left/top % + translate), so
                      the radial always dies inside its own box and never
                      clips a hard seam at an element edge */}
                  <motion.div
                    key={`sky-${strike}`}
                    aria-hidden="true"
                    data-flash="1"
                    className="pointer-events-none absolute z-0"
                    style={{
                      left: `${strikes.m.flashX.toFixed(2)}%`,
                      top: `${strikes.m.flashY.toFixed(2)}%`,
                      width: strikes.m.far ? 500 : 390,
                      height: strikes.m.far ? 584 : 454,
                      x: "-50%",
                      y: "-50%",
                      background: `radial-gradient(closest-side, rgba(var(--accent-rgb)/${strikes.m.far ? 0.3 : 0.5}), rgba(var(--primary-rgb)/${strikes.m.far ? 0.14 : 0.22}) 55%, transparent 100%)`,
                      mixBlendMode: "screen",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: FLASH_OPACITY }}
                    transition={{ duration: STRIKE_MS, times: FLASH_TIMES, ease: "easeOut" }}
                  />
                </>
              )}
              <div
                className="relative -translate-x-[2%]"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent 0%, #000 12%, #000 88%, transparent 100%)",
                  maskImage:
                    "linear-gradient(to right, transparent 0%, #000 12%, #000 88%, transparent 100%)",
                }}
              >
                <div
                  className="relative"
                  style={{
                    WebkitMaskImage:
                      "linear-gradient(to bottom, transparent 0%, #000 10%, #000 70%, rgba(0,0,0,0.55) 83%, rgba(0,0,0,0.18) 93%, transparent 100%)",
                    maskImage:
                      "linear-gradient(to bottom, transparent 0%, #000 10%, #000 70%, rgba(0,0,0,0.55) 83%, rgba(0,0,0,0.18) 93%, transparent 100%)",
                  }}
                >
                <Image
                  src="/generated/m-rayhan-cutout-lossless.webp"
                  alt="Portrait of M Rayhan"
                  width={HEADSHOT_W}
                  height={HEADSHOT_H}
                  priority
                  loading="eager"
                  unoptimized
                  className="relative h-auto w-full object-contain drop-shadow-[0_30px_42px_rgba(var(--primary-rgb)/0.3)]"
                />

                {/* the accent-suited twin — mounted only once decoded,
                    crossfading over the navy original; the base photo
                    below stays as the permanent fallback */}
                <AnimatePresence>
                  {suitShown && (
                    <motion.div
                      key={suitShown}
                      aria-hidden="true"
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 1, transition: { duration: 2.4 } }}
                      transition={{ duration: reduce ? 0 : 0.7, ease: EASE }}
                    >
                      <Image
                        src={cutoutVariant(suitShown)}
                        alt=""
                        width={HEADSHOT_W}
                        height={HEADSHOT_H}
                        loading="eager"
                        unoptimized
                        className="h-full w-full object-contain"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* silhouette-masked accent light — a key-light kiss on
                    the face and a bounce on the shirt/suit, masked by
                    the cutout's own alpha so the tint can never spill
                    onto the transparent ground */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    WebkitMaskImage: "url(/generated/m-rayhan-cutout-mask-v2.webp)",
                    maskImage: "url(/generated/m-rayhan-cutout-mask-v2.webp)",
                    WebkitMaskSize: "100% 100%",
                    maskSize: "100% 100%",
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(46% 13% at 52% 14%, rgba(var(--accent-rgb)/0.20), transparent 76%)",
                      mixBlendMode: "screen",
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(64% 20% at 50% 66%, rgba(var(--accent-rgb)/0.13), transparent 78%)",
                      mixBlendMode: "screen",
                    }}
                  />
                </div>

                {/* the strike reflects on the face/body — scoped by the
                    cutout's own alpha so the flash lights the person,
                    never the ground around them; the diagonal wash leans
                    toward whichever side the bolt landed on */}
                {strike > 0 && strikes && (
                  <motion.div
                    key={`mface-${strike}`}
                    aria-hidden="true"
                    data-face="1"
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: `radial-gradient(48% 16% at 55% 13%, rgba(var(--accent-rgb)/${strikes.m.far ? 0.34 : 0.55}), transparent 72%), linear-gradient(to bottom ${strikes.m.flashX < 50 ? "right" : "left"}, rgba(var(--accent-rgb)/${strikes.m.far ? 0.2 : 0.32}), transparent 46%)`,
                      mixBlendMode: "screen",
                      WebkitMaskImage: "url(/generated/m-rayhan-cutout-mask-v2.webp)",
                      maskImage: "url(/generated/m-rayhan-cutout-mask-v2.webp)",
                      WebkitMaskSize: "100% 100%",
                      maskSize: "100% 100%",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: FACE_OPACITY }}
                    transition={{ duration: STRIKE_MS, times: FACE_TIMES, ease: "easeOut" }}
                  />
                )}
                </div>
              </div>

              {/* accent rim sparks — bokeh drifting around the subject,
                  reading as the drawn hue's light catching the scene */}
              <span
                aria-hidden="true"
                className="orb-float absolute right-[8%] top-[12%] h-3.5 w-3.5 rounded-full bg-[rgba(var(--accent-rgb)/0.85)] blur-[5px]"
                style={{ mixBlendMode: "screen" }}
              />
              <span
                aria-hidden="true"
                className="orb-float-slow absolute left-[6%] top-[24%] h-2.5 w-2.5 rounded-full bg-[rgba(var(--primary-rgb)/0.8)] blur-[4px]"
                style={{ mixBlendMode: "screen", animationDelay: "-3s" }}
              />
              <span
                aria-hidden="true"
                className="orb-float absolute right-[16%] top-[42%] h-2 w-2 rounded-full bg-[rgba(var(--accent-rgb)/0.7)] blur-[3px]"
                style={{ mixBlendMode: "screen", animationDelay: "-6s" }}
              />
            </div>

            {/* Intro begins where the fade starts — left aligned */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, delay: 0.32, ease: EASE }}
              className="relative z-10 -mt-20 px-5 pb-2 text-left sm:-mt-28 sm:px-8"
            >
              {/* Name — "I am," on top, the signature name on its own line below */}
              <p className="font-fraunces text-[1.7rem] font-semibold italic leading-none tracking-[-0.02em] text-foreground/85 sm:text-[2.1rem]">
                I am<span className="text-gold-gradient">,</span>
              </p>

              <h1 className="font-script text-glow mt-1 text-[4.25rem] leading-[1.08] text-foreground sm:text-[5rem]">
                {hero.name}
              </h1>

              <IntroBio hero={hero} className="mt-6" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ══ DESKTOP — intro column + portrait card ══ */}
      <div className="relative z-10 mx-auto hidden w-full max-w-6xl lg:block">
        <div className="grid items-center grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-12">
          {/* ── Intro column ───────────────────────────────────── */}
          <div className="text-left">
            {/* Greeting — Fraunces italic + hand-drawn swash, the same
                lockup the mobile hero wears; bigger cascade on desktop */}
            <motion.div
              initial={reduce ? false : { opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
              className="text-glow"
            >
              <p className="font-fraunces text-[3.75rem] font-semibold italic leading-[0.95] tracking-[-0.01em] text-foreground xl:text-[4.25rem]">
                {greetMain}
                <span className="text-gold-gradient">{greetDots}</span>
              </p>
              <svg
                viewBox="0 0 140 14"
                aria-hidden="true"
                className="mt-1.5 block h-[14px] w-[140px] drop-shadow-[0_2px_6px_rgba(var(--primary-rgb)/0.35)]"
              >
                <path
                  d="M3 9 C 30 3, 58 12.5, 86 7.5 S 128 4.5, 137 7"
                  fill="none"
                  stroke="url(#hello-swash-gold-desktop)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="hello-swash-gold-desktop" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" style={{ stopColor: "var(--primary2-ref)" }} />
                    <stop offset="55%" style={{ stopColor: "var(--primary)" }} />
                    <stop offset="100%" style={{ stopColor: "var(--accent-ref)" }} />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>

            {/* Name — "I am," on top, the script name on its own line below */}
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
              className="font-fraunces mt-5 text-[2.3rem] font-semibold italic leading-none tracking-[-0.02em] text-foreground/85"
            >
              I am<span className="text-gold-gradient">,</span>
            </motion.p>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.32, ease: EASE }}
              className="font-script text-glow mt-2 text-[6.25rem] leading-[1.05] text-foreground xl:text-[7rem]"
            >
              {hero.name}
            </motion.h1>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.44, ease: EASE }}
              className="mt-7 max-w-[33rem]"
            >
              <IntroBio hero={hero} />
            </motion.div>
          </div>

          {/* ── Portrait card ──────────────────────────────────── */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 34, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.05, delay: 0.5, ease: EASE }}
            className="relative mx-auto w-full max-w-[440px]"
            style={reduce ? undefined : { x: cardX, y: cardY, rotate: cardR }}
          >
            {/* glow underlay */}
            <div
              aria-hidden="true"
              className="absolute -inset-8 rounded-[3.5rem] bg-[radial-gradient(circle_at_50%_45%,rgba(var(--accent-rgb)/0.14),transparent_68%)] blur-2xl"
            />

            {/* thunder sky flash — a self-contained glow box centered on
                the bolt's entry corner, lighting the sky AROUND the card
                (never the photo: a screen wash over the framed portrait
                used to flare the photo's own background every strike) */}
            {strike > 0 && strikes && (
              <motion.div
                key={`dsky-${strike}`}
                aria-hidden="true"
                data-flash="1"
                className="pointer-events-none absolute"
                style={{
                  left: `${strikes.d.flashX.toFixed(2)}%`,
                  top: `${strikes.d.flashY.toFixed(2)}%`,
                  width: strikes.d.far ? 708 : 540,
                  height: strikes.d.far ? 650 : 494,
                  x: "-50%",
                  y: "-50%",
                  background: `radial-gradient(closest-side, rgba(var(--accent-rgb)/${strikes.d.far ? 0.3 : 0.5}), rgba(var(--primary-rgb)/${strikes.d.far ? 0.14 : 0.22}) 55%, transparent 100%)`,
                  mixBlendMode: "screen",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: FLASH_OPACITY }}
                transition={{ duration: STRIKE_MS, times: FLASH_TIMES, ease: "easeOut" }}
              />
            )}

            <div className="glass-strong neu-decor relative overflow-hidden rounded-[2.5rem] p-2.5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
                {/* warm studio backdrop — the room the photo melts into */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(var(--accent-rgb)/0.4),rgba(var(--primary-rgb)/0.6)_55%,rgba(var(--primary-rgb)/0.85)_100%)]"
                />

                {/* ── the real headshot, framed — no side or top fades ──
                    The photo keeps its true edges inside the card frame;
                    only the bottom still dissolves into the backdrop (the
                    melt that always worked). Accent light layers ride
                    INSIDE the mask, glued to the photo's own lamps. */}
                <div
                  className="absolute inset-0"
                  style={{
                    WebkitMaskImage:
                      "linear-gradient(to bottom, #000 0%, #000 66%, rgba(0,0,0,0.6) 85%, rgba(0,0,0,0.3) 95%, transparent 100%)",
                    maskImage:
                      "linear-gradient(to bottom, #000 0%, #000 66%, rgba(0,0,0,0.6) 85%, rgba(0,0,0,0.3) 95%, transparent 100%)",
                  }}
                >
                    <Image
                      src="/generated/m-rayhan-portrait-hd.webp"
                      alt={`Portrait of ${hero.name}`}
                      fill
                      priority
                      loading="eager"
                      sizes="440px"
                      quality={95}
                      className="object-cover object-top"
                    />

                    {/* the accent-suited twin — decoded before mount,
                        crossfaded over the navy original; sits UNDER
                        the grade/lamp layers so the room still tints
                        it exactly like it tints the original */}
                    <AnimatePresence>
                      {suitShown && (
                        <motion.div
                          key={suitShown}
                          aria-hidden="true"
                          className="absolute inset-0"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 1, transition: { duration: 2.4 } }}
                          transition={{ duration: reduce ? 0 : 0.7, ease: EASE }}
                        >
                          <Image
                            src={portraitVariant(suitShown)}
                            alt=""
                            fill
                            loading="eager"
                            sizes="440px"
                            unoptimized
                            className="object-cover object-top"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* hue grade — the whole room breathes the accent */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background: "rgba(var(--accent-rgb) / 0.14)",
                        mixBlendMode: "color",
                      }}
                    />
                    {/* lamp recolor — the strips take the hue as their own
                        light, luminance kept (reads as real lit surfaces) */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{ background: CARD_LIGHT_RECOLOR.join(", "), mixBlendMode: "color" }}
                    />
                    {/* re-lit lamps — accent blooms exactly on the photo's
                        white light sources, reading as reflected light */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{ background: CARD_LIGHT_BLOOMS.join(", "), mixBlendMode: "screen" }}
                    />
                    {/* accent key-light kiss on the face */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "radial-gradient(30% 13% at 53% 34%, rgba(var(--accent-rgb)/0.13), transparent 76%)",
                        mixBlendMode: "screen",
                      }}
                    />
                    {/* drifting accent bokeh — the reflection comes alive */}
                    <span
                      aria-hidden="true"
                      className="orb-float absolute right-[13%] top-[23%] h-3.5 w-3.5 rounded-full bg-[rgba(var(--accent-rgb)/0.85)] blur-[5px]"
                      style={{ mixBlendMode: "screen" }}
                    />
                    <span
                      aria-hidden="true"
                      className="orb-float-slow absolute left-[5%] top-[41%] h-2.5 w-2.5 rounded-full bg-[rgba(var(--primary-rgb)/0.8)] blur-[4px]"
                      style={{ mixBlendMode: "screen", animationDelay: "-3s" }}
                    />
                    <span
                      aria-hidden="true"
                      className="orb-float absolute right-[5%] top-[77%] h-2 w-2 rounded-full bg-[rgba(var(--accent-rgb)/0.7)] blur-[3px]"
                      style={{ mixBlendMode: "screen", animationDelay: "-6s" }}
                    />
                    {/* night mode — accent bounce light climbing the suit */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 hidden dark:block"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(var(--accent-rgb)/0.30), transparent 48%)",
                        mixBlendMode: "screen",
                      }}
                    />
                    {/* ceiling melt wash — the card's own hue bleeds over
                        the top edge, turning the mirrored headroom into
                        atmosphere */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(var(--primary-rgb)/0.18), transparent 16%)",
                      }}
                    />
                    {/* thunder in the room — a fresh bolt at a fresh spot
                        every strike; the sky flash lives OUTSIDE the photo
                        (card level, behind the glass) so the portrait's own
                        background stays calm, and the reflection on the face
                        leans toward the bolt's corner */}
                    {strike > 0 && strikes && (
                      <LightningBolt key={`db-${strike}`} strike={strikes.d} />
                    )}
                    {strike > 0 && strikes && (
                      <motion.div
                        key={`dface-${strike}`}
                        aria-hidden="true"
                        data-face="1"
                        className="pointer-events-none absolute inset-0"
                        style={{
                          background: `radial-gradient(26% 12% at 53% 32%, rgba(var(--accent-rgb)/${strikes.d.far ? 0.3 : 0.45}), transparent 74%)`,
                          mixBlendMode: "screen",
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: FACE_OPACITY }}
                        transition={{ duration: STRIKE_MS, times: FACE_TIMES, ease: "easeOut" }}
                      />
                    )}
                </div>

                {/* bottom nameplate */}
                <div className="glass-strong absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold leading-tight text-foreground">
                      {hero.name}
                    </p>
                    <p className="font-tag mt-0.5 truncate text-[9.5px] text-muted-foreground">
                      {hero.role}
                    </p>
                  </div>
                  <span className="status-dot shrink-0" aria-hidden="true" />
                </div>
              </div>
            </div>

            {/* floating glass chips */}
            <div
              aria-hidden="true"
              className="glass-chip orb-float absolute -right-8 top-8 flex items-center gap-2 rounded-2xl px-3.5 py-2.5"
            >
              <GraduationCap className="h-4 w-4 text-gold" />
              <span className="text-xs font-semibold text-foreground">CSE Student</span>
            </div>
            <div
              aria-hidden="true"
              className="glass-chip orb-float-slow absolute -left-8 bottom-24 flex items-center gap-2 rounded-2xl px-3.5 py-2.5"
            >
              <Telescope className="h-4 w-4 text-gold" />
              <span className="text-xs font-semibold text-foreground">Curious Builder</span>
            </div>

            {/* Scroll cue — sits just under the card, clear of all copy */}
            <motion.button
              type="button"
              onClick={() => {
                playSound("notch");
                scrollToSection("journey");
              }}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 1.7, ease: EASE }}
              aria-label="Scroll to the journey section"
              className="group absolute -bottom-[74px] left-1/2 flex -translate-x-1/2 flex-col items-center gap-1"
            >
              <span className="font-tag text-[9px] text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                Scroll
              </span>
              <ChevronDown className="animate-nudge h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-foreground" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

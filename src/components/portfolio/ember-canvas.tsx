"use client";

import { useEffect, useRef } from "react";

/**
 * EmberCanvas — warm sparks drifting upward inside the hero stage.
 *
 * Perf contract:
 * • Pre-rendered radial-glow sprites (one per color) — each particle is a
 *   single drawImage per frame, no per-frame gradient allocation.
 * • DPR capped at 2; particle count scales with area, hard-capped at 64.
 * • Pauses when offscreen (IntersectionObserver), when the tab is hidden,
 *   and renders a single static frame under prefers-reduced-motion.
 */

const COLORS: [number, number, number][] = [
  [255, 214, 138], // gold
  [255, 180, 94], // amber
  [255, 138, 54], // ember orange
  [255, 244, 214], // hot white-gold
];

type Particle = {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  ph: number;
  tw: number;
  a: number;
  s: number;
};

export function EmberCanvas({
  className = "",
  density = 1,
}: {
  className?: string;
  density?: number;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = false;
    let inView = true;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    /* pre-rendered glow sprites — one per color */
    const sprites = COLORS.map(([r, g, b]) => {
      const s = document.createElement("canvas");
      s.width = 64;
      s.height = 64;
      const c = s.getContext("2d");
      if (c) {
        const grad = c.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
        grad.addColorStop(0.35, `rgba(${r},${g},${b},0.55)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        c.fillStyle = grad;
        c.fillRect(0, 0, 64, 64);
      }
      return s;
    });

    let parts: Particle[] = [];

    const spawn = (anywhere: boolean): Particle => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 14,
      r: 0.8 + Math.random() * 2.2,
      vy: 0.14 + Math.random() * 0.5,
      vx: (Math.random() - 0.5) * 0.22,
      ph: Math.random() * Math.PI * 2,
      tw: 0.4 + Math.random() * 1.2,
      a: 0.22 + Math.random() * 0.5,
      s: Math.floor(Math.random() * sprites.length),
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(64, (w * h) / 24000) * density);
      parts = Array.from({ length: count }, () => spawn(true));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.y -= p.vy;
        p.x += p.vx + Math.sin(t / 1700 + p.ph) * 0.14;
        if (p.y < -16 || p.x < -16 || p.x > w + 16) Object.assign(p, spawn(false));
        const flick = 0.62 + 0.38 * Math.sin((t / 260) * p.tw + p.ph);
        ctx.globalAlpha = Math.max(0, p.a * flick);
        const d = p.r * 7;
        ctx.drawImage(sprites[p.s], p.x - d / 2, p.y - d / 2, d, d);
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => {
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!running && !document.hidden && inView) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resize();
    if (reduce) {
      draw(1200); /* single static frame */
    } else {
      start();
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !reduce) start();
        else stop();
      },
      { threshold: 0.02 },
    );
    io.observe(canvas);

    const onVis = () => {
      if (document.hidden || reduce) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVis);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [density]);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}

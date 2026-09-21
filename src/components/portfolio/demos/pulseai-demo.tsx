"use client";

import { motion } from "framer-motion";
import { Activity, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Mode = "throughput" | "latency";

interface Sample {
  /** thousands of requests per minute */
  load: number;
  /** milliseconds */
  latency: number;
}

const MAX_POINTS = 24;
const TICK_MS = 1400;
const SPIKE_MS = 2400;
const SPIKE_TICK_MS = 320;
const CHART_W = 300;
const CHART_H = 64;

const EASE = [0.22, 1, 0.36, 1] as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Deterministic seed so SSR and client render identically. */
function seedSamples(): Sample[] {
  const samples: Sample[] = [];
  for (let i = 0; i < MAX_POINTS; i++) {
    const t = i / (MAX_POINTS - 1);
    samples.push({
      load: Math.round(152 + Math.sin(t * Math.PI * 2.2) * 9 + Math.sin(t * 9.4) * 3),
      latency: Math.round(34 + Math.sin(t * Math.PI * 1.6 + 1) * 4 + Math.cos(t * 7.1) * 1.5),
    });
  }
  return samples;
}

/** Catmull-Rom → cubic bézier smoothing for a silky telemetry line. */
function smoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";
  let d = `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return d;
}

const MODE_OPTIONS: Array<{ id: Mode; label: string }> = [
  { id: "throughput", label: "Throughput" },
  { id: "latency", label: "Latency" },
];

export default function PulseAIDemo() {
  const [mode, setMode] = useState<Mode>("throughput");
  const [samples, setSamples] = useState<Sample[]>(seedSamples);
  const [spiking, setSpiking] = useState(false);
  const spikingRef = useRef(false);

  // Steady-state telemetry jitter (~1.4s cadence), skipped while spiking.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (spikingRef.current) return;
      setSamples((prev) => {
        const last = prev[prev.length - 1];
        const load = clamp(last.load + (150 - last.load) * 0.35 + (Math.random() * 10 - 5), 138, 172);
        const latency = clamp(last.latency + (34 - last.latency) * 0.35 + (Math.random() * 4 - 2), 28, 44);
        return [...prev.slice(-(MAX_POINTS - 1)), { load: Math.round(load), latency: Math.round(latency) }];
      });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  // Sharp traffic spike: rapid high samples while active, then smooth recovery.
  useEffect(() => {
    if (!spiking) return;
    const pushSpike = () => {
      setSamples((prev) => {
        const last = prev[prev.length - 1];
        const load = clamp(last.load + (425 - last.load) * 0.55 + (Math.random() * 26 - 13), 210, 460);
        const latency = clamp(last.latency + (66 - last.latency) * 0.55 + (Math.random() * 6 - 3), 42, 75);
        return [...prev.slice(-(MAX_POINTS - 1)), { load: Math.round(load), latency: Math.round(latency) }];
      });
    };
    pushSpike();
    const id = window.setInterval(pushSpike, SPIKE_TICK_MS);
    const stop = window.setTimeout(() => setSpiking(false), SPIKE_MS);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(stop);
      spikingRef.current = false;
    };
  }, [spiking]);

  const startSpike = useCallback(() => {
    spikingRef.current = true;
    setSpiking(true);
  }, []);

  const current = samples[samples.length - 1];
  const values = samples.map((s) => (mode === "throughput" ? s.load : s.latency));
  const peak = Math.max(...values);
  const domainMin = mode === "throughput" ? 100 : 20;
  const domainMax = Math.max(mode === "throughput" ? 200 : 50, peak * 1.08);

  const points = values.map((v, i) => ({
    x: (i / (values.length - 1)) * CHART_W,
    y: CHART_H - 3 - ((v - domainMin) / (domainMax - domainMin)) * (CHART_H - 6),
  }));

  const linePath = smoothPath(points);
  const areaPath = `${linePath} L ${CHART_W},${CHART_H} L 0,${CHART_H} Z`;
  const head = points[points.length - 1];
  const latencyHot = current.latency > 50;

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="glass grid size-9 shrink-0 place-items-center rounded-xl">
          <Activity className="size-4 text-apple-green" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight">Live Telemetry Simulator</h3>
          <p className="text-[11px] text-muted-foreground">Streaming pipeline health · auto-refresh</p>
        </div>
        <span className="glass ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wide text-muted-foreground">
          <span className="status-dot inline-block" />
          Realtime Engine
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-muted-foreground">Ingested Load</span>
            {spiking && (
              <span
                className="rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none tracking-widest text-apple-rose"
                style={{ backgroundColor: "color-mix(in srgb, var(--apple-rose) 14%, transparent)" }}
              >
                SPIKE
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-lg font-semibold tracking-tight tabular-nums">{current.load}k</span>
            <span className="text-[11px] text-muted-foreground">req/min</span>
          </div>
        </div>
        <div className="glass rounded-xl p-3.5">
          <span className="text-[11px] font-medium text-muted-foreground">API Latency</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className={cn(
                "text-2xl font-semibold tracking-tight tabular-nums transition-colors duration-300",
                latencyHot ? "text-apple-orange" : "text-foreground"
              )}
            >
              {current.latency}ms
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="glass rounded-xl p-3">
        <div className="relative h-24 w-full">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="pulseai-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--apple-green)" stopOpacity="0.34" />
                <stop offset="100%" stopColor="var(--apple-green)" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {[16, 32, 48].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2={CHART_W}
                y2={y}
                stroke="var(--grid-line)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <motion.path
              d={areaPath}
              animate={{ d: areaPath }}
              transition={{ duration: 0.9, ease: EASE }}
              fill="url(#pulseai-area)"
            />
            <motion.path
              d={linePath}
              animate={{ d: linePath }}
              transition={{ duration: 0.9, ease: EASE }}
              fill="none"
              stroke="var(--apple-green)"
              strokeWidth="2.5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{ filter: "drop-shadow(0 0 5px color-mix(in srgb, var(--apple-green) 55%, transparent))" }}
            />
          </svg>
          {/* Glowing head dot — kept in DOM so it stays perfectly round */}
          <motion.span
            initial={false}
            className="pointer-events-none absolute z-10"
            animate={{ left: `${(head.x / CHART_W) * 100}%`, top: `${(head.y / CHART_H) * 100}%` }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <span
              className="absolute -inset-1.5 rounded-full"
              style={{ backgroundColor: "var(--apple-green)", opacity: 0.25, filter: "blur(3px)" }}
            />
            <span
              className="relative block size-2 rounded-full"
              style={{
                backgroundColor: "var(--apple-green)",
                boxShadow: "0 0 12px 2px color-mix(in srgb, var(--apple-green) 65%, transparent)",
              }}
            />
          </motion.span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="glass inline-flex rounded-full p-1" role="group" aria-label="Telemetry mode">
          {MODE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setMode(option.id)}
              aria-pressed={mode === option.id}
              className="relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-200"
            >
              {mode === option.id && (
                <motion.span
                  layoutId="pulseai-mode-pill"
                  className="glass-strong absolute inset-0 rounded-full"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span
                className={cn(
                  "relative z-10 transition-colors duration-200",
                  mode === option.id ? "text-apple-green" : "text-muted-foreground"
                )}
              >
                {option.label}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={startSpike}
          disabled={spiking}
          className={cn(
            "glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-apple-green transition",
            "hover:brightness-110 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-55"
          )}
        >
          <Zap className="size-3.5" fill={spiking ? "currentColor" : "none"} />
          {spiking ? "Spiking…" : "Simulate Traffic Spike"}
        </button>
      </div>
    </div>
  );
}

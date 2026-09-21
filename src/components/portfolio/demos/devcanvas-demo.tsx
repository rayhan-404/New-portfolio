"use client";

import { PenTool, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { cn } from "@/lib/utils";

const CANVAS_W = 520;
const CANVAS_H = 140;
const STROKE_W = 3;

const PALETTE = [
  { name: "Green", value: "#30d158" },
  { name: "Orange", value: "#ff9f0a" },
  { name: "Rose", value: "#ff375f" },
  { name: "Chalk", value: "#f5f5f7" },
] as const;

interface Point {
  x: number;
  y: number;
}

export default function DevCanvasDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const dprRef = useRef(1);
  const [color, setColor] = useState<string>(PALETTE[0].value);

  // High-DPI setup + one-time welcome stroke.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dprRef.current = dpr;
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Welcome stroke — a smooth signature-style bézier across the canvas.
    ctx.save();
    ctx.strokeStyle = "#30d158";
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = STROKE_W;
    ctx.beginPath();
    ctx.moveTo(36, 96);
    ctx.bezierCurveTo(120, 16, 182, 152, 264, 74);
    ctx.bezierCurveTo(330, 8, 392, 132, 484, 48);
    ctx.stroke();
    ctx.restore();
  }, []);

  /** Map pointer coords → logical canvas coords, compensating CSS scale + DPR. */
  const getLogicalPoint = (event: ReactPointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * (canvas.width / rect.width)) / dprRef.current,
      y: ((event.clientY - rect.top) * (canvas.height / rect.height)) / dprRef.current,
    };
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const point = getLogicalPoint(event);
    drawingRef.current = true;
    lastPointRef.current = point;
    ctx.strokeStyle = color;
    ctx.lineWidth = STROKE_W;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    // Tiny offset so a single tap renders a round dot.
    ctx.lineTo(point.x + 0.01, point.y + 0.01);
    ctx.stroke();
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const last = lastPointRef.current;
    if (!drawingRef.current || !last) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const point = getLogicalPoint(event);
    ctx.strokeStyle = color;
    ctx.lineWidth = STROKE_W;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;
  };

  const endStroke = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  };

  return (
    <div className="flex w-full flex-col gap-3.5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="glass grid size-9 shrink-0 place-items-center rounded-xl">
          <PenTool className="size-4 text-apple-orange" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight">Drawing Sandbox</h3>
          <p className="text-[11px] text-muted-foreground">CRDT-synced strokes · multiplayer ready</p>
        </div>
        <span className="glass ml-auto shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wide text-muted-foreground">
          60fps Canvas
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          {PALETTE.map((swatch) => (
            <button
              key={swatch.value}
              type="button"
              aria-label={`${swatch.name} stroke`}
              aria-pressed={color === swatch.value}
              onClick={() => setColor(swatch.value)}
              className={cn(
                "size-6 rounded-full transition-transform duration-200 hover:scale-110 active:scale-95",
                color === swatch.value
                  ? "ring-2 ring-foreground/60 ring-offset-2 ring-offset-transparent"
                  : "ring-0"
              )}
              style={{ backgroundColor: swatch.value }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={clearCanvas}
          className="glass ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground active:scale-95"
        >
          <Trash2 className="size-3.5" />
          Clear
        </button>
      </div>

      {/* Canvas */}
      <div className="glass rounded-2xl p-2">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          role="img"
          aria-label="Freeform collaborative drawing canvas"
          className="w-full cursor-crosshair rounded-xl select-none"
          style={{
            backgroundColor: "rgba(8, 10, 12, 0.42)",
            backgroundImage:
              "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            touchAction: "none",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
        />
      </div>

      <div className="flex items-center justify-between px-1 text-[10px] text-muted-foreground">
        <span>Pointer & touch input · HiDPI aware</span>
        <span>
          {STROKE_W}px round caps · {PALETTE.length} inks
        </span>
      </div>
    </div>
  );
}

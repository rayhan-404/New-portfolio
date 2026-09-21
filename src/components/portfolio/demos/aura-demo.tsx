"use client";

import { motion } from "framer-motion";
import { Bell, LayoutGrid, Plus } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const ACCENTS = [
  { name: "Green", value: "#30d158" },
  { name: "Orange", value: "#ff9f0a" },
  { name: "Rose", value: "#ff375f" },
  { name: "Mint", value: "#66d4cf" },
] as const;

type Accent = (typeof ACCENTS)[number]["value"];

const EASE = [0.22, 1, 0.36, 1] as const;

/** Self-contained spring-animated switch (no shadcn dependency). */
function TokenSwitch({
  checked,
  accent,
  onCheckedChange,
}: {
  checked: boolean;
  accent: string;
  onCheckedChange: (next: boolean) => void;
}) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Toggle notifications"
      onClick={() => onCheckedChange(!checked)}
      whileTap={{ scale: 0.94 }}
      animate={{ backgroundColor: checked ? accent : "rgba(120, 120, 128, 0.26)" }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="relative h-6 w-11 shrink-0 cursor-pointer rounded-full border border-[var(--glass-border)]"
    >
      <motion.span
        className="absolute left-[3px] top-[3px] block size-[18px] rounded-full bg-white shadow-md"
        animate={{ x: checked ? 22 : 0 }}
        transition={{ type: "spring", stiffness: 520, damping: 34 }}
      />
    </motion.button>
  );
}

export default function AuraDemo() {
  const [accent, setAccent] = useState<Accent>("#30d158");
  const [notifications, setNotifications] = useState(true);
  const [count, setCount] = useState(3);

  return (
    <div className="glass w-full rounded-2xl p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="glass grid size-9 shrink-0 place-items-center rounded-xl">
          <LayoutGrid className="size-4 text-apple-mint" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight">Component Sandbox</h3>
          <p className="text-[11px] text-muted-foreground">Live primitives · tokens apply instantly</p>
        </div>
        <span className="glass ml-auto shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wide text-muted-foreground">
          React 19 / WCAG AA
        </span>
      </div>

      <div className="glass-divider my-4" />

      {/* Accent token picker */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium">Accent Token</p>
          <p className="text-[11px] text-muted-foreground">Live theme override</p>
        </div>
        <div className="flex items-center gap-2.5">
          {ACCENTS.map((token) => (
            <button
              key={token.value}
              type="button"
              aria-label={`${token.name} accent`}
              aria-pressed={accent === token.value}
              onClick={() => setAccent(token.value)}
              className={cn(
                "size-6 rounded-full transition-transform duration-200 hover:scale-110 active:scale-95",
                accent === token.value
                  ? "ring-2 ring-foreground/60 ring-offset-2 ring-offset-transparent"
                  : "ring-0"
              )}
              style={{ backgroundColor: token.value }}
            />
          ))}
        </div>
      </div>

      <div className="glass-divider my-4" />

      {/* Switch */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium">Notifications</p>
          <p className="text-[11px] text-muted-foreground">Spring-animated switch</p>
        </div>
        <TokenSwitch checked={notifications} accent={accent} onCheckedChange={setNotifications} />
      </div>

      <div className="glass-divider my-4" />

      {/* Badge counter */}
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--secondary)] px-2.5 py-1.5 text-xs">
          <Bell className="size-3 text-muted-foreground" />
          <span>Notifications</span>
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 560, damping: 20 }}
            className="ml-0.5 grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none tabular-nums"
            style={{ backgroundColor: accent, color: "#0b0b0d" }}
          >
            {count}
          </motion.span>
        </div>
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          aria-label="Increment notification count"
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium transition hover:brightness-125 active:scale-95"
          style={{
            backgroundColor: `color-mix(in srgb, ${accent} 16%, transparent)`,
            color: accent,
          }}
        >
          <Plus className="size-3" />
          Increment
        </button>
      </div>

      <div className="glass-divider my-4" />

      {/* Read-only progress sample */}
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium">Figma Token Sync</p>
          <span className="text-[11px] tabular-nums text-muted-foreground">68%</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={68}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Figma token sync progress"
          className="mt-2 h-1.5 overflow-hidden rounded-full border border-[var(--glass-border)] bg-[var(--secondary)]"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "68%" }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
            className="h-full rounded-full transition-colors duration-300"
            style={{ backgroundColor: accent }}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Leaf, Trees, TrendingDown } from "lucide-react";
import { useState } from "react";

const KG_PER_NODE = 123.5;
const KG_PER_TREE = 20;

const EASE = [0.22, 1, 0.36, 1] as const;

export default function EcoTrackDemo() {
  const [nodes, setNodes] = useState(12);

  const co2 = nodes * KG_PER_NODE;
  const co2Value = Math.round(co2).toLocaleString("en-US");
  const trees = Math.ceil(co2 / KG_PER_TREE);

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="glass grid size-9 shrink-0 place-items-center rounded-xl">
          <Leaf className="size-4 text-apple-green" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight">Carbon Offset Simulator</h3>
          <p className="text-[11px] text-muted-foreground">Scope 1–3 emissions · instant recalc</p>
        </div>
        <span className="glass ml-auto shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wide text-muted-foreground">
          GHG Scope 1–3
        </span>
      </div>

      {/* Slider */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="ecotrack-nodes" className="text-xs font-medium">
            Cloud Compute Instances
          </label>
          <span className="rounded-md border border-[var(--glass-border)] bg-[var(--secondary)] px-2 py-0.5 font-mono text-xs tabular-nums text-apple-green">
            {nodes} Nodes
          </span>
        </div>
        <input
          id="ecotrack-nodes"
          type="range"
          min={2}
          max={60}
          step={1}
          value={nodes}
          onChange={(event) => setNodes(Number(event.target.value))}
          className="mt-3 w-full accent-[var(--apple-green)]"
        />
        <p className="mt-2 text-[10px] text-muted-foreground">
          {KG_PER_NODE.toLocaleString("en-US")} kg CO₂e per instance · monthly average
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="glass rounded-xl p-4">
          <motion.span
            key={co2Value}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.35, ease: EASE }}
            className="block text-2xl font-semibold tracking-tight tabular-nums"
          >
            {co2Value}
            <span className="ml-1 text-sm font-medium text-muted-foreground">kg</span>
          </motion.span>
          <p className="mt-1 text-[11px] text-muted-foreground">Monthly CO₂ Footprint</p>
          <div className="mt-2.5 flex items-center gap-1 text-[10px] font-medium text-apple-green">
            <TrendingDown className="size-3" />
            <span>avg -28%</span>
          </div>
        </div>

        <div className="glass rounded-xl p-4">
          <motion.span
            key={trees}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.35, ease: EASE }}
            className="block text-2xl font-semibold tracking-tight tabular-nums"
          >
            {trees.toLocaleString("en-US")}
            <span className="ml-1 text-sm font-medium text-muted-foreground">trees</span>
          </motion.span>
          <p className="mt-1 text-[11px] text-muted-foreground">Trees Needed to Offset (Annual)</p>
          <div className="mt-2.5 flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
            <Trees className="size-3" />
            <span>1 tree ≈ {KG_PER_TREE} kg / yr</span>
          </div>
        </div>
      </div>
    </div>
  );
}

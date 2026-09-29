"use client";

/**
 * Procedural thunder — WebAudio synthesis, zero external assets.
 * Four flavors so the storm never repeats itself:
 *   crack  — close hit: bright snap into a tight body + sub thump
 *   clap   — medium strike: mid burst with a short tail
 *   rumble — far strike: deep wash that slowly breathes
 *   roll   — distant echo: two offset rumble layers rolling away
 * The sound trails the flash by the strike's distance (near lands
 * almost with the light; far rumbles arrive late). Respects the
 * site's sound preference (rayhan_sound_fx) — silence when muted,
 * no machine-gunning when both storms fire close together.
 */

import { isSoundEnabled } from "./sound";

export type ThunderDistance = "near" | "far";

let ctx: AudioContext | null = null;
let noiseBuf: AudioBuffer | null = null;
let lastScheduled = 0;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

/* one shared noise buffer — white snap fuel tilted toward brown so
   the low layers have real body without a second buffer */
function getNoise(ac: AudioContext): AudioBuffer {
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 4, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < d.length; i++) {
      const white = Math.random() * 2 - 1;
      brown = (brown + 0.02 * white) / 1.02;
      d[i] = white * 0.4 + brown * 2.4;
    }
  }
  return noiseBuf;
}

function src(
  ac: AudioContext,
  at: number,
  dur: number,
  rate: number
): AudioBufferSourceNode {
  const s = ac.createBufferSource();
  s.buffer = getNoise(ac);
  s.playbackRate.value = rate;
  s.start(at, Math.random() * 1.5, dur + 0.05);
  return s;
}

/* attack → peak → exponential rest */
function env(
  ac: AudioContext,
  at: number,
  attack: number,
  peak: number,
  decay: number
): GainNode {
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.linearRampToValueAtTime(peak, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
  return g;
}

/* slow tremolo in its own stage (always-positive gain around 1) so
   the storm breathes inside the tail without fighting the envelope */
function trem(
  ac: AudioContext,
  at: number,
  dur: number,
  depth: number
): GainNode {
  const g = ac.createGain();
  g.gain.value = 1;
  const lfo = ac.createOscillator();
  lfo.frequency.value = 4.5 + Math.random() * 3.5;
  const amt = ac.createGain();
  amt.gain.value = depth;
  lfo.connect(amt);
  amt.connect(g.gain);
  lfo.start(at);
  lfo.stop(at + dur);
  return g;
}

function filter(
  ac: AudioContext,
  type: BiquadFilterType,
  freq: number,
  q = 0.8
): BiquadFilterNode {
  const f = ac.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  return f;
}

function chain(ac: AudioContext, ...nodes: AudioNode[]) {
  for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]);
}

/* ── the four flavors ─────────────────────────────────────────── */

function crack(ac: AudioContext, at: number, v: number) {
  const rate = 0.92 + Math.random() * 0.2;
  /* bright snap */
  chain(
    ac,
    src(ac, at, 0.5, rate),
    filter(ac, "highpass", 1100),
    env(ac, at, 0.004, v, 0.34),
    ac.destination
  );
  /* tight body */
  chain(
    ac,
    src(ac, at, 1.8, rate * 0.9),
    filter(ac, "lowpass", 320),
    env(ac, at + 0.01, 0.014, v * 1.5, 1.5),
    ac.destination
  );
  /* sub thump */
  chain(
    ac,
    src(ac, at, 2.2, 0.7),
    filter(ac, "lowpass", 90),
    env(ac, at + 0.015, 0.03, v * 1.7, 1.9),
    ac.destination
  );
}

function clap(ac: AudioContext, at: number, v: number) {
  const rate = 0.9 + Math.random() * 0.2;
  chain(
    ac,
    src(ac, at, 1.4, rate),
    filter(ac, "bandpass", 520, 0.6),
    env(ac, at, 0.01, v * 1.2, 1.05),
    ac.destination
  );
  chain(
    ac,
    src(ac, at, 2, 0.8),
    filter(ac, "lowpass", 140),
    env(ac, at + 0.02, 0.04, v, 1.7),
    ac.destination
  );
}

function rumble(ac: AudioContext, at: number, v: number, decay = 3.4) {
  const g = env(ac, at, 0.3 + Math.random() * 0.25, v * 1.8, decay);
  chain(
    ac,
    src(ac, at, decay + 0.6, 0.62 + Math.random() * 0.18),
    filter(ac, "lowpass", 105),
    trem(ac, at, decay + 0.9, 0.22 + Math.random() * 0.12),
    g,
    ac.destination
  );
}

function roll(ac: AudioContext, at: number, v: number) {
  rumble(ac, at, v, 2.6);
  rumble(ac, at + 0.55 + Math.random() * 0.35, v * 0.55, 2.8);
}

/* ── public ───────────────────────────────────────────────────── */

/**
 * Schedule one thunderclap. `distance` maps the visible strike to its
 * voice (near → crack/clap, far → rumble/roll); omitted = coin toss.
 * Returns the distance actually scheduled, or null when muted/skipped.
 */
export function playThunder(
  distance?: ThunderDistance
): ThunderDistance | null {
  if (!isSoundEnabled()) return null;
  const ac = getCtx();
  if (!ac || ac.state === "closed") return null;
  const now = performance.now();
  if (now - lastScheduled < 600) return null; // never machine-gun
  lastScheduled = now;

  const d: ThunderDistance =
    distance ?? (Math.random() < 0.5 ? "near" : "far");
  /* light travels first — sound trails the flash by distance */
  const lag =
    d === "near" ? 0.06 + Math.random() * 0.16 : 0.42 + Math.random() * 0.6;
  const at = ac.currentTime + lag;
  const v = (d === "near" ? 0.055 : 0.05) * (0.8 + Math.random() * 0.4);

  try {
    if (d === "near") (Math.random() < 0.62 ? crack : clap)(ac, at, v);
    else (Math.random() < 0.5 ? rumble : roll)(ac, at, v);
  } catch {
    /* audio unavailable — stay silent */
  }
  return d;
}

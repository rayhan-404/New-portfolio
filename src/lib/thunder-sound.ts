"use client";

/**
 * Real thunder — four recorded storm voices served from /sounds,
 * decoded once and cached as WebAudio buffers:
 *   crack  — "Close explosion thunder": the near hit, snap first
 *   clap   — "Fast thunder impact": a tight medium strike
 *   rumble — "Thunder deep rumble": the far sky washing out
 *   roll   — "Distant thunder storm explosion": echo rolling away
 * The voice is chosen by the strike's distance, and the sound trails
 * the flash the way weather does — near lands almost with the light,
 * far rumbles arrive late. Rate + gain are varied per play so the
 * storm never repeats itself. Each clap is an EVENT, never a wall:
 * tails are capped with a fade-out, only one voice plays at a time,
 * and a burst of chained strikes answers with a single thunder.
 * Respects the site's sound preference (rayhan_sound_fx).
 */

import { isSoundEnabled } from "./sound";

export type ThunderDistance = "near" | "far";

const CLIPS: Record<"crack" | "clap" | "rumble" | "roll", string> = {
  crack: "/sounds/thunder-crack.mp3",
  clap: "/sounds/thunder-clap.mp3",
  rumble: "/sounds/thunder-rumble.mp3",
  roll: "/sounds/thunder-roll.mp3",
};

let ctx: AudioContext | null = null;
const buffers = new Map<string, AudioBuffer>();
const pending = new Map<string, Promise<AudioBuffer | null>>();
let lastScheduled = 0;
let audioBusyUntil = 0; // audio-clock time the current clap fades out

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

function fetchClip(key: string): Promise<AudioBuffer | null> {
  const cached = buffers.get(key);
  if (cached) return Promise.resolve(cached);
  const inFlight = pending.get(key);
  if (inFlight) return inFlight;
  const job = (async () => {
    try {
      const ac = getCtx();
      if (!ac) return null;
      const res = await fetch(CLIPS[key as keyof typeof CLIPS]);
      if (!res.ok) return null;
      const buf = await ac.decodeAudioData(await res.arrayBuffer());
      buffers.set(key, buf);
      return buf;
    } catch {
      return null;
    } finally {
      pending.delete(key);
    }
  })();
  pending.set(key, job);
  return job;
}

function warmAll() {
  (Object.keys(CLIPS) as (keyof typeof CLIPS)[]).forEach((k) => {
    void fetchClip(k);
  });
}

/* decode everything up front when the storm is already unmuted, so
   the first thunder lands in sync with its flash */
if (typeof window !== "undefined" && isSoundEnabled()) warmAll();

function schedule(
  flavor: keyof typeof CLIPS,
  buf: AudioBuffer,
  d: ThunderDistance
) {
  const ac = getCtx();
  if (!ac || ac.state === "closed") return;
  /* light travels first — sound trails the flash by distance */
  const lag =
    d === "near" ? 0.06 + Math.random() * 0.16 : 0.42 + Math.random() * 0.6;
  const at = ac.currentTime + lag;
  try {
    const s = ac.createBufferSource();
    s.buffer = buf;
    const rate = 0.92 + Math.random() * 0.16;
    s.playbackRate.value = rate;
    const g = ac.createGain();
    const v = (d === "near" ? 0.55 : 0.45) * (0.85 + Math.random() * 0.3);
    /* keep each thunder inside the storm's rhythm: cap the tail and
       fade it into silence so it never drones past the next burst */
    const dur = Math.min(buf.duration / rate, d === "near" ? 3 : 4.2);
    const fadeStart = at + dur - 0.55;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(v, at + 0.012); // 12ms — kills any click
    g.gain.setValueAtTime(v, fadeStart);
    g.gain.linearRampToValueAtTime(0.0001, at + dur);
    s.connect(g);
    g.connect(ac.destination);
    s.start(at);
    s.stop(at + dur + 0.05);
    audioBusyUntil = at + dur;
  } catch {
    /* audio unavailable — stay silent */
  }
}

/**
 * Play one real thunderclap. `distance` maps the visible strike to
 * its voice (near → crack/clap, far → rumble/roll); omitted = coin
 * toss. Returns the distance actually scheduled, or null when
 * muted/skipped/buffer still loading.
 */
export function playThunder(
  distance?: ThunderDistance
): ThunderDistance | null {
  if (!isSoundEnabled()) return null;
  const ac = getCtx();
  if (!ac || ac.state === "closed") return null;
  const now = performance.now();
  /* one clean voice per burst — chained strikes stay silent, and a
     new clap never starts while the previous tail is still rolling */
  if (now - lastScheduled < 1800) return null;
  if (ac.currentTime < audioBusyUntil) return null;
  lastScheduled = now;

  const d: ThunderDistance = distance ?? (Math.random() < 0.5 ? "near" : "far");
  const flavor: keyof typeof CLIPS =
    d === "near"
      ? Math.random() < 0.55
        ? "crack"
        : "clap"
      : Math.random() < 0.5
        ? "rumble"
        : "roll";
  const buf = buffers.get(flavor);
  if (buf) {
    schedule(flavor, buf, d);
    return d;
  }
  /* cold cache — warm every voice now, and sing THIS strike the
     moment its clip lands (fetch is usually quicker than the lag) */
  warmAll();
  void fetchClip(flavor).then((b) => {
    if (b && isSoundEnabled()) schedule(flavor, b, d);
  });
  return d;
}

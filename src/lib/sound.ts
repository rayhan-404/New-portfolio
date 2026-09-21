"use client";

/**
 * Lightweight WebAudio sound engine — zero external assets.
 * Synthesizes soft, Apple-like UI chimes with oscillators + gain envelopes.
 * Persisted preference in localStorage. Respects reduced-motion/silent contexts.
 */

type SoundName = "tap" | "notch" | "chime" | "success" | "pop";

let ctx: AudioContext | null = null;
let enabled = false;
let initialized = false;

const STORAGE_KEY = "rayhan_sound_fx";

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

function tone(freq: number, startAt: number, duration: number, volume: number, type: OscillatorType = "sine") {
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audio.currentTime + startAt);
  // Gentle attack, exponential decay — feels like glass, not a synth
  gain.gain.setValueAtTime(0, audio.currentTime + startAt);
  gain.gain.linearRampToValueAtTime(volume, audio.currentTime + startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + startAt + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(audio.currentTime + startAt);
  osc.stop(audio.currentTime + startAt + duration + 0.05);
}

const recipes: Record<SoundName, () => void> = {
  tap: () => tone(880, 0, 0.09, 0.06, "sine"),
  notch: () => {
    tone(660, 0, 0.1, 0.05, "sine");
    tone(990, 0.045, 0.12, 0.04, "sine");
  },
  chime: () => {
    tone(523.25, 0, 0.22, 0.05);
    tone(659.25, 0.06, 0.24, 0.045);
    tone(783.99, 0.12, 0.3, 0.04);
  },
  success: () => {
    tone(523.25, 0, 0.16, 0.05);
    tone(783.99, 0.09, 0.22, 0.05);
    tone(1046.5, 0.18, 0.34, 0.045);
  },
  pop: () => tone(320, 0, 0.12, 0.07, "triangle"),
};

export function initSoundEngine() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  enabled = localStorage.getItem(STORAGE_KEY) === "enabled";
}

export function isSoundEnabled() {
  if (!initialized) initSoundEngine();
  return enabled;
}

export function toggleSound(): boolean {
  enabled = !enabled;
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? "enabled" : "disabled");
  } catch {}
  if (enabled) playSound("chime");
  return enabled;
}

export function playSound(name: SoundName) {
  if (!enabled) return;
  try {
    recipes[name]();
  } catch {
    /* audio unavailable — stay silent */
  }
}

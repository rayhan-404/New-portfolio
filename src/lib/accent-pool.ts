/* ────────────────────────────────────────────────────────────────────
   ACCENT POOL — the reference CSS's headline system:
   "Material Colors — Random on each refresh".

   The reference declares a 10-hue --mc-* Material pool and draws one
   at random on every page load; that hue becomes the site's primary
   color (ref .btn-primary, .hero-name span, .bnav-item.active… all
   consume var(--primary)). A .color-cycle-btn walks the pool manually.

   This module ports that behavior 1:1:
   • ACCENT_POOL        — the ref's exact hexes (primary = Material 500,
                          the very values in the ref's --mc-* block)
   • ACCENT_BOOT_SCRIPT — inline <head> script, runs before first paint,
                          picks a random hue, sets the --hue-* slots
   • applyAccent/cycleAccent — used by the color-cycle button
   ──────────────────────────────────────────────────────────────────── */

export interface AccentHue {
  id: string;
  label: string;
  /** light theme: primary / primary2 / accent (Material 500 / 400 / A200) */
  light: [string, string, string];
  /** dark theme: same hue lifted to Material 400 / 300 / A200 for the
      ember-brown field — same pattern the site already used for
      deep orange (#e64a19 light → #ff7043 dark) */
  dark: [string, string, string];
}

/* Exact hexes. Purple's triple is the reference's own declaration
   (--primary #9c27b0 / --primary2 #ab47bc / --accent #e040fb); the
   other hues follow the same Material 500/400/A200 recipe. Warm hues
   (deep-orange, amber) use the warm A200 amber shades for accents so
   the signature primary→accent gradients keep their fire. */
export const ACCENT_POOL: AccentHue[] = [
  {
    id: "purple",
    label: "Purple",
    light: ["#9c27b0", "#ab47bc", "#e040fb"],
    dark: ["#ab47bc", "#ba68c8", "#e040fb"],
  },
  {
    id: "indigo",
    label: "Indigo",
    light: ["#3f51b5", "#5c6bc0", "#536dfe"],
    dark: ["#5c6bc0", "#7986cb", "#536dfe"],
  },
  {
    id: "teal",
    label: "Teal",
    light: ["#009688", "#26a69a", "#64ffda"],
    dark: ["#26a69a", "#4db6ac", "#64ffda"],
  },
  {
    id: "deep-orange",
    label: "Deep Orange",
    light: ["#ff5722", "#ff7043", "#ff9800"],
    dark: ["#ff7043", "#ff8a65", "#ffab40"],
  },
  {
    id: "pink",
    label: "Pink",
    light: ["#e91e63", "#ec407a", "#f48fb1"],
    dark: ["#ec407a", "#f06292", "#f48fb1"],
  },
  {
    id: "cyan",
    label: "Cyan",
    light: ["#00bcd4", "#26c6da", "#18ffff"],
    dark: ["#26c6da", "#4dd0e1", "#18ffff"],
  },
  {
    id: "amber",
    label: "Amber",
    light: ["#ff9800", "#ffb74d", "#ffab40"],
    dark: ["#ffb74d", "#ffcc80", "#ffab40"],
  },
  {
    id: "deep-purple",
    label: "Deep Purple",
    light: ["#673ab7", "#7e57c2", "#b388ff"],
    dark: ["#7e57c2", "#9575cd", "#b388ff"],
  },
  {
    id: "green",
    label: "Green",
    light: ["#4caf50", "#66bb6a", "#69f0ae"],
    dark: ["#66bb6a", "#81c784", "#69f0ae"],
  },
  {
    id: "blue",
    label: "Blue",
    light: ["#2196f3", "#42a5f5", "#448aff"],
    dark: ["#42a5f5", "#64b5f6", "#448aff"],
  },
];

const hexToRgb = (hex: string): string => {
  const n = hex.replace("#", "");
  return `${parseInt(n.slice(0, 2), 16)} ${parseInt(n.slice(2, 4), 16)} ${parseInt(n.slice(4, 6), 16)}`;
};

/** Apply hue at `index` to <html>. Writes only the --hue-* slots; the
    stylesheet routes them into --primary/--primary2-ref/--accent-ref/
    --primary-rgb/--accent-rgb per theme, so light & dark both update. */
export function applyAccent(index: number): AccentHue {
  const len = ACCENT_POOL.length;
  const hue = ACCENT_POOL[((index % len) + len) % len];
  const s = document.documentElement.style;
  s.setProperty("--hue-pri-l", hue.light[0]);
  s.setProperty("--hue-pri2-l", hue.light[1]);
  s.setProperty("--hue-acc-l", hue.light[2]);
  s.setProperty("--hue-rgb-l", hexToRgb(hue.light[0]));
  s.setProperty("--hue-argb-l", hexToRgb(hue.light[2]));
  s.setProperty("--hue-pri-d", hue.dark[0]);
  s.setProperty("--hue-pri2-d", hue.dark[1]);
  s.setProperty("--hue-acc-d", hue.dark[2]);
  s.setProperty("--hue-rgb-d", hexToRgb(hue.dark[0]));
  s.setProperty("--hue-argb-d", hexToRgb(hue.dark[2]));
  document.documentElement.dataset.accent = hue.id;
  return hue;
}

/** Read the hue the boot script picked (dataset.accent), advance to the
    next pool entry and apply it — the ref's .color-cycle-btn behavior. */
export function cycleAccent(): AccentHue {
  const el = document.documentElement;
  const cur = ACCENT_POOL.findIndex((h) => h.id === el.dataset.accent);
  return applyAccent((cur + 1 + ACCENT_POOL.length) % ACCENT_POOL.length);
}

/* Pre-paint boot script for <head> — the "Random on each refresh".
   Self-contained (no imports), fails silently. Sets the same --hue-*
   slots as applyAccent so the cycle button continues from the drawn hue. */
export const ACCENT_BOOT_SCRIPT = `(function(){try{var P=${JSON.stringify(
  ACCENT_POOL.map((h) => [h.id, ...h.light, ...h.dark]),
)};var e=P[Math.floor(Math.random()*P.length)];var s=document.documentElement.style;var x=function(h){var n=h.slice(1);return parseInt(n.slice(0,2),16)+' '+parseInt(n.slice(2,4),16)+' '+parseInt(n.slice(4,6),16)};s.setProperty('--hue-pri-l',e[1]);s.setProperty('--hue-pri2-l',e[2]);s.setProperty('--hue-acc-l',e[3]);s.setProperty('--hue-rgb-l',x(e[1]));s.setProperty('--hue-argb-l',x(e[3]));s.setProperty('--hue-pri-d',e[4]);s.setProperty('--hue-pri2-d',e[5]);s.setProperty('--hue-acc-d',e[6]);s.setProperty('--hue-rgb-d',x(e[4]));s.setProperty('--hue-argb-d',x(e[6]));document.documentElement.dataset.accent=e[0];}catch(err){}})();`;

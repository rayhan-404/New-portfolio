/* ────────────────────────────────────────────────────────────────────
   ACCENT POOL — the reference CSS's headline system:
   "Material Colors — Random on each refresh" — STAIN-FREE EDITION.

   The reference declares a 10-hue --mc-* Material pool and draws one
   at random on every page load; that hue becomes the site's primary.
   A .color-cycle-btn walks the pool manually.

   The earlier port blended the drawn hue into ONE fixed warm field,
   which stained cool hues across the cream surfaces (a washed-in
   "stained cloth" look). This edition gives EVERY hue its own
   hand-tuned surface family for both themes:

   • light  — a clean tinted field at ~94% lightness (lilac, periwinkle,
              sage-mint, powder blue, honey sand…) so the 500-sat
              accent never blends into foreign ground
   • dark   — a deep tinted ember field in the same family
   • shadows and ink ride the family too (rgb triplets shipped along)

   The boot script / cycle button write only --hue-* slots; the
   stylesheet routes them per theme. Fallbacks = the brand's
   deep-orange family, so SSR paint is already on-brand.
   ──────────────────────────────────────────────────────────────────── */

export interface SurfaceFamily {
  bg: string;
  bg2: string;
  bg3: string;
  /** light edge (neumorphic highlight) */
  nl: string;
  /** depth shadow (neumorphic shade) */
  nd: string;
  text: string;
  text2: string;
  text3: string;
}

export interface AccentHue {
  id: string;
  label: string;
  surfaceL: SurfaceFamily;
  surfaceD: SurfaceFamily;
  /** light theme: primary / primary2 / accent (Material 500 / 400 / A200) */
  light: [string, string, string];
  /** dark theme: the same hue lifted one Material step */
  dark: [string, string, string];
}

export const ACCENT_POOL: AccentHue[] = [
  {
    id: "purple",
    label: "Purple",
    surfaceL: { bg: "#f4ecf5", bg2: "#ece0ee", bg3: "#e2d2e6", nl: "#fdfbff", nd: "#d5c2da", text: "#2b1430", text2: "#7c5585", text3: "#a888b0" },
    surfaceD: { bg: "#190b1d", bg2: "#251428", bg3: "#332038", nl: "#43294a", nd: "#0a040c", text: "#f6ecf8", text2: "#dcb2e4", text3: "#a986b3" },
    light: ["#9c27b0", "#ab47bc", "#e040fb"],
    dark: ["#ab47bc", "#ba68c8", "#e040fb"],
  },
  {
    id: "indigo",
    label: "Indigo",
    surfaceL: { bg: "#edeef6", bg2: "#e2e4f0", bg3: "#d5d8e8", nl: "#fbfcff", nd: "#c9cde0", text: "#171a33", text2: "#565c85", text3: "#8288a8" },
    surfaceD: { bg: "#10121f", bg2: "#1a1d30", bg3: "#262a44", nl: "#353a58", nd: "#06070f", text: "#eef0fa", text2: "#b8c0e8", text3: "#848db8" },
    light: ["#3f51b5", "#5c6bc0", "#536dfe"],
    dark: ["#5c6bc0", "#7986cb", "#536dfe"],
  },
  {
    id: "teal",
    label: "Teal",
    surfaceL: { bg: "#eaf2ef", bg2: "#ddeae5", bg3: "#cfe0da", nl: "#f8fdfb", nd: "#c2d5cd", text: "#0e2620", text2: "#4a7468", text3: "#7a9c90" },
    surfaceD: { bg: "#081713", bg2: "#102420", bg3: "#183229", nl: "#23463c", nd: "#030b09", text: "#eafaf4", text2: "#a4d8c6", text3: "#6fa795" },
    light: ["#009688", "#26a69a", "#64ffda"],
    dark: ["#26a69a", "#4db6ac", "#64ffda"],
  },
  {
    id: "deep-orange",
    label: "Deep Orange",
    surfaceL: { bg: "#faf3ea", bg2: "#f4ebdc", bg3: "#eee1cd", nl: "#fffdf8", nd: "#e0cbb0", text: "#341a0b", text2: "#8a5c3d", text3: "#b18a67" },
    surfaceD: { bg: "#160d08", bg2: "#231511", bg3: "#332216", nl: "#4a3320", nd: "#070302", text: "#fdf4e8", text2: "#f0c9a2", text3: "#c69c78" },
    light: ["#ff5722", "#ff7043", "#ff9800"],
    dark: ["#ff7043", "#ff8a65", "#ffab40"],
  },
  {
    id: "pink",
    label: "Pink",
    surfaceL: { bg: "#f8eef1", bg2: "#f1e2e7", bg3: "#e9d4db", nl: "#fffbfc", nd: "#dcc3cb", text: "#33101d", text2: "#8a4d63", text3: "#b08393" },
    surfaceD: { bg: "#1d0a13", bg2: "#2c1220", bg3: "#3e1d2e", nl: "#552a3f", nd: "#0d0407", text: "#fbeaf1", text2: "#eeb0c8", text3: "#bd8398" },
    light: ["#e91e63", "#ec407a", "#f48fb1"],
    dark: ["#ec407a", "#f06292", "#f48fb1"],
  },
  {
    id: "cyan",
    label: "Cyan",
    surfaceL: { bg: "#e9f3f5", bg2: "#dcebee", bg3: "#cde2e7", nl: "#f8feff", nd: "#bfd8dd", text: "#0c2830", text2: "#3f7683", text3: "#6e9aa4" },
    surfaceD: { bg: "#081519", bg2: "#102328", bg3: "#193339", nl: "#234a52", nd: "#030a0c", text: "#e9f9fc", text2: "#a2d8e2", text3: "#6da3ad" },
    light: ["#00bcd4", "#26c6da", "#18ffff"],
    dark: ["#26c6da", "#4dd0e1", "#18ffff"],
  },
  {
    id: "amber",
    label: "Amber",
    surfaceL: { bg: "#f7efe0", bg2: "#f1e5cf", bg3: "#ead9bc", nl: "#fffdf6", nd: "#ddc8a5", text: "#33230a", text2: "#87662f", text3: "#b09457" },
    surfaceD: { bg: "#171008", bg2: "#251a0e", bg3: "#352616", nl: "#4b3722", nd: "#0a0602", text: "#fbf3e4", text2: "#ecd3a4", text3: "#bfa578" },
    light: ["#ff9800", "#ffb74d", "#ffab40"],
    dark: ["#ffb74d", "#ffcc80", "#ffab40"],
  },
  {
    id: "deep-purple",
    label: "Deep Purple",
    surfaceL: { bg: "#f1edf6", bg2: "#e8e1f0", bg3: "#ddd2e8", nl: "#fcfaff", nd: "#cec2dd", text: "#221335", text2: "#645386", text3: "#8f7fac" },
    surfaceD: { bg: "#120c1c", bg2: "#1d1429", bg3: "#2a1f3a", nl: "#3b2d52", nd: "#07050d", text: "#f1ecf9", text2: "#cbb6ea", text3: "#9788b8" },
    light: ["#673ab7", "#7e57c2", "#b388ff"],
    dark: ["#7e57c2", "#9575cd", "#b388ff"],
  },
  {
    id: "green",
    label: "Green",
    surfaceL: { bg: "#edf3ea", bg2: "#e1ebdb", bg3: "#d3e2ca", nl: "#fafdf7", nd: "#c8d8bd", text: "#14230e", text2: "#52724a", text3: "#7f9c74" },
    surfaceD: { bg: "#0c1509", bg2: "#152113", bg3: "#1f3019", nl: "#2e4524", nd: "#050a04", text: "#edf8e8", text2: "#bcd8ac", text3: "#8aa87c" },
    light: ["#4caf50", "#66bb6a", "#69f0ae"],
    dark: ["#66bb6a", "#81c784", "#69f0ae"],
  },
  {
    id: "blue",
    label: "Blue",
    surfaceL: { bg: "#eaf1f7", bg2: "#dde8f1", bg3: "#cddcee", nl: "#f9fcff", nd: "#c2d2e2", text: "#0f2033", text2: "#466480", text3: "#7490a8" },
    surfaceD: { bg: "#0a1320", bg2: "#122032", bg3: "#1b2f47", nl: "#284261", nd: "#040910", text: "#eaf3fc", text2: "#aacced", text3: "#7899b8" },
    light: ["#2196f3", "#42a5f5", "#448aff"],
    dark: ["#42a5f5", "#64b5f6", "#448aff"],
  },
];

const hexToRgb = (hex: string): string => {
  const n = hex.replace("#", "");
  return `${parseInt(n.slice(0, 2), 16)} ${parseInt(n.slice(2, 4), 16)} ${parseInt(n.slice(4, 6), 16)}`;
};

/** Flat slot map for one hue — the single source shared by the boot
    script and the cycle button. Values are the raw --hue-* payloads. */
function slotsFor(hue: AccentHue): Record<string, string> {
  const L = hue.surfaceL;
  const D = hue.surfaceD;
  return {
    /* light surface family */
    "hue-bg-l": L.bg,
    "hue-bg2-l": L.bg2,
    "hue-bg3-l": L.bg3,
    "hue-nl-l": L.nl,
    "hue-nd-l": L.nd,
    "hue-text-l": L.text,
    "hue-text2-l": L.text2,
    "hue-text3-l": L.text3,
    "hue-bgr-l": hexToRgb(L.bg2),
    "hue-textr-l": hexToRgb(L.text),
    /* light accents */
    "hue-pri-l": hue.light[0],
    "hue-pri2-l": hue.light[1],
    "hue-acc-l": hue.light[2],
    "hue-rgb-l": hexToRgb(hue.light[0]),
    "hue-argb-l": hexToRgb(hue.light[2]),
    /* dark surface family */
    "hue-bg-d": D.bg,
    "hue-bg2-d": D.bg2,
    "hue-bg3-d": D.bg3,
    "hue-nl-d": D.nl,
    "hue-nd-d": D.nd,
    "hue-text-d": D.text,
    "hue-text2-d": D.text2,
    "hue-text3-d": D.text3,
    "hue-bgr-d": hexToRgb(D.bg2),
    "hue-textr-d": hexToRgb(D.text),
    /* dark accents */
    "hue-pri-d": hue.dark[0],
    "hue-pri2-d": hue.dark[1],
    "hue-acc-d": hue.dark[2],
    "hue-rgb-d": hexToRgb(hue.dark[0]),
    "hue-argb-d": hexToRgb(hue.dark[2]),
  };
}

/** Apply hue at `index` to <html>. Writes only the --hue-* slots; the
    stylesheet routes them into the tokens per theme, so light & dark
    both update instantly. */
export function applyAccent(index: number): AccentHue {
  const len = ACCENT_POOL.length;
  const hue = ACCENT_POOL[((index % len) + len) % len];
  const s = document.documentElement.style;
  const slots = slotsFor(hue);
  for (const k in slots) {
    s.setProperty(`--${k}`, slots[k]);
  }
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
   slot map as applyAccent so the cycle button continues from the
   drawn hue. */
export const ACCENT_BOOT_SCRIPT = `(function(){try{var P=${JSON.stringify(
  ACCENT_POOL.map((h) => ({ id: h.id, ...slotsFor(h) }))
)};var e=P[Math.floor(Math.random()*P.length)];var s=document.documentElement.style;for(var k in e){if(k!=='id'){s.setProperty('--'+k,e[k]);}}document.documentElement.dataset.accent=e.id;}catch(err){}})();`;

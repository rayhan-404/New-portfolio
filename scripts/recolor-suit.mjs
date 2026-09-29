/* ────────────────────────────────────────────────────────────────────
   SUIT RECOLOR ENGINE — deterministic per-accent hero image variants.

   For each accent in the site's ACCENT_POOL (src/lib/accent-pool.ts —
   keep the hex list in sync!) this script produces a copy of each hero
   photo that is PIXEL-IDENTICAL except the suit, which takes the
   accent's hue. The real face, shirt, hands, background and alpha are
   never touched — "same images, suit recolored", guaranteed by math,
   not by an AI model's dice roll.

   Mask = color affinity (hue≈navy, low luma, low-mid sat)
        × generous region polygon (excludes hair / top glass)
        × texture gate (portrait only — the bokeh bg is smooth, the
          suit is sharp fabric)
        − hand holes (shadowed skin reads navy)
        feathered, then the suit is re-tinted at preserved luminance.

   Usage:
     node scripts/recolor-suit.mjs                 → all variants
     node scripts/recolor-suit.mjs --debug portrait amber
         → debug-mask + single result for tuning
   ──────────────────────────────────────────────────────────────────── */
import sharp from "sharp";

/* keep in sync with src/lib/accent-pool.ts (light[0] = Material 500) */
const ACCENTS = [
  { id: "purple", hex: "#9c27b0" },
  { id: "indigo", hex: "#3f51b5" },
  { id: "teal", hex: "#009688" },
  { id: "deep-orange", hex: "#ff5722" },
  { id: "pink", hex: "#e91e63" },
  { id: "cyan", hex: "#00bcd4" },
  { id: "amber", hex: "#ff9800" },
  { id: "deep-purple", hex: "#673ab7" },
  { id: "green", hex: "#4caf50" },
  { id: "blue", hex: "#2196f3" },
];

const IMAGES = {
  portrait: {
    in: "public/generated/m-rayhan-portrait-hd.webp",
    out: (id) => `public/generated/m-rayhan-portrait-hd-${id}.webp`,
    /* generous suit region hugging ABOVE the shoulder line — color
       gates do the fine work; bevel points keep the bokeh glass out */
    poly: [
      [30, 43], [68, 42.5], [80, 44], [88, 47], [97, 54], [98, 100],
      [3, 100], [3, 58], [10, 54], [18, 47], [24, 44],
    ],
    /* monitor + desk edge bottom-left would tint (dark, cool, sharp) */
    holes: [
      [[0, 78], [9, 78], [9, 100], [0, 100]],
    ],
    textureGate: true,
    quality: 86,
  },
  cutout: {
    in: "public/generated/m-rayhan-cutout-lossless.webp",
    out: (id) => `public/generated/m-rayhan-cutout-${id}.webp`,
    /* full-width band below the hair + a head-shaped hole so the
       hair's cool sheen (h≈200-215 — inside the navy hue window)
       can never take the accent; white shirt luma-gated, warm skin
       hue-gated, alpha-0 bg stays invisible */
    poly: [
      [0, 35], [100, 35], [100, 100], [0, 100],
    ],
    /* luma window [floor, full] — collar's deepest shadows sit below
       the portrait's floor, so the cutout digs deeper */
    lumaWindow: [0.015, 0.05],
    holes: [
      [[24, 0], [76, 0], [76, 22], [70, 30], [62, 34], [56, 36], [44, 36], [38, 34], [30, 30], [24, 22]],
    ],
    textureGate: false, /* alpha already isolates the person */
    quality: 88,
  },
};

/* ── color helpers ───────────────────────────────────────────────── */
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smoothstep = (v, a, b) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s, l];
}
function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360;
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [
    Math.round(hue(h + 1 / 3) * 255),
    Math.round(hue(h) * 255),
    Math.round(hue(h - 1 / 3) * 255),
  ];
}
const hexToRgb = (hex) => {
  const n = hex.replace("#", "");
  return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
};

/* ── geometry helpers (all coords in % of width/height) ─────────── */
function pointInPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function buildRegion(w, h, poly, holes) {
  const m = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const py = (y / (h - 1)) * 100;
    for (let x = 0; x < w; x++) {
      const px = (x / (w - 1)) * 100;
      m[y * w + x] = pointInPoly(px, py, poly) ? 1 : 0;
    }
  }
  for (const hole of holes) {
    for (let y = 0; y < h; y++) {
      const py = (y / (h - 1)) * 100;
      if (py < Math.min(...hole.map((p) => p[1])) || py > Math.max(...hole.map((p) => p[1]))) continue;
      for (let x = 0; x < w; x++) {
        const px = (x / (w - 1)) * 100;
        if (pointInPoly(px, py, hole)) m[y * w + x] = 0;
      }
    }
  }
  return m;
}
/* separable box blur ×3 ≈ gaussian, radius in px */
function blurField(src, w, h, radius) {
  if (radius <= 0) return src;
  const a = Float32Array.from(src);
  const b = new Float32Array(w * h);
  for (let pass = 0; pass < 3; pass++) {
    /* horizontal: a → b */
    for (let y = 0; y < h; y++) {
      const row = y * w;
      let acc = 0;
      for (let x = -radius; x <= radius; x++) acc += a[row + Math.min(w - 1, Math.max(0, x))];
      for (let x = 0; x < w; x++) {
        b[row + x] = acc / (2 * radius + 1);
        const outv = a[row + Math.min(w - 1, Math.max(0, x - radius))];
        const inv = a[row + Math.min(w - 1, Math.max(0, x + radius + 1))];
        acc += inv - outv;
      }
    }
    /* vertical: b → a */
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let y = -radius; y <= radius; y++) acc += b[Math.min(h - 1, Math.max(0, y)) * w + x];
      for (let y = 0; y < h; y++) {
        a[y * w + x] = acc / (2 * radius + 1);
        const outv = b[Math.min(h - 1, Math.max(0, y - radius)) * w + x];
        const inv = b[Math.min(h - 1, Math.max(0, y + radius + 1)) * w + x];
        acc += inv - outv;
      }
    }
  }
  return a;
}
/* sobel gradient magnitude of luma, blurred → texture gate */
function textureField(data, w, h, ch) {
  const lum = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    lum[i] = 0.299 * data[i * ch] + 0.587 * data[i * ch + 1] + 0.114 * data[i * ch + 2];
  }
  const g = new Float32Array(w * h);
  let max = 1;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx =
        -lum[i - w - 1] - 2 * lum[i - 1] - lum[i + w - 1] +
        lum[i - w + 1] + 2 * lum[i + 1] + lum[i + w + 1];
      const gy =
        -lum[i - w - 1] - 2 * lum[i - w] - lum[i - w + 1] +
        lum[i + w - 1] + 2 * lum[i + w] + lum[i + w + 1];
      const m = Math.sqrt(gx * gx + gy * gy);
      g[i] = m;
      if (m > max) max = m;
    }
  }
  /* radius 8: fabric weave averages out (stays textured) while bokeh
     glass stays smooth — the earlier σ2 gate speckled the fabric */
  return blurField(g, w, h, 8).map((v) => v / max);
}

/* ── the recolor ─────────────────────────────────────────────────── */
async function recolor(key, accent, debug) {
  const cfg = IMAGES[key];
  const img = sharp(cfg.in);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, ch = info.channels;

  /* mask */
  const region = buildRegion(w, h, cfg.poly, cfg.holes);
  const tex = cfg.textureGate ? textureField(data, w, h, ch) : null;

  const W = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    if (region[i] === 0) { W[i] = 0; continue; }
    const r = data[i * ch], g = data[i * ch + 1], b = data[i * ch + 2];
    const [hh, ss, ll] = rgbToHsl(r, g, b);
    /* hue affinity around navy ~234° */
    let dh = Math.abs(hh - 234);
    if (dh > 180) dh = 360 - dh;
    const hueW = Math.exp(-((dh / 42) ** 2));
    const satW = smoothstep(ss, 0.05, 0.11);
    const [l0, l1] = cfg.lumaWindow ?? [0.03, 0.09];
    const lumW = smoothstep(ll, l0, l1) * (1 - smoothstep(ll, 0.45, 0.68));
    let wgt = hueW * satW * lumW;
    if (tex) wgt *= smoothstep(tex[i], 0.0015, 0.01);
    W[i] = wgt;
  }
  const Ws = blurField(W, w, h, 2);

  /* recolor pass */
  const [tr, tg, tb] = hexToRgb(accent.hex);
  const [th, ts, tl] = rgbToHsl(tr, tg, tb);
  const out = Buffer.from(data);
  for (let i = 0; i < w * h; i++) {
    const wgt = Ws[i];
    if (wgt < 0.01) continue;
    const r = data[i * ch], g = data[i * ch + 1], b = data[i * ch + 2];
    const [, ss, ll] = rgbToHsl(r, g, b);
    /* keep fabric shading (luminance), replace hue/chroma with the
       accent's; specular ridges desaturate, deep folds gain chroma */
    const spec = 1 - smoothstep(ll, 0.38, 0.62) * 0.8;
    const chromaConf = clamp01((ss - 0.05) / 0.16);
    const S2 = clamp01(ts * spec * (0.78 + 0.4 * chromaConf));
    /* gentle midtone lift so dark fabric still reads the hue */
    const L2 = clamp01(ll + (0.40 - ll) * 0.20 * wgt);
    const [nr, ng, nb] = hslToRgb(th, S2, L2);
    out[i * ch] = Math.round(r + (nr - r) * wgt);
    out[i * ch + 1] = Math.round(g + (ng - g) * wgt);
    out[i * ch + 2] = Math.round(b + (nb - b) * wgt);
    if (ch === 4) out[i * ch + 3] = data[i * ch + 3]; // alpha untouched
  }

  if (debug) {
    /* mask visualization: original grayscale × mask heat */
    const vis = Buffer.alloc(w * h * 3);
    for (let i = 0; i < w * h; i++) {
      const r = data[i * ch], g = data[i * ch + 1], b = data[i * ch + 2];
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      const m = Math.min(1, Ws[i] * 1.6);
      vis[i * 3] = Math.round(gray * (1 - m) + 255 * m);
      vis[i * 3 + 1] = Math.round(gray * (1 - m));
      vis[i * 3 + 2] = Math.round(gray * (1 - m));
    }
    await sharp(vis, { raw: { width: w, height: h, channels: 3 } })
      .webp({ quality: 90 })
      .toFile(`tool-results/debug-${key}-${accent.id}-mask.webp`);
  }

  const encoded = sharp(out, { raw: { width: w, height: h, channels: ch } });
  const dest = debug ? `tool-results/debug-${key}-${accent.id}.webp` : cfg.out(accent.id);
  if (ch === 4) await encoded.webp({ quality: cfg.quality, alphaQuality: 90, effort: 5 }).toFile(dest);
  else await encoded.webp({ quality: cfg.quality, effort: 5 }).toFile(dest);
  console.log(`${debug ? "DEBUG" : "wrote"} ${dest}`);
}

/* ── main ────────────────────────────────────────────────────────── */
const args = process.argv.slice(2);
const debugIdx = args.indexOf("--debug");
if (debugIdx !== -1) {
  const key = args[debugIdx + 1];
  const id = args[debugIdx + 2];
  const accent = ACCENTS.find((a) => a.id === id);
  if (!accent || !IMAGES[key]) {
    console.error("usage: --debug <portrait|cutout> <accent-id>");
    process.exit(1);
  }
  await recolor(key, accent, true);
} else {
  for (const accent of ACCENTS) {
    for (const key of Object.keys(IMAGES)) {
      await recolor(key, accent, false);
    }
  }
  console.log("all variants done");
}

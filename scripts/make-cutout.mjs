/**
 * make-cutout.mjs (v2) — turns the green-screen hero portrait into a
 * transparent PNG cutout for the mobile hero.
 *
 * v2: GLOBAL green-dominance mask instead of border flood-fill — the
 * generated screen has a dark vignette and enclosed pockets (crossed
 * arms) that break connectivity. The subject contains no green, so a
 * straight hue test segments cleanly at any brightness.
 *
 * Pipeline:
 *   1. Mask = every pixel where green clearly dominates (g > r+14,
 *      g > b+14, g > 30) — catches bright screen, vignette shadow and
 *      pockets between the arms.
 *   2. Erode the subject 2px to kill the green fringe.
 *   3. Despill: pull residual green out of kept pixels.
 *   4. Feather the alpha (1.2px blur) for a soft Apple-grade edge.
 *   5. Crop to subject bbox (+12px pad) and save.
 *
 * Usage: node scripts/make-cutout.mjs <src> <out>
 */
import sharp from "sharp";
import { existsSync } from "node:fs";

const SRC = process.argv[2] ?? "/home/z/my-project/public/generated/hero-greenscreen.png";
const OUT = process.argv[3] ?? "/home/z/my-project/public/generated/hero-cutout.png";

if (!existsSync(SRC)) {
  console.error("SRC missing:", SRC);
  process.exit(1);
}

const { data: px, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
console.log(`loaded ${W}x${H}`);

/* 1. Global green-dominance background mask */
const bg = new Uint8Array(W * H);
let bgCount = 0;
for (let i = 0; i < W * H; i++) {
  const o = i * 4;
  const r = px[o], g = px[o + 1], b = px[o + 2];
  if (g > 30 && g > r + 14 && g > b + 14) {
    bg[i] = 1;
    bgCount++;
  }
}
console.log(`background: ${bgCount}/${W * H} px (${((100 * bgCount) / (W * H)).toFixed(1)}%)`);
if (bgCount < W * H * 0.1 || bgCount > W * H * 0.97) {
  console.error("FATAL: background mask implausible — wrong source image?");
  process.exit(2);
}

/* 2. Keep-mask with 2px erosion (kills the green fringe) */
let keep = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) keep[i] = bg[i] ? 0 : 1;
for (let pass = 0; pass < 2; pass++) {
  const next = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!keep[i]) continue;
      const l = x > 0 ? i - 1 : i;
      const r = x < W - 1 ? i + 1 : i;
      const u = y > 0 ? i - W : i;
      const d = y < H - 1 ? i + W : i;
      next[i] = keep[l] && keep[r] && keep[u] && keep[d] ? 1 : 0;
    }
  }
  keep = next;
}

/* 3. Despill on kept pixels */
for (let i = 0; i < W * H; i++) {
  if (!keep[i]) continue;
  const o = i * 4;
  const r = px[o], g = px[o + 1], b = px[o + 2];
  const m = (r + b) / 2;
  if (g > r + 4 && g > b + 4 && g > m) {
    px[o + 1] = Math.round(m + (g - m) * 0.15);
  }
}

/* 4. Feathered alpha — NOTE: sharp blur on 1-band input emits 3 bands,
   so we blur a replicated 3-band mask and read byte i*3. */
const mask3 = Buffer.alloc(W * H * 3);
for (let i = 0; i < W * H; i++) {
  const v = keep[i] ? 255 : 0;
  mask3[i * 3] = v;
  mask3[i * 3 + 1] = v;
  mask3[i * 3 + 2] = v;
}
const soft3 = await sharp(mask3, { raw: { width: W, height: H, channels: 3 } })
  .blur(1.2)
  .raw()
  .toBuffer();
if (soft3.length !== W * H * 3) {
  console.error(`FATAL: unexpected blur output length ${soft3.length}`);
  process.exit(4);
}

const out = Buffer.alloc(W * H * 4);
for (let i = 0; i < W * H; i++) {
  out[i * 4] = px[i * 4];
  out[i * 4 + 1] = px[i * 4 + 1];
  out[i * 4 + 2] = px[i * 4 + 2];
  out[i * 4 + 3] = soft3[i * 3];
}

/* 5. Crop to subject bbox (+12px pad) */
let minX = W, minY = H, maxX = -1, maxY = -1;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (soft3[y * W * 3 + x * 3] > 12) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
if (maxX < 0) {
  console.error("FATAL: subject not found.");
  process.exit(3);
}
const pad = 12;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(W - 1, maxX + pad);
maxY = Math.min(H - 1, maxY + pad);
const cw = maxX - minX + 1;
const ch = maxY - minY + 1;

await sharp(out, { raw: { width: W, height: H, channels: 4 } })
  .extract({ left: minX, top: minY, width: cw, height: ch })
  .png({ compressionLevel: 9 })
  .toFile(OUT);

console.log(`saved ${OUT} — ${cw}x${ch}`);

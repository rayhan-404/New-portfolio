/* ────────────────────────────────────────────────────────────────────
   MONO HERO IMAGES — the Black & White theme's photo variants.

   Unlike scripts/recolor-suit.mjs (suit-only recolor, everything else
   pixel-identical), the mono variants desaturate the WHOLE photo to
   true grayscale: a monochrome theme deserves a monochrome hero, not
   a gray suit under a warm-toned face and colored bokeh.

   Deterministic — sharp's grayscale() is a fixed luma transform, so
   re-running always yields identical bytes-for-pixels output.

   Usage:
     node scripts/make-mono.mjs
   ──────────────────────────────────────────────────────────────────── */
import sharp from "sharp";

const JOBS = [
  {
    /* desktop portrait card — same encoding profile as recolor-suit */
    in: "public/generated/m-rayhan-portrait-hd.webp",
    out: "public/generated/m-rayhan-portrait-hd-mono.webp",
    quality: 86,
  },
  {
    /* mobile cutout — alpha channel preserved (transparent bg) */
    in: "public/generated/m-rayhan-cutout-lossless.webp",
    out: "public/generated/m-rayhan-cutout-mono.webp",
    quality: 88,
    alpha: true,
  },
];

for (const job of JOBS) {
  const pipeline = sharp(job.in).grayscale();
  const options = { quality: job.quality, effort: 5 };
  if (job.alpha) options.alphaQuality = 90;
  await pipeline.webp(options).toFile(job.out);
  console.log(`wrote ${job.out}`);
}
console.log("mono variants done");

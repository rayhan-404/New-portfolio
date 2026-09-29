/* Suit color sampling — probe both hero photos at known feature points
   to design the selective recolor mask. Run: node scripts/sample-suit.mjs */
import sharp from "sharp";

const FILES = {
  portrait: "public/generated/m-rayhan-portrait-hd.webp",
  cutout: "public/generated/m-rayhan-cutout-lossless.webp",
};

/* relative probe points { x%, y%, label } per image */
const PROBES = {
  portrait: [
    [28, 56, "left shoulder"],
    [74, 54, "right shoulder"],
    [20, 80, "left sleeve"],
    [82, 86, "right sleeve/lapel"],
    [42, 78, "lapel shadow"],
    [50, 62, "white shirt"],
    [50, 12, "hair"],
    [55, 40, "face skin"],
    [38, 76, "crossed hand"],
    [10, 10, "bg glass"],
    [88, 22, "bg warm light"],
    [30, 30, "bg mid"],
  ],
  cutout: [
    [30, 58, "left shoulder"],
    [72, 56, "right shoulder"],
    [16, 82, "left sleeve"],
    [84, 88, "right sleeve/lapel"],
    [42, 80, "lapel shadow"],
    [50, 66, "white shirt"],
    [50, 10, "hair"],
    [55, 34, "face skin"],
    [36, 80, "crossed hand"],
  ],
};

const rgbToHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s, l];
};

for (const [name, file] of Object.entries(FILES)) {
  const img = sharp(file);
  const meta = await img.metadata();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  console.log(`\n══ ${name} ${meta.width}x${meta.height} ch=${ch} ══`);
  for (const [px, py, label] of PROBES[name]) {
    const x = Math.round((px / 100) * (meta.width - 1));
    const y = Math.round((py / 100) * (meta.height - 1));
    const i = (y * meta.width + x) * ch;
    const r = data[i], g = data[i + 1], b = data[i + 2], a = ch === 4 ? data[i + 3] : 255;
    const [h, s, l] = rgbToHsl(r, g, b);
    console.log(
      `  ${label.padEnd(20)} @(${px}%,${py}%) rgb(${String(r).padStart(3)},${String(g).padStart(3)},${String(b).padStart(3)}) a=${a} h=${h.toFixed(0)}° s=${s.toFixed(2)} l=${l.toFixed(2)}`
    );
  }
}

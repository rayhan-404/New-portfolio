/* Crop key regions for polygon design. Run: node scripts/crop-regions.mjs */
import sharp from "sharp";

const jobs = [
  ["public/generated/m-rayhan-portrait-hd.webp", "portrait", [
    ["hands", 8, 62, 52, 95],
    ["shirtv", 30, 42, 70, 78],
    ["shoulders", 0, 38, 100, 62],
  ]],
  ["public/generated/m-rayhan-cutout-lossless.webp", "cutout", [
    ["hands", 4, 60, 80, 92],
    ["shirtv", 30, 32, 70, 72],
  ]],
];

for (const [file, name, crops] of jobs) {
  const meta = await sharp(file).metadata();
  for (const [label, x1, y1, x2, y2] of crops) {
    const left = Math.round((x1 / 100) * meta.width);
    const top = Math.round((y1 / 100) * meta.height);
    const width = Math.round(((x2 - x1) / 100) * meta.width);
    const height = Math.round(((y2 - y1) / 100) * meta.height);
    await sharp(file)
      .extract({ left, top, width, height })
      .png()
      .toFile(`tool-results/crop-${name}-${label}.png`);
    console.log(`${name}-${label}: box% (${x1},${y1})-(${x2},${y2})`);
  }
}

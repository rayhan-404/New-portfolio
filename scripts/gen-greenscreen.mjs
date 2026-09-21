import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";

const PROMPT =
  "Photorealistic three-quarter body studio portrait of a confident handsome young Black man with short afro hair and neatly groomed mustache, warm subtle smile, wearing a charcoal dark blazer over a black turtleneck, smart casual, arms confidently crossed, standing pose facing camera slightly angled, professional rim lighting outlining shoulders and hair, crisp clean edge definition around the whole body, isolated on a completely flat uniform bright chroma key green screen background solid #00FF00, perfectly even background with no gradients and no shadows on the background, no props, no text, high quality detailed studio photography";

const OUT = "/home/z/my-project/public/generated/hero-greenscreen.png";

async function main() {
  const zai = await ZAI.create();
  console.log("requesting…");
  const res = await zai.images.generations.create({ prompt: PROMPT, size: "864x1152" });
  const b64 = res?.data?.[0]?.base64;
  if (!b64) throw new Error("no image data: " + JSON.stringify(res).slice(0, 400));
  fs.writeFileSync(OUT, Buffer.from(b64, "base64"));
  console.log("saved", OUT, fs.statSync(OUT).size, "bytes");
}

main().catch((e) => {
  console.error("FAILED:", e?.message ?? e);
  process.exit(1);
});

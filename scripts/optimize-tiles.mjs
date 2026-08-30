// Derive optimized web variants from generated master images (design doc section 26).
import sharp from "sharp";
import { readdirSync, mkdirSync } from "node:fs";
import path from "node:path";

const SRC = process.argv[2] ?? "C:/git/nanobanana/pictures";
const OUT = "public/tiles";
mkdirSync(OUT, { recursive: true });
const files = readdirSync(SRC).filter((f) => f.endsWith(".jpg"));
let n = 0;
for (const f of files) {
  const slug = path.basename(f, ".jpg");
  const src = path.join(SRC, f);
  await sharp(src)
    .resize(384, 512, { fit: "cover" })
    .webp({ quality: 78 })
    .toFile(path.join(OUT, `${slug}.webp`));
  await sharp(src)
    .resize(768, 1024, { fit: "cover" })
    .webp({ quality: 80 })
    .toFile(path.join(OUT, `${slug}_lg.webp`));
  n++;
}
console.log(`optimized ${n} masters -> ${OUT}`);

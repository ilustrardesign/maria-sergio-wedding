import { mkdir, copyFile, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const outputDir = path.join("public", "images", "wedding", "hero", "generated");
const masterDir = path.join("public", "images", "wedding", "hero", "masters");
const quality = 88;

const images = [
  {
    id: "desktop",
    source: "Imagen Horizontal.png",
    publicMaster: path.join(masterDir, "hero-desktop.png"),
    prefix: "hero-desktop",
    widths: [960, 1280, 1600, 1920],
  },
  {
    id: "mobile",
    source: "Imagen Vertical.png",
    publicMaster: path.join(masterDir, "hero-mobile.png"),
    prefix: "hero-mobile",
    widths: [480, 640, 768, 1080],
  },
];

function publicPath(filePath) {
  return `/${filePath.replaceAll(path.sep, "/").replace(/^public\//, "")}`;
}

await mkdir(outputDir, { recursive: true });
await mkdir(masterDir, { recursive: true });

const manifest = {};

for (const image of images) {
  const metadata = await sharp(image.source).metadata();
  if (!metadata.width || !metadata.height) throw new Error(`Cannot read dimensions for ${image.source}`);

  await copyFile(image.source, image.publicMaster);

  const variants = [];
  for (const width of image.widths) {
    if (width > metadata.width) continue;

    const target = path.join(outputDir, `${image.prefix}-${width}.webp`);
    await sharp(image.source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toFile(target);

    variants.push({
      width,
      height: Math.round((metadata.height / metadata.width) * width),
      src: publicPath(target),
    });
  }

  const fallback = variants.at(-1);
  if (!fallback) throw new Error(`No variants generated for ${image.source}`);

  manifest[image.id] = {
    src: fallback.src,
    srcSet: variants.map((variant) => `${variant.src} ${variant.width}w`).join(", "),
    width: metadata.width,
    height: metadata.height,
    fallbackSrc: publicPath(image.publicMaster),
    variants,
  };
}

const output = `export type HeroImageVariant = { width: number; height: number; src: string };
export type HeroImage = { src: string; srcSet: string; width: number; height: number; fallbackSrc: string; variants: HeroImageVariant[] };

export const heroImages = ${JSON.stringify(manifest, null, 2)} as const satisfies Record<"desktop" | "mobile", HeroImage>;
`;

await writeFile(path.join("src", "generated", "hero-images.ts"), output);

console.log(`Generated hero WebP variants at quality ${quality}.`);

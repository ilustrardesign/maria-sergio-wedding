import { readFile, stat } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import { giftImages } from "./gift-images";

describe("generated gift images", () => {
  it("has ordered, non-upscaled WebP variants for every JPEG gift", async () => {
    const sources = Object.values(giftImages);
    expect(sources).toHaveLength(25);
    for (const image of sources) {
      expect(image.variants.length).toBeGreaterThan(0);
      expect(image.variants.map((variant) => variant.width)).toEqual([...image.variants].sort((a, b) => a.width - b.width).map((variant) => variant.width));
      expect(image.variants.every((variant) => variant.width <= image.width)).toBe(true);
      for (const variant of image.variants) {
        const file = `public${variant.src}`;
        const info = await stat(file);
        expect(info.size).toBeGreaterThan(0);
        expect((await readFile(file)).subarray(0, 4).toString("ascii")).toBe("RIFF");
      }
    }
  });
});

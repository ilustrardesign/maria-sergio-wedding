import { readFile } from "node:fs/promises";
import { expect, test } from "vitest";

test("uses self-hosted Next fonts and preserves typography variables", async () => {
  const layout = await readFile("src/app/layout.tsx", "utf8");

  expect(layout).not.toContain("next/font/google");
  expect(layout).toContain("next/font/local");
  expect(layout).toContain('variable: "--font-cormorant"');
  expect(layout).toContain('variable: "--font-lora"');
  expect(layout).toContain('variable: "--font-script-face"');
});

test("documents local font origins and licenses", async () => {
  const licenses = await readFile("src/assets/fonts/LICENSES.md", "utf8");

  expect(licenses).toContain("Cormorant Garamond");
  expect(licenses).toContain("Lora");
  expect(licenses).toContain("Great Vibes");
  expect(licenses).toContain("SIL Open Font License");
});

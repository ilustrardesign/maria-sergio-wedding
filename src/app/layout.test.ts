import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/local", () => ({
  default: () => ({ variable: "--font-test" }),
}));

describe("root metadata", () => {
  it("uses production canonical URLs for social preview metadata", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");

    const { metadata } = await import("./layout");

    expect(metadata.metadataBase?.toString()).toBe("https://mariaesergio.com/");
    expect(metadata.title).toBe("Maria & Sérgio | 31.10.2026");
    expect(metadata.description).toBe("Nosso grande dia está chegando. Celebre conosco o casamento de Maria & Sérgio, em 31 de outubro de 2026.");
    expect(metadata.alternates?.canonical).toBe("https://mariaesergio.com");
    expect(metadata.openGraph?.url).toBe("https://mariaesergio.com");
    expect(metadata.openGraph?.images).toEqual([
      {
        alt: "Maria & Sérgio, 31 de outubro de 2026, Cabedelo, Paraíba.",
        height: 630,
        url: "/images/social/maria-sergio-og.jpg",
        width: 1200,
      },
    ]);
    const twitter = metadata.twitter as { card?: string; images?: string[] };
    expect(twitter.card).toBe("summary_large_image");
    expect(twitter.images).toEqual(["/images/social/maria-sergio-og.jpg"]);
  });
});

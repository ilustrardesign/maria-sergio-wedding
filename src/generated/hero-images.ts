export type HeroImageVariant = { width: number; height: number; src: string };
export type HeroImage = { src: string; srcSet: string; width: number; height: number; fallbackSrc: string; variants: HeroImageVariant[] };

export const heroImages = {
  "desktop": {
    "src": "/images/wedding/hero/generated/hero-desktop-1920.webp",
    "srcSet": "/images/wedding/hero/generated/hero-desktop-960.webp 960w, /images/wedding/hero/generated/hero-desktop-1280.webp 1280w, /images/wedding/hero/generated/hero-desktop-1600.webp 1600w, /images/wedding/hero/generated/hero-desktop-1920.webp 1920w",
    "width": 1935,
    "height": 1080,
    "fallbackSrc": "/images/wedding/hero/masters/hero-desktop.png",
    "variants": [
      {
        "width": 960,
        "height": 536,
        "src": "/images/wedding/hero/generated/hero-desktop-960.webp"
      },
      {
        "width": 1280,
        "height": 714,
        "src": "/images/wedding/hero/generated/hero-desktop-1280.webp"
      },
      {
        "width": 1600,
        "height": 893,
        "src": "/images/wedding/hero/generated/hero-desktop-1600.webp"
      },
      {
        "width": 1920,
        "height": 1072,
        "src": "/images/wedding/hero/generated/hero-desktop-1920.webp"
      }
    ]
  },
  "mobile": {
    "src": "/images/wedding/hero/generated/hero-mobile-1080.webp",
    "srcSet": "/images/wedding/hero/generated/hero-mobile-480.webp 480w, /images/wedding/hero/generated/hero-mobile-640.webp 640w, /images/wedding/hero/generated/hero-mobile-768.webp 768w, /images/wedding/hero/generated/hero-mobile-1080.webp 1080w",
    "width": 1440,
    "height": 1920,
    "fallbackSrc": "/images/wedding/hero/masters/hero-mobile.png",
    "variants": [
      {
        "width": 480,
        "height": 640,
        "src": "/images/wedding/hero/generated/hero-mobile-480.webp"
      },
      {
        "width": 640,
        "height": 853,
        "src": "/images/wedding/hero/generated/hero-mobile-640.webp"
      },
      {
        "width": 768,
        "height": 1024,
        "src": "/images/wedding/hero/generated/hero-mobile-768.webp"
      },
      {
        "width": 1080,
        "height": 1440,
        "src": "/images/wedding/hero/generated/hero-mobile-1080.webp"
      }
    ]
  }
} as const satisfies Record<"desktop" | "mobile", HeroImage>;

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Casamento de Maria e Sérgio",
    short_name: "Maria & Sérgio",
    description: "Convite de casamento de Maria e Sérgio — 31 de outubro de 2026.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f2e7",
    theme_color: "#747b55",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}

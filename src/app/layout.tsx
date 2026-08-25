import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { weddingContent } from "@/content/wedding";
import { CANONICAL_SITE_URL } from "@/lib/site";

import "./globals.css";

const cormorant = localFont({
  display: "swap",
  src: [
    { path: "../assets/fonts/cormorant-garamond-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../assets/fonts/cormorant-garamond-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-cormorant",
});

const lora = localFont({
  display: "swap",
  src: [
    { path: "../assets/fonts/lora-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/lora-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../assets/fonts/lora-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-lora",
});

const script = localFont({
  display: "swap",
  src: [{ path: "../assets/fonts/great-vibes-latin-400-normal.woff2", weight: "400", style: "normal" }],
  variable: "--font-script-face",
});

const canonicalUrl = weddingContent.metadata.canonicalUrl.value || CANONICAL_SITE_URL;
const metadataBase = new URL(canonicalUrl);
const socialImage = {
  url: weddingContent.metadata.openGraphImage,
  width: 1200,
  height: 630,
  alt: "Maria & Sérgio, 31 de outubro de 2026, Cabedelo, Paraíba.",
};

export const metadata: Metadata = {
  metadataBase,
  title: weddingContent.metadata.title,
  description: weddingContent.metadata.description,
  applicationName: "Maria & Sérgio",
  alternates: { canonical: canonicalUrl },
  icons: { icon: "/icon.png", apple: "/icon.png" },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: canonicalUrl,
    title: weddingContent.metadata.title,
    description: weddingContent.metadata.description,
    siteName: "Maria & Sérgio",
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: weddingContent.metadata.title,
    description: weddingContent.metadata.description,
    images: [socialImage.url],
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: weddingContent.metadata.themeColor,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={[cormorant.variable, lora.variable, script.variable].join(" ")} lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

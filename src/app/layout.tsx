import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { weddingContent } from "@/content/wedding";

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

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const metadataBase = new URL(configuredSiteUrl ?? "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase,
  title: weddingContent.metadata.title,
  description: weddingContent.metadata.description,
  applicationName: "Maria & Sérgio",
  alternates: configuredSiteUrl ? { canonical: configuredSiteUrl } : undefined,
  icons: { icon: "/icon.png", apple: "/icon.png" },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: weddingContent.metadata.title,
    description: weddingContent.metadata.description,
    siteName: "Maria & Sérgio",
    images: [{ url: weddingContent.metadata.openGraphImage, width: 1080, height: 1436, alt: weddingContent.assets.saveTheDate.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: weddingContent.metadata.title,
    description: weddingContent.metadata.description,
    images: [weddingContent.metadata.openGraphImage],
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

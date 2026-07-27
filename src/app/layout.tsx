import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Great_Vibes, Lora } from "next/font/google";

import { weddingContent } from "@/content/wedding";

import "./globals.css";

const cormorant = Cormorant_Garamond({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
});

const lora = Lora({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["400", "500", "600"],
});

const script = Great_Vibes({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-script-face",
  weight: "400",
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
    <html lang="pt-BR">
      <body className={[cormorant.variable, lora.variable, script.variable].join(" ")}>{children}</body>
    </html>
  );
}

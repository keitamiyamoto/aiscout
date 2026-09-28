import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: { default: BRAND.name, template: `%s | ${BRAND.shortName}` },
  description: BRAND.description,
  applicationName: BRAND.name,
  openGraph: { title: BRAND.name, description: BRAND.description, type: "website", locale: "ja_JP" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1b2a41",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="app-bg min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}

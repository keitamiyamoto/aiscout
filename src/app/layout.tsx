import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BRAND } from "@/lib/brand";
import { isPreviewMode } from "@/lib/preview";

export const metadata: Metadata = {
  title: { default: BRAND.name, template: `%s | ${BRAND.shortName}` },
  description: BRAND.description,
  applicationName: BRAND.name,
  openGraph: { title: BRAND.name, description: BRAND.description, type: "website", locale: "ja_JP" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a88d4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {isPreviewMode() && (
          <div className="bg-ink-900 px-4 py-1.5 text-center text-xs font-semibold text-sun-300">プレビュー版です。入力内容は保存されず、担当者からの連絡もありません。</div>
        )}
        {children}
      </body>
    </html>
  );
}

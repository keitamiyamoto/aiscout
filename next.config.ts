import type { NextConfig } from "next";

/**
 * SEO メディア「シゴトのものさし」(keitamiyamoto/AIcompany の site/、別の Vercel プロジェクト) を
 * ai-scouter.jp/media で配信する。メディア側も末尾スラッシュなしの URL で統一している。
 */
const MEDIA_ORIGIN = (process.env.MEDIA_ORIGIN || "https://shigoto-media.vercel.app").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    return [
      { source: "/media", destination: `${MEDIA_ORIGIN}/media` },
      { source: "/media/:path*", destination: `${MEDIA_ORIGIN}/media/:path*` },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;

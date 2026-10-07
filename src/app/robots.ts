import type { MetadataRoute } from "next";

/** SEO メディア (/media/) のサイトマップを検索エンジンに知らせる。診断結果・管理画面は各ページの metadata で noindex。 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/result/"] },
    sitemap: "https://ai-scouter.jp/media/sitemap-index.xml",
  };
}

import type { MetadataRoute } from "next";
import { HUB_HOST } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const allowedBots = [
    "Googlebot",
    "Googlebot-Image",
    "Bingbot",
    "Slurp",
    "DuckDuckBot",
    "Applebot",
    "Applebot-Extended",
    "Brave",
    "Yandex",
    "OAI-SearchBot",
    "ChatGPT-User",
    "Claude-SearchBot",
    "PerplexityBot",
    "Perplexity-User",
    "Amazonbot",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/system", "/_next/data/", "/cdn-cgi/"],
      },
      ...allowedBots.map((bot) => ({
        userAgent: bot,
        allow: "/",
      })),
    ],
    sitemap: `${HUB_HOST}/sitemap.xml`,
  };
}


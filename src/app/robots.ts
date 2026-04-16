import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://news-hub-iota-silk.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/author/",
        "/api/",
        "/profile/",
        "/forbidden",
        "/login",
        "/register",
        "/search-news",
        "/reset-password",
        "/forgot-password",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

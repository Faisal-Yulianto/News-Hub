import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const BASE_URL = "https://newshub.com";

type SitemapEntry = {
  url: string;
  lastModified?: Date | string;
  changefreq?: "yearly" | "monthly" | "weekly" | "daily" | "hourly" | "always" | "never";
  priority?: 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [news, categories] = await Promise.all([
    prisma.news.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.category.findMany({
      select: { slug: true },
    }),
  ]);

  const staticPages: SitemapEntry[] = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changefreq: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changefreq: "daily",
      priority: 0.5,
    },
  ];

  const categoryPages: SitemapEntry[] = categories.map((c) => ({
    url: `${BASE_URL}/category/${c.slug}`,
    lastModified: new Date(),
    changefreq: "daily",
    priority: 0.7,
  }));

  const newsPages: SitemapEntry[] = news.map((item) => ({
    url: `${BASE_URL}/news/${item.slug}`,
    lastModified: new Date(item.updatedAt),
    changefreq: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...newsPages];
}
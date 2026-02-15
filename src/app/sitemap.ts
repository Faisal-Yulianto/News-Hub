const BASE_URL = "https://newshub.com";

type SitemapEntry = {
  url: string;
  lastModified?: Date | string;
  changefreq?: "yearly" | "monthly" | "weekly" | "daily" | "hourly" | "always" | "never";
  priority?: 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
};

export default async function sitemap(): Promise<SitemapEntry[]> {

  const [newsRes, categoryRes] = await Promise.all([
    fetch(`${process.env.NEXTAUTH_URL}/api/sitemap?type=news`),
    fetch(`${process.env.NEXTAUTH_URL}/api/sitemap?type=categories`),
  ]);

  const newsData = await newsRes.json();
  const categoryData = await categoryRes.json();

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

  const categoryPages: SitemapEntry[] = categoryData.data
    .filter((c: { slug: string | null }) => c.slug)
    .map((c: { slug: string }) => ({
      url: `${BASE_URL}/category/${c.slug}`,
      lastModified: new Date(),
      changefreq: "daily" as const,
      priority: 0.7,
    }));

  const newsPages: SitemapEntry[] = newsData.data.map(
    (item: { slug: string; updatedAt: string }) => ({
      url: `${BASE_URL}/news/${item.slug}`,
      lastModified: new Date(item.updatedAt),
      changefreq: "weekly" as const,
      priority: 0.8,
    })
  );

  return [...staticPages, ...categoryPages, ...newsPages];
}
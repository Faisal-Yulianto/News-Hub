import { Metadata } from "next";
import SearchNews from "@/components/news/search-news";
import { getAllCategory } from "../action/category-action";
import Footer from "@/components/reusable/footer";

type PageProps = {
  searchParams: {
    page?: string;
    sort?: string;
    timeRange?: string;
    limit?: string;
    category?: string;
    q?: string;
  };
};

export type DropdownOption = {
  value: string;
  label: string;
  icon?: string;
};

async function fetchSearchNews(
  query: string,
  page: number,
  sort: string,
  timeRange: string,
  category: string,
  limit: number
) {
  const params = new URLSearchParams({
    page: String(page),
    sort,
    timeRange,
    limit: String(limit),
    ...(query && { q: query }),
    ...(category && { category }),
  });

  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/all-news?${params}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const query = searchParams.q ?? "";
  const page = Number(searchParams.page ?? 1);
  const category = searchParams.category ?? "";

  if (!query) {
    return {
      title: "Cari Berita | NewsHub",
      description:
        "Cari berita terkini dari NewsHub. Temukan artikel trending, breaking news, dan berita terbaru dari Indonesia dan dunia.",
      robots: { index: true, follow: true },
      alternates: {
        canonical: "https://newshub.com/search",
      },
    };
  }
  const data = await fetchSearchNews(query, page, "newest", "all", category, 10);
  const total = data?.total ?? 0;

  const categoryLabel = category ? ` di kategori ${category}` : "";

  const title =
    page > 1
      ? `"${query}"${categoryLabel} - Halaman ${page} | NewsHub`
      : `"${query}"${categoryLabel} - Hasil Pencarian | NewsHub`;

  const description =
    total > 0
      ? `Ditemukan ${total} hasil pencarian untuk "${query}"${categoryLabel} di NewsHub. Temukan berita terkini dan terbaru.`
      : `Tidak ditemukan hasil untuk "${query}"${categoryLabel} di NewsHub. Coba kata pencarian lain.`;

  const params = new URLSearchParams({ q: query });
  if (page > 1) params.set("page", String(page));
  if (category) params.set("category", category);
  const canonicalUrl = `https://newshub.com/search?${params.toString()}`;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: canonicalUrl,
      siteName: "NewsHub",
      title,
      description,
      images: [
        {
          url: "/og-home.jpg",
          width: 1200,
          height: 630,
          alt: `Pencarian "${query}" - NewsHub`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      site: "@newshub",
      title,
      description,
      images: { url: "/og-home.jpg" },
    },

    alternates: {
      canonical: canonicalUrl,
    },

    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const categoryFilter = await getAllCategory();
  const categoryOptions: DropdownOption[] = [
    ...categoryFilter.map((c) => ({
      value: c.slug ?? "",
      label: c.name,
      icon: c.icon ?? "mdi:tag",
    })),
  ];

  const page = Number(searchParams.page ?? 1);
  const sort = searchParams.sort ?? "newest";
  const category = searchParams.category ?? "";
  const query = searchParams.q ?? "";
  const timeRange = searchParams.timeRange ?? "all";

  return (
    <>
      {query && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SearchResultsPage",
              mainEntity: {
                "@type": "ItemList",
                name: `Hasil pencarian: ${query}`,
              },
            }),
          }}
        />
      )}

      <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white font-sans py-10 mt-25 lg:mt-40 md:mt-30">
        <div className="w-[95%] mx-auto dark:bg-[#1a1a1a] dark:text-white p-8 rounded-md shadow-[0_10px_20px_rgba(0,0,0,0.25)]">
          <SearchNews
            page={page}
            sort={sort}
            timeRange={timeRange}
            query={query}
            category={category}
            categoryOptions={categoryOptions}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
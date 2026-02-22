import { Metadata } from "next";
import CategoryNews from "@/components/news/category-news";
import Footer from "@/components/reusable/footer";
import { CategoryNewsItem } from "@/hooks/use-category-news";

type PageProps = {
  params: { slug: string };
  searchParams: {
    page?: string;
    sort?: string;
    timeRange?: string;
    limit?: string;
  };
};

async function fetchCategoryNews(
  category: string,
  page: number,
  sort: string,
  timeRange: string,
  limit: number
) {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/all-news?category=${category}&page=${page}&limit=${limit}&sort=${sort}&timeRange=${timeRange}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const page = Number(searchParams.page ?? 1);
  const sort = searchParams.sort ?? "newest";
  const timeRange = searchParams.timeRange ?? "all";
  const limit = Number(searchParams.limit ?? 10);

  const data = await fetchCategoryNews(params.slug, page, sort, timeRange, limit);

  if (!data?.categoryInfo) {
    return {
      title: "Kategori Tidak Ditemukan | NewsHub",
      robots: { index: false, follow: false },
    };
  }

  const categoryName = data.categoryInfo.name;
  const total = data.total;

  const title =
    page > 1
      ? `${categoryName} - Halaman ${page} | NewsHub`
      : `${categoryName} - Berita Terkini | NewsHub`;

  const description =
    page > 1
      ? `Halaman ${page} dari berita ${categoryName} di NewsHub. Temukan ${total} artikel terbaru.`
      : `Temukan ${total} artikel berita terkait ${categoryName} di NewsHub. Update terbaru setiap hari.`;

  const canonicalUrl =
    page === 1
      ? `https://newshub.com/category/${params.slug}`
      : `https://newshub.com/category/${params.slug}?page=${page}`;

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
          alt: `${categoryName} - NewsHub`,
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
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const category = params.slug;
  const page = Number(searchParams.page ?? 1);
  const sort = searchParams.sort ?? "newest";
  const timeRange = searchParams.timeRange ?? "all";
  const limit = Number(searchParams.limit ?? 10);

  const data = await fetchCategoryNews(category, page, sort, timeRange, limit);

  if (!data?.categoryInfo) {
    return (
      <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white font-sans py-10 mt-25 lg:mt-40 md:mt-30">
        <div className="w-[95%] mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold">Kategori tidak ditemukan</h1>
        </div>
      </main>
    );
  }

  const totalPages = data.totalPages;

  return (
    <>
      {page > 1 && (
        <link
          rel="prev"
          href={
            page === 2
              ? `/category/${category}`
              : `/category/${category}?page=${page - 1}`
          }
        />
      )}
      {page < totalPages && (
        <link rel="next" href={`/category/${category}?page=${page + 1}`} />
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${data.categoryInfo.name} - Berita Terkini`,
            numberOfItems: data.total,
            itemListElement: data.data.map((item: CategoryNewsItem, index: number) => ({
              "@type": "ListItem",
              position: (page - 1) * limit + index + 1,
              item: {
                "@type": "NewsArticle",
                headline: item.title,
                url: `https://newshub.com/news/${item.slug}`,
                image: item.thumbnailUrl,
                datePublished: item.publishedAt,
                author: { "@type": "Person", name: item.author.name },
              },
            })),
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://newshub.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: data.categoryInfo.name,
                item: `https://newshub.com/category/${data.categoryInfo.slug}`,
              },
            ],
          }),
        }}
      />

      <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white font-sans py-10 mt-25 lg:mt-40 md:mt-30">
        <div className="w-[95%] mx-auto dark:bg-[#1a1a1a] dark:text-white p-8 rounded-md shadow-[0_10px_20px_rgba(0,0,0,0.25)]">
          <CategoryNews
            category={category}
            page={page}
            sort={sort}
            timeRange={timeRange}
            initialData={data}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
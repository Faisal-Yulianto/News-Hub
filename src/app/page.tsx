import { Metadata } from "next";
import NewsSlider from "@/components/reusable/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icon } from "@iconify/react";
import PopulerNewsSection from "@/components/news/populer-news";
import BreakingNewsSection from "@/components/news/breaking-news";
import AllNewsSection from "@/components/news/all-news";
import Footer from "@/components/reusable/footer";

interface NewsItem {
  title: string;
  slug: string;
  thumbnailUrl: string;
  publishedAt: string;
  author: { name: string };
}

interface Props {
  searchParams: { page?: string };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  try {
    const page = parseInt(searchParams.page || "1");

    const metadataRes = await fetch(
      `${process.env.NEXTAUTH_URL}/api/news/metadata`,
      { next: { revalidate: 60 } }
    );
    const { latestBreaking, totalNews } = await metadataRes.json();

    const baseTitle = "NewsHub - Berita Terkini, Trending & Breaking News Indonesia";
    const baseDescription = `Portal berita terpercaya dengan ${totalNews?.toLocaleString() || "ribuan"} artikel.`;

    const dynamicTitle =
      page > 1
        ? `Semua Berita Halaman ${page} | NewsHub`
        : latestBreaking
        ? `${latestBreaking.title} | NewsHub`
        : baseTitle;

    const dynamicDescription =
      page > 1
        ? `Berita terkini halaman ${page} dari NewsHub. Temukan berita trending dan breaking news terbaru.`
        : latestBreaking?.excerpt || baseDescription;

    const ogImage = page === 1
      ? latestBreaking?.thumbnailUrl || "/og-home.jpg"
      : "/og-home.jpg";

    return {
      title: dynamicTitle,
      description: dynamicDescription,
      openGraph: {
        type: "website",
        locale: "id_ID",
        url: page === 1 ? "https://newshub.com" : `https://newshub.com?page=${page}`,
        siteName: "NewsHub",
        title: dynamicTitle,
        description: dynamicDescription,
        images: [{ url: ogImage, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        title: dynamicTitle,
        description: dynamicDescription,
        images: { url: ogImage },
      },
      alternates: {
        canonical: page === 1 ? "https://newshub.com" : `https://newshub.com?page=${page}`,
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
  } catch {
    return {
      title: "NewsHub - Berita Terkini Indonesia",
      description: "Portal berita terpercaya Indonesia",
    };
  }
}

export default async function Home({ searchParams }: Props) {
  const currentPage = parseInt(searchParams.page || "1");
  const [TrendingRes, PopulerRes, BreakingRes, AllNewsRes] = await Promise.all([
    fetch(`${process.env.NEXTAUTH_URL}/api/news?type=trending`, {
      next: { revalidate: 60 },
    }),
    fetch(`${process.env.NEXTAUTH_URL}/api/news?type=populer`, {
      next: { revalidate: 60 },
    }),
    fetch(`${process.env.NEXTAUTH_URL}/api/news?type=breaking`, {
      next: { revalidate: 30 },
    }),
    fetch(`${process.env.NEXTAUTH_URL}/api/news?page=${currentPage}&limit=20`, {
      next: { revalidate: 60 },
    }),
  ]);

  const trending = await TrendingRes.json();
  const populer = await PopulerRes.json();
  const breaking = await BreakingRes.json();
  const allNews = await AllNewsRes.json();

  const latestBreaking = breaking.data?.[0];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "NewsHub",
            url: "https://newshub.com",
            description: "Portal berita terpercaya untuk berita terkini dan breaking news Indonesia",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: "https://newshub.com/search?q={search_term_string}",
              },
              "query-input": "required name=search_term_string",
            },
            publisher: {
              "@type": "Organization",
              name: "NewsHub",
              logo: { "@type": "ImageObject", url: "https://newshub.com/logo.png" },
            },
          }),
        }}
      />
      {trending.data?.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "Trending News",
              numberOfItems: trending.data.length,
              itemListElement: trending.data.map((item: NewsItem, index: number) => ({
                "@type": "ListItem",
                position: index + 1,
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
      )}
      {latestBreaking && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsArticle",
              headline: latestBreaking.title,
              description: latestBreaking.excerpt,
              image: latestBreaking.thumbnailUrl,
              datePublished: latestBreaking.publishedAt,
              author: { "@type": "Person", name: latestBreaking.author.name },
              publisher: {
                "@type": "Organization",
                name: "NewsHub",
                logo: { "@type": "ImageObject", url: "https://newshub.com/logo.png" },
              },
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `https://newshub.com/news/${latestBreaking.slug}`,
              },
            }),
          }}
        />
      )}

      <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white font-sans py-10 mt-25 lg:mt-40 md:mt-30">
        <div className="w-[95%] mx-auto dark:bg-[#1a1a1a] dark:text-white p-8 rounded-md shadow-[0_10px_20px_rgba(0,0,0,0.25)]">
          <div className="flex flex-col lg:flex-row gap-6">
            <section className="w-full lg:w-2/3" aria-labelledby="trending-heading">
              <header className="border-b-2 dark:border-white p-2 font-extrabold text-lg">
                <div className="flex items-center gap-1">
                  <Icon icon="fluent:data-trending-16-filled" width="30" height="30" aria-hidden="true" />
                  <h2 id="trending-heading">Trending</h2>
                </div>
              </header>
              <NewsSlider initialData={trending} />
            </section>

            <aside className="w-full lg:w-1/3" aria-labelledby="popular-heading">
              <header className="border-b-2 dark:border-white p-2 font-extrabold text-lg">
                <div className="flex items-center gap-1">
                  <Icon icon="streamline-flex:trending-content-solid" width="30" height="30" aria-hidden="true" />
                  <h2 id="popular-heading">Populer</h2>
                </div>
              </header>
              <ScrollArea className="h-max lg:h-152 mt-8">
                <PopulerNewsSection initialData={populer} />
              </ScrollArea>
            </aside>
          </div>
          <section className="mt-5" aria-labelledby="breaking-heading">
            <header className="border-b-2 dark:border-white p-2 font-extrabold text-lg mb-8">
              <div className="flex items-center gap-1">
                <Icon icon="iconamoon:news-fill" width="30" height="30" aria-hidden="true" />
                <h2 id="breaking-heading">Breaking News</h2>
              </div>
            </header>
            <BreakingNewsSection initialData={breaking} />
          </section>
          <section className="mt-5" aria-labelledby="all-news-heading">
            <header className="border-b-2 dark:border-white p-2 font-extrabold text-lg mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Icon icon="emojione-monotone:newspaper" width="30" height="30" aria-hidden="true" />
                  <h2 id="all-news-heading">Semua Berita</h2>
                </div>
              </div>
            </header>
            <AllNewsSection initialData={allNews} initialPage={currentPage} />
          </section>
        </div>
      </main>
      <Footer/>
    </>
  );
}
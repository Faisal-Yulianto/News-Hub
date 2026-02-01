import { Metadata } from "next";
import HeroSection from "@/components/detail-news/detail-hero-section";
import { LikeButton } from "@/components/detail-news/reaction-button";
import Content from "@/components/detail-news/content-section";
import RelatedNews from "@/components/detail-news/related-news";
import { Icon } from "@iconify/react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import CommentSection from "@/components/comment/comments-section";
import Footer from "@/components/reusable/footer";

type PageProps = {
  params: { slug: string };
};

async function fetchDetailNews(slug: string) {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/news/${slug}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await fetchDetailNews(params.slug);

  if (!data) {
    return {
      title: "Berita Tidak Ditemukan | NewsHub",
      robots: { index: false, follow: false },
    };
  }

  const metaTitle = data.metaTitle || data.title;
  const metaDescription =
    data.metaDescription ||
    data.excerpt ||
    data.content?.replace(/<[^>]*>/g, "").substring(0, 160); 

  const publishedDate = data.publishedAt || data.createdAt;
  const modifiedDate = data.updatedAt;

  return {
    title: `${metaTitle} | NewsHub`,
    description: metaDescription,
    authors: data.author ? [{ name: data.author.name }] : [],
    publisher: "NewsHub",
    openGraph: {
      type: "article",
      locale: "id_ID",
      url: `https://newshub.com/news/${data.slug}`,
      siteName: "NewsHub",
      title: metaTitle,
      description: metaDescription,
      images: [
        {
          url: data.thumbnailUrl,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
      publishedTime: new Date(publishedDate).toISOString(),
      modifiedTime: new Date(modifiedDate).toISOString(),
      authors: data.author ? [data.author.name] : [],
      section: data.category?.name,
    },

    twitter: {
      card: "summary_large_image",
      site: "@newshub",
      title: metaTitle,
      description: metaDescription,
      images: [{ url: data.thumbnailUrl, alt: metaTitle }],
    },
    alternates: {
      canonical: `https://newshub.com/news/${data.slug}`,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    other: {
      "article:published_time": new Date(publishedDate).toISOString(),
      "article:modified_time": new Date(modifiedDate).toISOString(),
      "article:author": data.author?.name || "NewsHub",
      "article:section": data.category?.name || "",
    },
  };
}

export default async function DetailNews({ params }: PageProps) {
  const DetailNews = params.slug;
  const [res, RelatedRes] = await Promise.all([
    fetch(`${process.env.NEXTAUTH_URL}/api/news/${DetailNews}`, {
      next: { revalidate: 60 },
    }),
    fetch(`${process.env.NEXTAUTH_URL}/api/news/${DetailNews}/related`, {
      next: { revalidate: 60 },
    }),
  ]);

  if (!res.ok) {
    throw new Error("failed to fetch detail news");
  }

  const data = await res.json();
  const RelatedData = await RelatedRes.json();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: data.metaTitle || data.title,
            description: data.metaDescription || data.excerpt,
            image: data.thumbnailUrl,
            datePublished: data.publishedAt || data.createdAt,
            dateModified: data.updatedAt,
            author: {
              "@type": "Person",
              name: data.author?.name || "NewsHub",
            },
            publisher: {
              "@type": "Organization",
              name: "NewsHub",
              logo: {
                "@type": "ImageObject",
                url: "https://newshub.com/logo.png",
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://newshub.com/news/${data.slug}`,
            },
            articleSection: data.category?.name,
            wordCount: data.content?.replace(/<[^>]*>/g, "").split(/\s+/).length,
            interactionStatistic: [
              {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/ViewAction",
                userInteractionCount: data.views,
              },
              {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/LikeAction",
                userInteractionCount: data.likeCount,
              },
              {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/CommentAction",
                userInteractionCount: data.commentCount,
              },
            ],
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
              ...(data.category
                ? [
                    {
                      "@type": "ListItem",
                      position: 2,
                      name: data.category.name,
                      item: `https://newshub.com/category/${data.category.slug}`,
                    },
                  ]
                : []),
              {
                "@type": "ListItem",
                position: data.category ? 3 : 2,
                name: data.title,
                item: `https://newshub.com/news/${data.slug}`,
              },
            ],
          }),
        }}
      />

      <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white font-sans py-10 mt-25 lg:mt-40 md:mt-30">
        <div className="w-[95%] mx-auto dark:bg-[#1a1a1a] dark:text-white p-8 rounded-md shadow-[0_10px_20px_rgba(0,0,0,0.25)]">
          <HeroSection news={data} />
          <LikeButton slug={DetailNews} initialData={data} />
          <div className="flex flex-col lg:flex-row justify-between gap-8 mt-6">
            <div className="flex-1 lg:w-[60%]">
              <Content data={data} />
            </div>
            <aside className="w-full lg:w-[40%] flex-shrink-0">
              <div className="border-b-2 dark:border-white p-2 font-extrabold text-lg mb-4">
                <div className="flex items-center gap-1">
                  <Icon icon="mdi:newspaper" width="30" height="30" />
                  <h2>Berita terkait</h2> 
                </div>
              </div>
              <ScrollArea className="w-full lg:h-[1000px] overflow-x-auto lg:overflow-x-hidden overflow-y-hidden lg:overflow-y-auto">
                <RelatedNews data={RelatedData.data} />
                <ScrollBar
                  orientation="horizontal"
                  className="lg:hidden dark:bg-black bg-gray-300"
                />
              </ScrollArea>
            </aside>
          </div>
          <div className="border-b-2 dark:border-white p-2 font-extrabold text-lg my-4">
            <div className="flex items-center gap-1">
              <Icon icon="mingcute:comment-line" width="30" height="30" />
              <h2>Komentar</h2> 
            </div>
          </div>
          <CommentSection newsId={data.id} />
        </div>
      </main>
      <Footer />
    </>
  );
}
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

export default async function DetailNews({ params }: PageProps) {
  const DetailNews = params.slug;
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/news/${DetailNews}`,
    { next: { revalidate: 60 } },
  );
  if (!res.ok) {
    throw new Error("failed to fetch detail news");
  }
  const data = await res.json();

  const RelatedRes = await fetch(
    `${process.env.NEXTAUTH_URL}/api/news/${DetailNews}/related`,
    { next: { revalidate: 60 } },
  );
  if (!res.ok) {
    throw new Error("failed to fetch detail news");
  }
  const RelatedData = await RelatedRes.json();
  return (
    <>
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
                <p>Berita terkait</p>
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
            <p>Komentar</p>
          </div>
        </div>
        <CommentSection newsId={data.id} />
      </div>
    </main>
    <Footer/>
    </>
  );
}

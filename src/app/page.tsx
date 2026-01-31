import NewsSlider from "@/components/reusable/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icon } from "@iconify/react";
import PopulerNewsSection from "@/components/news/populer-news";
import BreakingNewsSection from "@/components/news/breaking-news";
import AllNewsSection from "@/components/news/all-news";
import Footer from "@/components/reusable/footer";

export default async function Home() {
  const TrendingRes = await fetch(
    `${process.env.NEXTAUTH_URL}/api/news?type=trending`,
    { next: { revalidate: 60 } }
  );
  const PopulerRes = await fetch(
    `${process.env.NEXTAUTH_URL}/api/news?type=populer`,
    { next: { revalidate: 60 } }
  );

  const trending = await TrendingRes.json();
  const populer = await PopulerRes.json();

  return (
    <>
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white font-sans py-10 mt-25 lg:mt-40 md:mt-30">
      <div className="w-[95%] mx-auto dark:bg-[#1a1a1a] dark:text-white p-8 rounded-md shadow-[0_10px_20px_rgba(0,0,0,0.25)]">
        <div className=" flex flex-col lg:flex-row gap-6 ">
          <div className="w-full lg:w-2/3">
            <div className="border-b-2 dark:border-white p-2 font-extrabold text-lg">
              <div className="flex items-center gap-1">
                <Icon
                  icon="fluent:data-trending-16-filled"
                  width="30"
                  height="30"
                />
                <p>Trending</p>
              </div>
            </div>
            <NewsSlider initialData={trending} />
          </div>
          <div className="w-full lg:w-1/3">
            <div className="border-b-2 dark:border-white p-2 font-extrabold text-lg">
              <div className="flex items-center gap-1">
                <Icon
                  icon="streamline-flex:trending-content-solid"
                  width="30"
                  height="30"
                />
                <p>Populer</p>
              </div>
            </div>
            <ScrollArea className="h-max lg:h-152 mt-8">
              <PopulerNewsSection initialData={populer} />
            </ScrollArea>
          </div>
        </div>
        <div className="border-b-2 dark:border-white p-2 font-extrabold text-lg mt-5 mb-8">
          <div className="flex items-center gap-1">
            <Icon icon="iconamoon:news-fill" width="30" height="30" />
            <p>Breaking News</p>
          </div>
        </div>
        <div>
          <BreakingNewsSection />
        </div>
        <div className="border-b-2 dark:border-white p-2 font-extrabold text-lg mt-5 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Icon icon="emojione-monotone:newspaper" width="30" height="30" />
              <p>Semua Berita</p>
            </div>
          </div>
        </div>
        <AllNewsSection />
      </div>
    </main>
      <Footer/>
    </>
  );
}

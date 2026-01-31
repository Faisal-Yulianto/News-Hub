import Image from "next/image";
import { extractDomain } from "@/lib/extract-domain";
import { formatDateTimeWIB } from "@/lib/time-helper";
import NewsViewTracker from "@/app/service/news-view-tracker";

export interface NewsDetail {
  id: number;
  slug: string;
  title: string;
  content: string;
  author: {
    name: string;
  };
  source?: string;
  publishedAt: string;
  contentImages: {
    id: number;
    url: string;
    caption: string;
  }[];
}

interface HeroSectionProps  {
  news: NewsDetail;
};

export default function HeroSection({ news }: HeroSectionProps) {
  return (
    <div className="m-auto">
      <div className="flex flex-col pb-5 gap-y-4">
        <h1 className="text-3xl font-bold text-center">
          {news.title}
        </h1>

        <div className="flex justify-center gap-x-1">
          <p className="text-sm text-gray-500 font-bold dark:text-white">
            {news.author.name}
          </p>
          {news.source && (
            <p className="text-sm font-bold">
              {" - " + extractDomain(news.source)}
            </p>
          )}
        </div>

        <p className="text-center text-[12px] text-gray-500 mt-[-12px]">
          {formatDateTimeWIB(news.publishedAt)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {news.contentImages.map((item) => (
          <div key={item.id}>
            <Image
              width={1000}
              height={700}
              src={item.url}
              alt={item.caption}
              priority
              className="rounded-md shadow-md shadow-black"
            />
            <p className="p-2 text-center text-gray-500 text-[12px]">
              Ilustrasi : {item.caption}
            </p>
          </div>
        ))}
      </div>

      <NewsViewTracker slug={news.slug} />
    </div>
  );
}


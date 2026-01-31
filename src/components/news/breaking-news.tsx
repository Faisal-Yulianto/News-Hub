"use client"

import UseBreakingNews from "@/hooks/use-breaking-news";
import { timeAgo } from "@/lib/time-helper";
import { Card } from "@/components/reusable/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BreakingNewsSection() {
  const { data, isLoading, ref } = UseBreakingNews();

  return (
    <section className="flex flex-wrap justify-center gap-x-2">
      {isLoading
        ? Array.from({ length: 10 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-[300] w-full lg:w-[49%] gap-2 mb-2"
            />
          ))
        : data?.data?.map((item) => (
            <div key={item.id} className="w-full lg:w-[49%]">
              <Card
                image={item.thumbnailUrl}
                title={item.title}
                desc={item.excerpt}
                time={timeAgo(item.publishedAt)}
                writer={item.author.name}
                url={`/news/${item.slug}`}
              />
            </div>
          ))}
      <div ref={ref} style={{ height: "1px" }} />
    </section>
  );
}

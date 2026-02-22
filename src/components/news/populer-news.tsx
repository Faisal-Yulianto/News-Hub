"use client";

import { UsePopulerNews, PopulerNewsProps } from "@/hooks/use-populer-news";
import { timeAgo } from "@/lib/time-helper";
import { Card } from "@/components/reusable/card";
import { SkeletonCard } from "../reusable/skleton-card";

export default function PopulerNewsSection({ initialData }: PopulerNewsProps) {
  const { data, isLoading } = UsePopulerNews({ initialData });

  return (
    <section className="grid">
      {isLoading
        ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
        : data?.data?.map((item) => (
            <Card
              key={item.id}
              image={item.thumbnailUrl}
              title={item.title}
              desc={item.excerpt}
              time={timeAgo(item.publishedAt)}
              writer={item.author.name}
              url={`/news/${item.slug}`}
            />
          ))}
    </section>
  );
}

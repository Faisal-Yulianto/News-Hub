"use client";

import { useMemo } from "react";
import useAllNewsInfinite from "@/hooks/use-all-news";
import useAutoFetchOnScroll from "@/hooks/auto-fetch-scroll";
import { CardContent } from "../reusable/card-content";
import { timeAgo } from "@/lib/time-helper";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOPagination } from "./all-news-pagination";
import { UseAllNewsProps } from "@/hooks/use-all-news";

export default function AllNewsSection({
  initialData,
  initialPage = 1,
}: UseAllNewsProps) {
  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } =
    useAllNewsInfinite({ initialData, initialPage });

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  const isEmpty = !isLoading && items.length === 0;

  const totalPages = useMemo(() => {
    const firstPage = data?.pages?.[0];
    if (!firstPage) return 1;
    return Math.ceil(firstPage.total / 20);
  }, [data?.pages]);

  const ref = useAutoFetchOnScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2">
        {isLoading &&
          Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-90 md:h-64 w-full lg:w-[49.0%]" />
          ))}

        {isEmpty && (
          <div className="w-full text-center py-10 text-muted-foreground text-sm">
            Tidak ada berita yang ditemukan.
          </div>
        )}

        {!isLoading &&
          items.map((item) => (
            <div key={item.id} className="w-full lg:w-[49.0%]">
              <CardContent
                image={item.thumbnailUrl}
                title={item.title}
                desc={item.excerpt}
                time={timeAgo(item.publishedAt)}
                writer={item.author.name}
                url={`/news/${item.slug}`}
              />
            </div>
          ))}

        {isFetchingNextPage && (
          <div className="w-full flex flex-wrap justify-center gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-90 md:h-64 w-full lg:w-[49.0%]" />
            ))}
          </div>
        )}

        <div ref={ref} style={{ height: 1 }} aria-hidden="true" />
      </div>

      <SEOPagination totalPages={totalPages} currentPage={initialPage} />
    </>
  );
}
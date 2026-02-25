"use client";

import { Icon } from "@iconify/react";
import { CardContent } from "../reusable/card-content";
import { timeAgo } from "@/lib/time-helper";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import useAllBookmarksNews from "@/hooks/use-all-bookmarks";
import useAutoFetchOnScroll from "@/hooks/auto-fetch-scroll";
import { UseAllBookmarksNewsProps } from "@/hooks/use-all-bookmarks";
import { SEOPagination } from "../news/all-news-pagination";

export function SaveNewsSection({
  initialData,
  initialPage = 1,
}: UseAllBookmarksNewsProps) {
  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } =
    useAllBookmarksNews({ initialData, initialPage });

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
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
    <section>
      <div className="border-b-2 dark:border-white p-2 font-extrabold text-lg mb-4 mt-10">
        <div className="flex items-center gap-1">
          <Icon icon="material-symbols:save-as" width="30" height="30" />
          <h2>Berita Tersimpan</h2>
        </div>
      </div>
      <div>
        <>
          <div className="flex flex-wrap justify-center gap-2">
            {isLoading &&
              Array.from({ length: 10 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-90 md:h-64 w-full lg:w-[49.0%]"
                />
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
                  <Skeleton
                    key={i}
                    className="h-90 md:h-64 w-full lg:w-[49.0%]"
                  />
                ))}
              </div>
            )}

            <div ref={ref} style={{ height: 1 }} aria-hidden="true" />
          </div>

          <SEOPagination totalPages={totalPages} currentPage={initialPage} />
        </>
      </div>
    </section>
  );
}

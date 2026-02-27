"use client";

import { Icon } from "@iconify/react";
import { CardContent } from "../reusable/card-content";
import { timeAgo } from "@/lib/time-helper";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useEffect } from "react";
import { useHistoryQuery } from "@/hooks/use-news-history";
import { useInView } from "react-intersection-observer";
import type {
  GroupedHistory,
  History,
  HistoryResponse,
} from "@/hooks/use-news-history";
import type { InfiniteData } from "@tanstack/react-query";
import DeleteHistory from "./delete-history";

export default function UserHistory() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useHistoryQuery();

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);
  const infiniteData = data as InfiniteData<HistoryResponse> | undefined;

  const mergedGroups: GroupedHistory | null = useMemo(() => {
    if (!infiniteData) return null;

    return infiniteData.pages.reduce<GroupedHistory>(
      (acc: GroupedHistory, page: HistoryResponse) => {
        acc.today.push(...page.data.today);
        acc.yesterday.push(...page.data.yesterday);
        acc.last7Days.push(...page.data.last7Days);
        acc.older.push(...page.data.older);
        return acc;
      },
      {
        today: [],
        yesterday: [],
        last7Days: [],
        older: [],
      },
    );
  }, [infiniteData]);

  const hasAnyData =
    mergedGroups &&
    (mergedGroups.today.length > 0 ||
      mergedGroups.yesterday.length > 0 ||
      mergedGroups.last7Days.length > 0 ||
      mergedGroups.older.length > 0);

  const labelMap: Record<keyof GroupedHistory, string> = {
    today: "Hari Ini",
    yesterday: "Kemarin",
    last7Days: "7 Hari Terakhir",
    older: "Lebih Lama",
  };

  return (
    <section>
      <div className="border-b-2 dark:border-white p-2 font-extrabold text-lg mb-4 mt-10">
        <div className="flex justify-between">
          <div className="flex items-center gap-1">
            <Icon icon="material-symbols:history" width="30" height="30" />
            <h2>History</h2>
          </div>
          <DeleteHistory />
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        {!isLoading && !hasAnyData && (
          <div className="w-full text-center py-10 text-muted-foreground text-sm">
            Belum ada berita yang kamu lihat.
          </div>
        )}
        {mergedGroups &&
          (Object.keys(mergedGroups) as (keyof GroupedHistory)[]).map(
            (groupKey) => {
              const items: History[] = mergedGroups[groupKey];
              if (!items.length) return null;

              return (
                <div key={groupKey}>
                  <h3 className="font-bold text-md mb-4 text-end mr-2">
                    {labelMap[groupKey]}
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                      <div key={item.id} className="w-full lg:w-[49%]">
                        <CardContent
                          image={item.news.thumbnailUrl}
                          title={item.news.title}
                          desc={item.news.excerpt}
                          time={timeAgo(item.news.publishedAt)}
                          writer={item.news.author.name}
                          url={`/news/${item.news.slug}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            },
          )}
        {isFetchingNextPage && (
          <div className="w-full flex flex-wrap justify-center gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-90 md:h-64 w-full lg:w-[49.0%]" />
            ))}
          </div>
        )}

        <div ref={ref} style={{ height: 1 }} />
      </div>
    </section>
  );
}

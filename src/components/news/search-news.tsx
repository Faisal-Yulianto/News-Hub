"use client";

import { CardContent } from "../reusable/card-content";
import { timeAgo } from "@/lib/time-helper";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchNews, UseSearchNewsParams } from "@/hooks/use-search-news";
import { SearchPagination } from "../reusable/nav-pagination";
import { Icon } from "@iconify/react";
import { CategoryFilter, Filter, Sorting } from "./filter";
import SearchBar from "../reusable/search-bar";

export default function SearchNews(props: UseSearchNewsParams) {
  const { data, isLoading } = useSearchNews(props);
  const items = data?.data ?? [];
  const isEmpty = !isLoading && items.length === 0;

  return (
    <section className="flex flex-wrap justify-center gap-2">
      <div className="border-b-2 dark:border-white p-2 font-extrabold text-lg w-full">
        <div className="flex justify-between">
          <div className="flex items-center gap-1">
            <Icon icon="mingcute:search-fill" width="30" height="30" />
            <p>Cari Berita</p>
          </div>
          <div className="hidden md:block">
            <div className="flex gap-x-0.5">
              <SearchBar />
              <CategoryFilter options={props.categoryOptions} />
              <Sorting />
              <Filter />
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4 block md:hidden w-full">
        <div className="flex flex-wrap justify-between">
          <div></div>
          <div className="flex flex-wrap gap-0.5">
            <SearchBar />
            <CategoryFilter options={props.categoryOptions} />
            <Sorting />
            <Filter />
          </div>
        </div>
      </div>
      {isLoading &&
        Array.from({ length: 4 }).map((_, i) => (
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

      {data?.totalPages && (
        <SearchPagination
          currentPage={props.page}
          sort={props.sort ?? ""}
          timeRange={props.timeRange ?? ""}
          totalPages={data.totalPages}
          category={props.category}
          query={props.query ?? ""}
        />
      )}
    </section>
  );
}

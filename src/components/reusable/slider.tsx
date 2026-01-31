"use client";

import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useState, useEffect } from "react";
import type { EmblaCarouselType } from "embla-carousel";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { timeAgo } from "@/lib/time-helper";
import { Skeleton } from "@/components/ui/skeleton";
import { UseTrendingNews,TrendingNewsProps } from "@/hooks/use-trending-news";

export default function NewsSlider({initialData}:TrendingNewsProps) {
  const { data, isLoading } = UseTrendingNews({initialData});
  const [api, setEmblaApi] = useState<EmblaCarouselType | null>(null);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => setSelected(api.selectedScrollSnap());
    api.on("select", onSelect);
    onSelect();

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <section className="w-full mx-auto mt-8">
      {isLoading ? (
        <div className="flex flex-col space-y-3 w-full">
          <Skeleton className="w-full rounded-md h-100 lg:h-150" />
          <Skeleton className="m-auto w-60 h-5" />
        </div>
      ) : (
        <>
          <Carousel
            plugins={[
              Autoplay({
                delay: 6500,
                stopOnInteraction: false,
              }),
            ]}
            opts={{
              loop: true,
              align: "start",
            }}
            className="w-full"
            setApi={(emblaApi) => setEmblaApi(emblaApi ?? null)}
          >
            <CarouselContent>
              {data?.data?.map((item, index) => (
                <CarouselItem
                  key={item.id}
                  className="relative flex h-100 lg:h-150 "
                >
                  <Link
                    href={`/news/${item.slug}`}
                    className="absolute bg-black/30 hover:bg-black/50 transition-colors duration-500 inset-0 "
                  >
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.title}
                      fill
                      className="object-cover -z-10"
                      priority={index === 0}
                      loading={index === 0 ? undefined : "lazy"}
                    />
                    <div className="absolute inset-0 flex flex-col  shadow-2xl justify-end p-6 text-white px-10 shadow-white/30">
                      <div className="flex items-center">
                        <h2 className="text-sm font-light">
                          {item.author.name}
                        </h2>
                        <Icon icon="mdi:dot" width="15" height="15" />
                        <h2 className="text-sm font-extralight">
                          {timeAgo(item.publishedAt)}
                        </h2>
                      </div>
                      <h2 className="text-xl font-semibold">{item.title}</h2>
                      <p className="text-sm line-clamp-2">{item.excerpt}</p>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 lg:left-5 p-5 z-40" />
            <CarouselNext className="right-2 lg:right-5 p-5 z-40" />
          </Carousel>
          <div className="flex justify-center gap-2 mt-3">
            {data?.data?.map((_, i) => (
              <button
                key={i}
                onClick={() => api?.scrollTo(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  selected === i ? "bg-amber-500" : "bg-gray-400"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

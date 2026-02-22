import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";

export interface CardProps {
  image: string;
  time: string;
  desc: string;
  title: string;
  writer: string;
  url: string;
}

export function CardContent({
  image,
  time,
  desc,
  title,
  writer,
  url,
}: CardProps) {
  return (
    <Link href={url} className="block group">
      <article className="flex flex-col md:flex-row gap-3 dark:bg-black/20 p-4 rounded-md shadow-sm shadow-black/50 transition-colors overflow-hidden">
        <div className="relative w-full h-64 md:h-52 md:w-2/5 lg:w-1/3 flex-shrink-0 overflow-hidden rounded-md">
          <Image
            alt={title}
            src={image}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 40vw, 33vw"
            loading="lazy"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>

        <div className="flex flex-col gap-2 min-w-0 w-full">
          <div className="flex items-center gap-1 text-sm font-extralight min-w-0 flex-nowrap">
            <p
              className="truncate max-w-[55%] hover:text-gray-600/90 dark:hover:text-gray-300/90 transition-colors"
              title={writer}
            >
              {writer}
            </p>

            <Icon
              icon="mdi:dot"
              width={14}
              height={14}
              className="flex-shrink-0 text-gray-500"
            />

            <p className="whitespace-nowrap hover:text-gray-600/90 dark:hover:text-gray-300/90 transition-colors">
              {time}
            </p>
          </div>

          <h2 className="font-semibold text-base leading-snug line-clamp-2 hover:text-gray-600/90 dark:hover:text-gray-300/90 transition-colors max-h-5 lg:max-h-screen">
            {title}
          </h2>

          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 hover:text-gray-600/90 dark:hover:text-gray-200 transition-colors">
            {desc}
          </p>
        </div>
      </article>
    </Link>
  );
}

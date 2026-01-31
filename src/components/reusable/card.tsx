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

export function Card({ image, time, desc, title, writer, url }: CardProps) {
  return (
    <Link href={url} className="group relative block h-[300] mb-2 rounded-md">
      <Image
        src={image}
        alt={title}
        fill
        className="object-cover rounded-md"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500 rounded-lg" />
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <div className="flex items-center">
          <h2 className="text-sm font-light">{writer}</h2>
          <Icon icon="mdi:dot" width="15" height="15" />
          <h2 className="text-sm font-extralight">{time}</h2>
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm line-clamp-2">{desc}</p>
      </div>
    </Link>
  );
}

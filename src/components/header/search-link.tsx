import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SearchLink() {
  const pathname = usePathname();
  if (pathname === "/search-news") return null;

  return (
    <Link href="/search-news">
      <div className="relative w-fit">
        <div className="absolute left-1 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-black dark:bg-white">
          <Icon
            icon="mingcute:search-fill"
            width="18"
            height="18"
            className="text-white dark:text-black"
          />
        </div>
        <input
          placeholder="Cari Berita..."
          className="p-2 pl-10 rounded-full border border-black/10 dark:border-white/30 text-sm font-extralight bg-white dark:bg-black/90 lg:w-50 md:w-30 sm:w-60"
        />
      </div>
    </Link>
  );
}

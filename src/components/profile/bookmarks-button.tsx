"use client";

import { useToggleBookmark } from "@/app/service/create-bookmarks";
import { useDetailNews, detailNewsItem } from "@/hooks/use-detail-news";
import { Icon } from "@iconify/react";

type Props = {
  newsId: string;
  slug: string;
};

export default function BookmarkButton({ newsId, slug }: Props) {
  const { data } = useDetailNews({
    slug,
    initialData: {} as detailNewsItem,
  });

  const { mutate, isPending } = useToggleBookmark(slug);

  const bookmarked = data?.isBookmarked ?? false;

  const handleClick = () => {
    if (isPending) return;
    mutate(newsId);
  };
  const buttonClass = `
    flex items-center justify-center
    gap-1 sm:gap-2
    px-3 sm:px-4
    py-1.5 sm:py-2
    text-sm sm:text-base
    font-medium
    rounded-md
    transition-all duration-200
    whitespace-nowrap
    ${bookmarked
      ? "bg-blue-500 text-white hover:bg-blue-600"
      : "bg-gray-200 text-black hover:bg-gray-300"
    }
    ${isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
  `;

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={buttonClass}
    >
      <Icon
        icon="stash:save-ribbon-solid"
        width={18}
        height={18}
        className="w-4 h-4 sm:w-5 sm:h-5"
      />
      {isPending
        ? "Loading..."
        : bookmarked
        ? "Tersimpan"
        : "Simpan"}
    </button>
  );
}
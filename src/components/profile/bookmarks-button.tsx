"use client";

import { useToggleBookmark } from "@/app/service/create-bookmarks";
import { useDetailNews,detailNewsItem } from "@/hooks/use-detail-news";
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

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
        bookmarked
          ? "bg-blue-500 text-white"
          : "bg-gray-200 text-black"
      } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <Icon
        icon="stash:save-ribbon-solid"
        width={18}
        height={18}
        fill={bookmarked ? "currentColor" : "none"}
      />

      {isPending
        ? "Loading..."
        : bookmarked
        ? "Tersimpan"
        : "Simpan"}
    </button>
  );
}
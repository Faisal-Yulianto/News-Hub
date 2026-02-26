"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reactNews } from "@/app/service/like-service";
import {
  useDetailNews,
  detailNewsProps,
  detailNewsItem,
} from "@/hooks/use-detail-news";
import BookmarkButton from "@/components/profile/bookmarks-button";
import { toast } from "sonner";

export function LikeButton({ slug, initialData }: detailNewsProps) {
  const ACTIVE_COLOR = "text-blue-600 cursor-pointer";
  const INACTIVE_COLOR = "text-gray-400 cursor-pointer";

  const [loadingType, setLoadingType] = useState<"like" | "dislike" | null>(null);

  const queryClient = useQueryClient();
  const { data } = useDetailNews({ slug, initialData });

  const mutation = useMutation({
    mutationFn: (type: "like" | "dislike") => {
      setLoadingType(type);
      return reactNews(type, { slug });
    },

    onSuccess: (res) => {
      queryClient.setQueryData(["detail-news", slug], (old: detailNewsItem) => {
        if (!old) return old;
        let likeCount = old.likeCount;
        let disLike = old.disLike;
        if (old.userReaction === "like") likeCount--;
        if (old.userReaction === "dislike") disLike--;
        if (res.userReaction === "like") likeCount++;
        if (res.userReaction === "dislike") disLike++;

        return {
          ...old,
          likeCount,
          disLike,
          userReaction: res.userReaction,
        };
      });
    },

    onSettled: () => {
      setLoadingType(null);
    },

    onError: (error: Error) => {
      if (error?.message === "Unauthorized") {
        toast(
          <div className="flex gap-2 items-center">
            <Icon icon="typcn:warning" width={30} />
            <span>Silakan login terlebih dahulu untuk berinteraksi</span>
          </div>
        );
        return;
      }

      toast("Terjadi kesalahan. Coba lagi.");
    },
  });

  if (!data) return null;

  const isLiked = data.userReaction === "like";
  const isDisliked = data.userReaction === "dislike";

  return (
    <div className="flex justify-center items-center gap-x-10 h-15 shadow-md shadow-black/20 rounded-md lg:w-2xl mx-auto">
      <div className="flex gap-2 items-center">
        <button
          disabled={mutation.isPending}
          onClick={() => mutation.mutate("like")}
        >
          {loadingType === "like" ? (
            <Icon
              icon="eos-icons:loading"
              width={24}
              className="text-blue-600"
            />
          ) : (
            <Icon
              icon="mdi:like"
              width={24}
              className={isLiked ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          )}
        </button>
        <p>{data.likeCount}</p>
      </div>
      <div className="flex gap-2 items-center">
        <button
          disabled={mutation.isPending}
          onClick={() => mutation.mutate("dislike")}
        >
          {loadingType === "dislike" ? (
            <Icon
              icon="eos-icons:loading"
              width={24}
              className="text-blue-600"
            />
          ) : (
            <Icon
              icon="mdi:dislike"
              width={24}
              className={isDisliked ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          )}
        </button>
        <p>{data.disLike}</p>
      </div>
      <div className="flex gap-2 items-center">
        <Icon
          icon="raphael:view"
          width={30}
          className="text-gray-400"
        />
        <p>{data.views}</p>
      </div>
      <div className="flex gap-2 items-center">
        <Icon
          icon="material-symbols:comment"
          width={24}
          className="text-gray-400"
        />
        <p>{data.commentCount}</p>
      </div>
      <BookmarkButton newsId={data.id} slug={data.slug} />
    </div>
  );
}
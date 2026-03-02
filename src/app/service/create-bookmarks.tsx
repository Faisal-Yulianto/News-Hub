"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Icon } from "@iconify/react";

export type ToggleBookmarkResponse = {
  success: boolean;
  bookmarked: boolean;
  message: string;
};

export async function toggleBookmark(
  newsId: string,
): Promise<ToggleBookmarkResponse> {
  const res = await fetch("/api/bookmarks", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newsId }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to toggle bookmark");
  }

  return data;
}

export function useToggleBookmark(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newsId: string) => toggleBookmark(newsId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-bookmarks-news"] });

      queryClient.invalidateQueries({ queryKey: ["detail-news", slug] });
    },
    onError: (error: Error) => {
      if (error?.message === "Unauthorized") {
        toast(
          <div className="flex gap-2 items-center">
            <Icon icon="typcn:warning" width={30} />
            <span>Silakan login terlebih dahulu untuk berinteraksi</span>
          </div>,
        );
        return;
      }

      toast("Terjadi kesalahan. Coba lagi.");
    },
  });
}

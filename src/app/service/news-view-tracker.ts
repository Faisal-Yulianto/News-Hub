"use client";

import { useEffect, useRef } from "react";
import { useMutation,useQueryClient } from "@tanstack/react-query";

type Props = {
  slug: string;
};

export default function NewsViewTracker({ slug }: Props) {
  const hasTracked = useRef(false);
    const queryClient = useQueryClient();

  const viewMutation = useMutation({
    mutationFn: async () => {
      await fetch(`/api/news/${slug}/view`, {
        method: "POST",
      });
    },
     onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["detail-news", slug],
      });
    },
  });

  useEffect(() => {
    if (!slug) return;
    if (hasTracked.current) return;

    hasTracked.current = true;
    viewMutation.mutate();
  }, [slug, viewMutation]);

  return null;
}

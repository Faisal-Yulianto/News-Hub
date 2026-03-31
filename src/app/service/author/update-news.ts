import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { NEWS_MANAGEMENT_QUERY_KEY } from "@/hooks/author/use-news-management";

export interface UpdateNewsPayload {
  title: string;
  excerpt: string;
  content: string;
  categoryId: string;
  thumbnailUrl: string;
  thumbnailHash: string;
  source: string;
  isBreaking: boolean;
  metaTitle?: string;
  metaDescription?: string;
  contentImages: { url: string; hash: string; caption?: string }[];
  status: "DRAFT" | "PENDING_REVIEW";
}

export async function updateNewsManagementService(
  id: string,
  data: UpdateNewsPayload,
): Promise<{ id: string; slug: string; status: string }> {
  const res = await fetch(`/api/author/news-management/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to update news");
  return json;
}

export function useUpdateNews(id: string, onSuccess?: (slug: string) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateNewsPayload) =>
      updateNewsManagementService(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: NEWS_MANAGEMENT_QUERY_KEY });
      toast.success(
        data.status === "DRAFT"
          ? "Draft berhasil disimpan"
          : "Berita berhasil dikirim untuk direview",
      );
      onSuccess?.(data.slug);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal mengupdate berita");
    },
  });
}

import { CreateNewsFormValues } from "@/lib/validation/add-news-validation";
import { CreatedNews } from "./create-thumbnail";
import { toast } from "sonner";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import { NEWS_MANAGEMENT_QUERY_KEY } from "@/hooks/author/use-news-management";

export async function createNewsService(
  data: CreateNewsFormValues,
): Promise<CreatedNews> {
  const res = await fetch("/api/author/create-news", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to create news");
  return json;
}

export function useCreateNews(onSuccess?: (slug: string) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNewsService,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: NEWS_MANAGEMENT_QUERY_KEY });
      toast.success(
        data.status === "DRAFT"
          ? "Berita berhasil disimpan sebagai draft"
          : "Berita berhasil dikirim untuk direview",
      );
      onSuccess?.(data.slug);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal membuat berita");
    },
  });
}

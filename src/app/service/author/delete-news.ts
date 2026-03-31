import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { NEWS_MANAGEMENT_QUERY_KEY } from "@/hooks/author/use-news-management";

export async function deleteNewsManagementService(id: string): Promise<void> {
  const res = await fetch(`/api/author/news-management/${id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to delete news");
}

export function useDeleteNews(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNewsManagementService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NEWS_MANAGEMENT_QUERY_KEY });
      toast.success("Berita berhasil dihapus");
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menghapus berita");
    },
  });
}

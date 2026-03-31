import { CreateNewsFormValues } from "@/lib/validation/add-news-validation";
import { CreatedNews } from "./create-thumbnail";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

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
  return useMutation({
    mutationFn: createNewsService,
    onSuccess: (data) => {
      toast.success(
        data.status === "DRAFT"
          ? "Berita berhasil disimpan sebagai draft"
          : "Berita berhasil dikirim untuk direview",
      );
      onSuccess?.(data.slug);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create news");
    },
  });
}

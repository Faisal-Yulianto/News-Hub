import { toast } from "sonner";
import { useMutation,useQueryClient } from "@tanstack/react-query";

export interface UploadImageResult {
  url: string;
  hash: string;
  fromCache: boolean;
}

export interface UploadContentImagesResult {
  images: UploadImageResult[];
}

export interface CreatedNews {
  id: string;
  slug: string;
  status: string;
}

export async function uploadThumbnailService(
  file: File,
): Promise<UploadImageResult> {
  const formData = new FormData();
  formData.append("thumbnail", file);

  const res = await fetch("/api/author/create-news/upload-thumbnail", {
    method: "POST",
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to upload thumbnail");
  return json;
}

export function useUploadThumbnail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: uploadThumbnailService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["author-create-news"] });
      toast.success("Thumbnail berhasil diupload");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to upload thumbnail");
    },
  });
}

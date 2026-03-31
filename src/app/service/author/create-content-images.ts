import { UploadImageResult } from "./create-thumbnail";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

export interface UploadContentImagesResult {
  images: UploadImageResult[];
}

export async function uploadContentImagesService(
  files: File[],
): Promise<UploadContentImagesResult> {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const res = await fetch("/api/author/create-news/upload-content-image", {
    method: "POST",
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to upload content images");
  return json;
}

export function useUploadContentImages() {
  return useMutation({
    mutationFn: uploadContentImagesService,
    onError: (err: Error) => {
      toast.error(err.message || "Failed to upload content images");
    },
  });
}

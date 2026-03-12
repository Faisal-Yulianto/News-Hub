import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateNewsStatusPayload {
  status: "PUBLISHED" | "REJECTED";
  rejectionReason?: string;
}

interface UseUpdateNewsStatusOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useUpdateNewsStatus(
  id: string,
  options?: UseUpdateNewsStatusOptions
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateNewsStatusPayload) => {
      const response = await fetch(`/api/admin/news/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? "Failed to update news status");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      queryClient.invalidateQueries({ queryKey: ["admin-news-detail", id] });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
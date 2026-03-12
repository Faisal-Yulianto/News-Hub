import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseDeleteNewsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useDeleteNews(options?: UseDeleteNewsOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/news/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? "Failed to delete news");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
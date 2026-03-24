import { useMutation,useQueryClient } from "@tanstack/react-query";
import { CATEGORIES_QUERY_KEY } from "./create-category";
import { toast } from "sonner";

export async function deleteCategoryService(
  id: string
): Promise<{ deletedNewsCount: number }> {
  const res = await fetch(`/api/author/categories/${id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to delete category");
  return json;
}

export function useDeleteCategory(onSuccess?: () => void) {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: deleteCategoryService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success("Category deleted successfully");
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete category");
    },
  });
}
 
import { CategoryFormValues } from "@/lib/validation/add-category-validation";
import { Category,CATEGORIES_QUERY_KEY } from "./create-category";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export async function updateCategoryService({
  id,
  data,
}: {
  id: string;
  data: CategoryFormValues;
}): Promise<Category> {
  const res = await fetch(`/api/author/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to update category");
  return json;
}

export function useUpdateCategory(onSuccess?: () => void) {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: updateCategoryService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success("Category updated successfully");
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update category");
    },
  });
}
import { CategoryFormValues } from "@/lib/validation/add-category-validation";
import { useMutation,useQueryClient, } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Category {
  id: string;
  name: string;
  slug: string | null;
  icon: string | null;
  newsCount: number;
  isOwner: boolean;
  createdAt: string;
}

export async function createCategoryService(data: CategoryFormValues): Promise<Category> {
  const res = await fetch("/api/author/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to create category");
  return json;
}
export const CATEGORIES_QUERY_KEY = ["author", "categories"];

export function useCreateCategory(onSuccess?: () => void) {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: createCategoryService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success("Category created successfully");
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create category");
    },
  });
}

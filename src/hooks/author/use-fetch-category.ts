import { Category,CATEGORIES_QUERY_KEY } from "@/app/service/author/create-category";
import { useQuery } from "@tanstack/react-query";

export async function fetchCategoriesService(): Promise<Category[]> {
  const res = await fetch("/api/author/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: fetchCategoriesService,
  });
}
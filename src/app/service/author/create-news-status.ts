import { useCreateNews } from "./create-news";
import { CreateNewsFormValues } from "@/lib/validation/add-news-validation";

export function useCreateNewsWithStatus(
  status: "DRAFT" | "PENDING_REVIEW",
  onSuccess?: (slug: string) => void,
) {
  const mutation = useCreateNews(onSuccess);

  const submit = (data: Omit<CreateNewsFormValues, "status">) => {
    mutation.mutate({ ...data, status });
  };

  return { ...mutation, submit };
}

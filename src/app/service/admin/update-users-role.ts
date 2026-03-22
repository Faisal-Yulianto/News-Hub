import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateUserRolePayload {
  role: "READER" | "AUTHOR";
}

interface UseUpdateUserRoleOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useUpdateUserRole(
  id: string,
  options?: UseUpdateUserRoleOptions
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateUserRolePayload) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? "Failed to update user role");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
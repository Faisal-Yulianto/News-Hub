"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal update profile");
      }

      return json;
    },

    onSuccess: (data) => {
      queryClient.setQueryData(["user-profile"], data.user);
      queryClient.invalidateQueries({
        queryKey: ["all-comment"],
      });
      toast.success("Profile berhasil diperbarui");
    },
  });
}

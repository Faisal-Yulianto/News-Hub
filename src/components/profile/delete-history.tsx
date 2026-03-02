"use client";

import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const deleteHistory = async () => {
  const response = await fetch("/api/history", {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete history");
  }

  return response.json();
};

export default function DeleteHistory() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: deleteHistory,

    onSuccess: () => {
      toast.success("History berhasil dihapus.");

      queryClient.invalidateQueries({
        queryKey: ["history"],
      });
    },

    onError: () => {
      toast.error("Gagal menghapus history. Silakan coba lagi.");
    },
  });

  const handleDelete = () => {
    const confirmed = confirm(
      "Apakah kamu yakin ingin menghapus semua history? Tindakan ini tidak dapat dibatalkan."
    );

    if (!confirmed) return;

    mutate();
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex gap-1 items-center">
        <Icon icon="tabler:trash" width="20" height="20" />
        <h2 className="text-[12px]">
          {isPending ? "Menghapus..." : "Hapus History"}
        </h2>
      </div>
    </button>
  );
}
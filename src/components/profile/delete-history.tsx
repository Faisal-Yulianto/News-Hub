import { toast } from "sonner";
import { Icon } from "@iconify/react";

export default function DeleteHistory() {
  return (
    <>
      <button
        className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        onClick={async () => {
          if (
            confirm(
              "Apakah kamu yakin ingin menghapus semua history? Tindakan ini tidak dapat dibatalkan.",
            )
          ) {
            try {
              const response = await fetch("/api/history", {
                method: "DELETE",
              });
              if (response.ok) {
                toast.success("History berhasil dihapus.");
              } else {
                toast.error("Gagal menghapus history. Silakan coba lagi.");
              }
            } catch (error) {
              console.error("Error deleting history:", error);
              toast.error(
                "Terjadi kesalahan saat menghapus history. Silakan coba lagi.",
              );
            }
          }
        }}
      >
        <div className="flex gap-1 items-center">
          <Icon icon="tabler:trash" width="20" height="20" />
          <h2 className="text-[12px]">Hapus History</h2>
        </div>
      </button>
    </>
  );
}

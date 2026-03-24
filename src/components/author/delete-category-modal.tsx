import { ShieldAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Category } from "@/app/service/author/create-category";

interface DeleteCategoryDialogProps {
  target: Category | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export function DeleteCategoryDialog({
  target,
  onClose,
  onConfirm,
  loading,
}: DeleteCategoryDialogProps) {
  return (
    <AlertDialog open={!!target} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus kategori</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                Apa anda yakin menghapus?{" "}
                <span className="font-semibold text-foreground">
                  {target?.name}
                </span>
                ?
              </p>
              {target && target.newsCount > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>
                    Kategori ini memiliki{" "}
                    <span className="font-semibold">
                      {target.newsCount} artikel berita
                      {target.newsCount > 1 ? "s" : ""}
                    </span>
                    Menghapusnya juga akan menghapus secara permanen semua
                    artikel berita terkait.
                  </p>
                </div>
              )}
              <p className="text-sm">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {loading ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

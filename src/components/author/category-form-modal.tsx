"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  categorySchema,
  CategoryFormValues,
} from "@/lib/validation/add-category-validation";

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormValues) => void;
  initial?: CategoryFormValues;
  loading: boolean;
}

function CategoryForm({
  onSubmit,
  onClose,
  initial,
  loading,
}: Omit<CategoryFormModalProps, "open">) {
  const isEditing = !!initial?.name;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initial ?? { name: "", icon: "" },
  });

  const iconValue = watch("icon") ?? "";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label htmlFor="cat-name">
          Nama <span className="text-destructive">*</span>
        </Label>
        <Input
          id="cat-name"
          placeholder="e.g. Technology"
          maxLength={50}
          disabled={loading}
          {...register("name")}
        />
        <div className="flex items-center justify-between">
          {errors.name ? (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-muted-foreground ml-auto">
            {watch("name")?.length ?? 0}/50
          </p>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cat-icon">Icon (Iconify)</Label>
        <div className="flex gap-2">
          <Input
            id="cat-icon"
            placeholder="e.g. material-symbols:folder-rounded"
            maxLength={100}
            disabled={loading}
            className="flex-1"
            {...register("icon")}
          />
          <div className="w-10 h-10 rounded-md border bg-muted flex items-center justify-center shrink-0">
            {iconValue.trim() ? (
              <Icon
                icon={iconValue.trim()}
                className="w-5 h-5 text-foreground"
              />
            ) : (
              <FolderOpen className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
        {errors.icon && (
          <p className="text-xs text-destructive">{errors.icon.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Format:{" "}
          <code className="bg-muted px-1 rounded">prefix:icon-name</code>.{" "}
          <a
            href="https://icon-sets.iconify.design"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            Cari icon
          </a>
        </p>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? "Menyimpan..."
            : isEditing
              ? "Simpan perubahan"
              : "Buat kategori"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CategoryFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  loading,
}: CategoryFormModalProps) {
  const isEditing = !!initial?.name;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Kategori" : "Buat kategori"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Perbarui Kategori nama dan icon."
              : "Buat kategori baru untuk artikel beritamu"}
          </DialogDescription>
        </DialogHeader>
        <CategoryForm
          key={open ? (initial?.name ?? "Buat") : "Tutup"}
          onSubmit={onSubmit}
          onClose={onClose}
          initial={initial}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, FolderOpen } from "lucide-react";
import { Category } from "@/app/service/author/create-category";
import { CategoryFormValues } from "@/lib/validation/add-category-validation";
import { CategoryCard } from "@/components/author/category-card";
import { CategoryCardSkeleton } from "@/components/author/category-card-skleton";
import { CategoryFormModal } from "@/components/author/category-form-modal";
import { DeleteCategoryDialog } from "@/components/author/delete-category-modal";
import { useCategories } from "@/hooks/author/use-fetch-category";
import { useCreateCategory } from "@/app/service/author/create-category";
import { useDeleteCategory } from "@/app/service/author/delete-category";
import { useUpdateCategory } from "@/app/service/author/update-category";

export default function AuthorCategoriesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useCategories();

  const createMutation = useCreateCategory(() => setFormOpen(false));
  const updateMutation = useUpdateCategory(() => setEditTarget(null));
  const deleteMutation = useDeleteCategory(() => setDeleteTarget(null));

  const handleCreate = (data: CategoryFormValues) =>
    createMutation.mutate(data);

  const handleUpdate = (data: CategoryFormValues) => {
    if (!editTarget) return;
    updateMutation.mutate({ id: editTarget.id, data });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kategori</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola kategori untuk artikel berita Anda.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="gap-2">
          <PlusIcon className="w-4 h-4" />
          Kategori Baru
        </Button>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderOpen className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">Belum ada kategori</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Buat kategori pertama Anda untuk mengatur artikel berita Anda.
          </p>
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <PlusIcon className="w-4 h-4" />
            Kategori Baru
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onEdit={(c) => setEditTarget(c)}
              onDelete={(c) => setDeleteTarget(c)}
            />
          ))}
        </div>
      )}
      <CategoryFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        loading={createMutation.isPending}
      />
      <CategoryFormModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdate}
        initial={
          editTarget
            ? { name: editTarget.name, icon: editTarget.icon ?? "" }
            : undefined
        }
        loading={updateMutation.isPending}
      />
      <DeleteCategoryDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

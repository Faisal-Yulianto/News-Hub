"use client";

import { CreateNewsForm } from "@/components/author/create-news-form";
import { useCategories } from "@/hooks/author/use-fetch-category";
import { Skeleton } from "@/components/ui/skeleton";

function FormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

export default function CreateNewsPage() {
  const { data: categories = [], isLoading } = useCategories();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Buat berita</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tulis dan publikasikan artikel berita Anda.
        </p>
      </div>
      {isLoading ? (
        <FormSkeleton />
      ) : (
        <CreateNewsForm categories={categories} />
      )}
    </div>
  );
}

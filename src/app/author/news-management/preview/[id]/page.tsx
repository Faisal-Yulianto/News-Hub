"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@iconify/react";
import DOMPurify from "dompurify";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useNewsManagementDetail } from "@/hooks/author/use-detail-news";
import { useDeleteNews } from "@/app/service/admin/delete-admin-news";

const STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  DRAFT: { label: "Draft", variant: "outline" },
  PENDING_REVIEW: { label: "Menunggu Review", variant: "secondary" },
  PUBLISHED: { label: "Dipublikasi", variant: "default" },
  REJECTED: { label: "Ditolak", variant: "destructive" },
};

function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AuthorNewsPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: news, isLoading, isError } = useNewsManagementDetail(id);
  const { mutate: deleteNews, isPending: isDeleting } = useDeleteNews({
    onSuccess: () => {
      router.push("/author/news-management");
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 w-full animate-pulse rounded bg-muted" />
        <div className="h-6 w-72 animate-pulse rounded bg-muted" />
        <div className="h-96 w-full animate-pulse rounded bg-muted" />
      </div>
    );
  }
  if (isError || !news) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Icon
          icon="solar:danger-triangle-linear"
          className="h-10 w-10 text-destructive"
        />
        <p className="text-sm text-destructive">Berita tidak ditemukan</p>
        <Button variant="outline" onClick={() => router.back()}>
          Kembali
        </Button>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[news.status] ?? {
    label: news.status,
    variant: "outline" as const,
  };
  const isDraft = news.status === "DRAFT";
  const isRejected = news.status === "REJECTED";
  const isPublished = news.status === "PUBLISHED";

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <Button
        variant="ghost"
        onClick={() => router.push("/author/news-management")}
        className="-ml-2"
      >
        <Icon icon="solar:arrow-left-linear" className="mr-1 h-4 w-4" />
        Kembali ke Manajemen Berita
      </Button>
      {news.thumbnailUrl && (
        <div className="overflow-hidden rounded-lg border w-full">
          <Image
            src={news.thumbnailUrl}
            alt={news.title}
            className="object-cover w-full h-full"
            width={800}
            height={400}
          />
        </div>
      )}
      <div className="space-y-3">
        <div className="flex flex-wrap items-start gap-2">
          <h1 className="flex-1 text-2xl font-bold leading-tight">
            {news.title}
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            {news.isBreaking && <Badge variant="destructive">Breaking</Badge>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {news.category.name}
          </span>
          <span>•</span>
          <span>{formatDate(news.publishedAt ?? news.createdAt)}</span>
          {news.source && (
            <>
              <span>•</span>
              <span>Sumber: {news.source}</span>
            </>
          )}
        </div>
        {isPublished && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Icon icon="solar:eye-linear" className="h-4 w-4" />
              {news.views.toLocaleString()} views
            </span>
            <span className="flex items-center gap-1.5">
              <Icon icon="solar:heart-linear" className="h-4 w-4" />
              {news.likeCount.toLocaleString()} likes
            </span>
            <span className="flex items-center gap-1.5">
              <Icon icon="solar:chat-line-linear" className="h-4 w-4" />
              {news.commentCount.toLocaleString()} comments
            </span>
          </div>
        )}
      </div>
      {news.contentImages.length > 0 && (
        <div
          className={`grid gap-3 ${
            news.contentImages.length === 1
              ? "grid-cols-1"
              : news.contentImages.length === 2
                ? "grid-cols-2"
                : "grid-cols-3"
          }`}
        >
          {news.contentImages.map((img) => (
            <div key={img.id} className="space-y-1.5">
              <div className="relative overflow-hidden rounded-lg border aspect-video bg-muted">
                <Image
                  src={img.url}
                  alt={img.caption ?? "Content image"}
                  fill
                  className="object-cover"
                />
              </div>
              {img.caption && (
                <p className="text-xs text-muted-foreground text-center">
                  {img.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      <div
        className="prose prose-neutral dark:prose-invert max-w-none rounded-lg border p-6"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(news.content),
        }}
      />
      {isRejected && news.rejectionReason && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Icon
              icon="solar:danger-triangle-linear"
              className="h-4 w-4 text-destructive"
            />
            <span className="text-sm font-medium text-destructive">
              Alasan Penolakan
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {news.rejectionReason}
          </p>
        </div>
      )}
      {(isDraft || isRejected) && (
        <div className="flex items-center justify-end gap-3 rounded-lg border p-4">
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Icon
              icon="solar:trash-bin-trash-linear"
              className="h-4 w-4"
            />
            Hapus
          </Button>
          {isDraft && (
            <Button asChild>
              <Link href={`/author/news-management/edit/${news.id}`}>
                <Icon icon="solar:pen-linear" className="h-4 w-4" />
                Edit Draft
              </Link>
            </Button>
          )}
        </div>
      )}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus berita?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Berita akan dihapus secara
              permanen dari database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteNews(news.id)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Icon
                  icon="solar:spinner-bold"
                  className="h-4 w-4 animate-spin"
                />
              ) : (
                <Icon icon="solar:trash-bin-trash-bold" className="h-4 w-4" />
              )}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

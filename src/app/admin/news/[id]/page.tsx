"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@iconify/react";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAdminNewsDetail } from "@/hooks/admin/use-admin-detail";
import { useUpdateNewsStatus } from "@/app/service/admin/update-status-news";
import { toast } from "sonner";
import Image from "next/image";

const STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
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

export default function AdminArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const { data: news, isLoading, isError } = useAdminNewsDetail(id);

  const { mutate: updateStatus, isPending } = useUpdateNewsStatus(id, {
    onSuccess: () => {
      toast.success(
        rejectOpen
          ? "Artikel berhasil ditolak"
          : "Artikel berhasil dipublikasi",
      );
      router.push("/admin/articles?status=PENDING_REVIEW");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const handleApprove = () => {
    updateStatus({ status: "PUBLISHED" });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      setReasonError("Alasan penolakan wajib diisi");
      return;
    }
    if (rejectionReason.trim().length < 10) {
      setReasonError("Alasan penolakan minimal 10 karakter");
      return;
    }
    setReasonError("");
    updateStatus({
      status: "REJECTED",
      rejectionReason: rejectionReason.trim(),
    });
    setRejectOpen(false);
  };

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
    variant: "outline",
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/news?status=PENDING_REVIEW")}
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
        <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
          <span className="font-medium text-foreground">
            {news.category.name}
          </span>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Avatar className="h-5 w-5">
              <AvatarImage src={news.author.avatar ?? ""} />
              <AvatarFallback className="text-xs">
                {news.author.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{news.author.name}</span>
          </div>
          <span>•</span>
          <span>{formatDate(news.publishedAt ?? news.createdAt)}</span>
        </div>
      </div>
      <div
        className="prose prose-neutral dark:prose-invert max-w-none rounded-lg border p-6"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(news.content),
        }}
      />
      {news.status === "REJECTED" && news.rejectionReason && (
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
      {news.status === "PENDING_REVIEW" && (
        <div className="flex items-center justify-end gap-3 rounded-lg border p-4">
          <Button
            variant="destructive"
            onClick={() => setRejectOpen(true)}
            disabled={isPending}
          >
            <Icon icon="solar:close-circle-linear" className="mr-1 h-4 w-4" />
            Tolak
          </Button>
          <Button onClick={handleApprove} disabled={isPending}>
            <Icon icon="solar:check-circle-linear" className="mr-1 h-4 w-4" />
            {isPending ? "Memproses..." : "Approve"}
          </Button>
        </div>
      )}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Artikel</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Berikan alasan penolakan untuk Berita{" "}
              <span className="font-medium text-foreground">{news.title}</span>.
              Alasan ini akan ditampilkan kepada author.
            </p>
            <Textarea
              placeholder="Contoh: Konten tidak sesuai pedoman penulisan NewsHub..."
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (reasonError) setReasonError("");
              }}
              rows={4}
            />
            {reasonError && (
              <p className="text-xs text-destructive">{reasonError}</p>
            )}
            <p className="text-right text-xs text-muted-foreground">
              {rejectionReason.length} karakter
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectOpen(false);
                setRejectionReason("");
                setReasonError("");
              }}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isPending}
            >
              {isPending ? "Memproses..." : "Tolak Artikel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

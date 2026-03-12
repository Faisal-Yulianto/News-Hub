"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Icon } from "@iconify/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminNews } from "@/hooks/admin/use-admin-news";
import { useDeleteNews } from "@/app/service/admin/delete-admin-news";
import { useDebounce } from "@/hooks/admin/use-debounce";
import { toast } from "sonner";
import Link from "next/link";

const STATUS_TABS = [
  { label: "Semua", value: "ALL" },
  { label: "Menunggu Review", value: "PENDING_REVIEW" },
  { label: "Dipublikasi", value: "PUBLISHED" },
  { label: "Ditolak", value: "REJECTED" },
];

function StatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    }
  > = {
    PENDING_REVIEW: { label: "Menunggu Review", variant: "secondary" },
    PUBLISHED: { label: "Dipublikasi", variant: "default" },
    REJECTED: { label: "Ditolak", variant: "destructive" },
    DRAFT: { label: "Draft", variant: "outline" },
  };
  const { label, variant } = config[status] ?? {
    label: status,
    variant: "outline",
  };
  return <Badge variant={variant}>{label}</Badge>;
}
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminArticlesPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState(
    searchParams.get("status") ?? "PENDING_REVIEW",
  );
  const [page, setPage] = useState(parseInt(searchParams.get("page") ?? "1"));
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isError } = useAdminNews({
    status,
    page,
    search: debouncedSearch,
  });

  const { mutate: deleteNews, isPending: isDeleting } = useDeleteNews({
    onSuccess: () => {
      toast.success("Artikel berhasil dihapus");
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(error.message);
      setDeleteId(null);
    },
  });
  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setPage(1);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Icon
          icon="pixel:product-management"
          className="h-7 w-7 text-primary"
        />
        <h1 className="text-2xl font-bold">Manajemen Berita</h1>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <Button
              key={tab.value}
              variant={status === tab.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange(tab.value)}
            >
              {tab.label}
              {status === tab.value && data?.pagination.total !== undefined && (
                <span className="ml-2 rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-xs">
                  {data.pagination.total}
                </span>
              )}
            </Button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Icon
            icon="solar:magnifer-linear"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Cari judul berita..."
            className="pl-9"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="text-center">
              <TableHead className="w-[35%] text-center">Judul</TableHead>
              <TableHead className="text-center">Author</TableHead>
              <TableHead className="text-center">Kategori</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Breaking</TableHead>
              <TableHead className="text-center">Tanggal</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {isError && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-destructive py-8"
                >
                  Gagal memuat data artikel
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Icon
                      icon="solar:document-text-linear"
                      className="h-10 w-10"
                    />
                    <p className="text-sm">Tidak ada berita ditemukan</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              !isError &&
              data?.data.map((news) => (
                <TableRow key={news.id}>
                  <TableCell className="font-medium">
                    <span className="line-clamp-2 text-center">{news.title}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 justify-center">
                      {news.author.avatar && (
                        <Image
                          src={news.author.avatar}
                          alt={news.author.name}
                          width={24}
                          height={24}
                          className="rounded-full object-cover"
                        />
                      )}
                      <span className="text-sm line-clamp-1">{news.author.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-sm">{news.category.name}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusBadge status={news.status} />
                  </TableCell>
                  <TableCell className="text-center">
                    {news.isBreaking ? (
                      <Badge variant="destructive" className="gap-1">
                        <Icon icon="solar:fire-bold" className="h-3 w-3" />
                        Breaking
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground text-center">
                    {formatDate(news.publishedAt ?? news.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-center gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/news/${news.id}`}>
                          <Icon
                            icon="solar:eye-linear"
                            className="mr-1 h-4 w-4"
                          />
                          Review
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteId(news.id)}
                      >
                        <Icon
                          icon="solar:trash-bin-trash-linear"
                          className="h-4 w-4"
                        />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      {!isLoading && data && data.pagination.totalPages > 0 && (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan{" "}
            <span className="font-medium text-foreground">
              {(page - 1) * data.pagination.limit + 1}–
              {Math.min(page * data.pagination.limit, data.pagination.total)}
            </span>{" "}
            dari{" "}
            <span className="font-medium text-foreground">
              {data.pagination.total}
            </span>{" "}
            berita
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              <Icon icon="solar:arrow-left-linear" className="h-4 w-4" />
            </Button>
            {Array.from({ length: data.pagination.totalPages }).map((_, i) => (
              <Button
                key={i + 1}
                variant={page === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === data.pagination.totalPages}
            >
              <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
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
              onClick={() => deleteId && deleteNews(deleteId)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Icon
                  icon="solar:spinner-bold"
                  className="mr-2 h-4 w-4 animate-spin"
                />
              ) : (
                <Icon
                  icon="solar:trash-bin-trash-bold"
                  className="mr-2 h-4 w-4"
                />
              )}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TopArticle {
  id: string;
  title: string;
  slug: string;
  views: number;
  likeCount: number;
  commentCount: number;
  status: string;
  publishedAt: string | null;
  category: {
    name: string;
  };
}

interface AuthorTopArticlesProps {
  data: TopArticle[];
}

const statusBadgeVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "outline",
  PENDING_REVIEW: "secondary",
  PUBLISHED: "default",
  REJECTED: "destructive",
};

const statusLabel: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Menunggu Review",
  PUBLISHED: "Dipublikasi",
  REJECTED: "Ditolak",
};

export function AuthorTopArticles({ data }: AuthorTopArticlesProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🔥 Artikel Terpopuler Anda</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Belum ada data artikel</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔥 Artikel Terpopuler Anda</CardTitle>
        <p className="text-xs text-muted-foreground">Berdasarkan jumlah views</p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Views</TableHead>
              <TableHead className="text-center">Likes</TableHead>
              <TableHead className="text-center">Comments</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((article, index) => (
              <TableRow key={article.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/author/news-management/preview/${article.id}`}
                    className="hover:underline flex items-center gap-2"
                  >
                    {index === 0 && <Badge variant="default">#1</Badge>}
                    {article.title.length > 50
                      ? article.title.slice(0, 50) + "..."
                      : article.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{article.category.name}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant[article.status]}>
                    {statusLabel[article.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Icon icon="solar:eye-linear" className="h-3 w-3" />
                    {article.views.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Icon icon="solar:heart-linear" className="h-3 w-3 text-red-500" />
                    {article.likeCount.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Icon icon="solar:chat-line-linear" className="h-3 w-3 text-blue-500" />
                    {article.commentCount.toLocaleString()}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
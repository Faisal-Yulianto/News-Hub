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
  category: {
    name: string;
    slug: string;
  };
  author: {
    name: string;
  };
}

interface TopArticlesTableProps {
  data: TopArticle[];
}

export function TopArticlesTable({ data }: TopArticlesTableProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🔥 Top Articles (30 Hari Terakhir)</CardTitle>
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
        <CardTitle>🔥 Top Articles (30 Hari Terakhir)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Kategori</TableHead>
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
                    href={`/admin/news/${article.id}`}
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
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Icon icon="solar:eye-linear" className="h-3 w-3" />
                    {article.views}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Icon icon="solar:heart-linear" className="h-3 w-3 text-red-500" />
                    {article.likeCount}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Icon icon="solar:chat-line-linear" className="h-3 w-3 text-blue-500" />
                    {article.commentCount}
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
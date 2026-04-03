"use client";

import { Icon } from "@iconify/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthorPerformance {
  name: string;
  avatar: string | null;
  articleCount: number;
  totalViews: number;
  totalLikes: number;
  avgViewsPerArticle: number;
}

interface AuthorLeaderboardProps {
  data: AuthorPerformance[];
}

export function AuthorLeaderboard({ data }: AuthorLeaderboardProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🏆 Leaderboard Author</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Belum ada data author</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🏆 Leaderboard Author (30 Hari Terakhir)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Author</TableHead>
              <TableHead className="text-center">Artikel</TableHead>
              <TableHead className="text-center">Total Views</TableHead>
              <TableHead className="text-center">Rata-rata Views</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((author, index) => (
              <TableRow key={author.name}>
                <TableCell>
                  <div className="flex items-center justify-start">
                    {index === 0 && (
                      <Icon icon="solar:trophy-bold" className="h-4 w-4 text-yellow-500" />
                    )}
                    <Avatar>
                      <AvatarImage src={author.avatar ?? undefined} />
                      <AvatarFallback>
                        {author.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium ml-2">{author.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">{author.articleCount}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Icon icon="solar:eye-linear" className="h-3 w-3" />
                    {author.totalViews.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {author.avgViewsPerArticle.toFixed(1)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
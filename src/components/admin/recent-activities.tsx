"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RecentActivity {
  id: string;
  type: "PUBLISH" | "COMMENT" | "LIKE";
  message: string;
  link: string;
  timestamp: string;
  user: {
    name: string;
    avatar: string | null;
  };
}

interface RecentActivitiesProps {
  data: RecentActivity[];
}

function getActivityIcon(type: string) {
  switch (type) {
    case "PUBLISH":
      return <Icon icon="solar:document-add-bold" className="h-4 w-4 text-green-500" />;
    case "COMMENT":
      return <Icon icon="solar:chat-round-dots-bold" className="h-4 w-4 text-blue-500" />;
    case "LIKE":
      return <Icon icon="solar:heart-bold" className="h-4 w-4 text-red-500" />;
    default:
      return <Icon icon="solar:bell-bing-bold" className="h-4 w-4" />;
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString("id-ID");
}

export function RecentActivities({ data }: RecentActivitiesProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🔔 Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Belum ada aktivitas terbaru</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔔 Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((activity) => (
          <Link
            key={activity.id}
            href={activity.link}
            className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={activity.user.avatar ?? undefined} />
              <AvatarFallback>
                {activity.user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm">
                <span className="font-medium">{activity.user.name}</span>{" "}
                {activity.message.replace(activity.user.name, "").trim()}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {getActivityIcon(activity.type)}
                <span>{formatRelativeTime(new Date(activity.timestamp))}</span>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface UserBreakdownData {
  loginVisits: number;
  nonLoginVisits: number;
  totalVisits: number;
  loginPercentage: number;
  nonLoginPercentage: number;
}

interface UserBreakdownProps {
  data: UserBreakdownData;
}

export function UserBreakdown({ data }: UserBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>👥 Pengunjung (30 Hari Terakhir)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Login Users</span>
            <span>{data.loginPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={data.loginPercentage} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Non-login Users</span>
            <span>{data.nonLoginPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={data.nonLoginPercentage} className="h-2" />
        </div>
        <div className="pt-2 text-center text-sm text-muted-foreground">
          Total {data.totalVisits.toLocaleString()} kunjungan
        </div>
      </CardContent>
    </Card>
  );
}
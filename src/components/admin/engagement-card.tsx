"use client";

import { Icon } from "@iconify/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EngagementMetrics {
  totalLikes: number;
  totalComments: number;
}

interface EngagementCardsProps {
  data: EngagementMetrics;
}

export function EngagementCards({ data }: EngagementCardsProps) {
  const cards = [
    {
      title: "Total Likes",
      value: data.totalLikes,
      icon: "solar:heart-bold",
      color: "text-red-500",
      description:
        "Like dari seluruh artikel yang dipublikasi dalam 30 hari terakhir",
    },
    {
      title: "Total Comments",
      value: data.totalComments,
      icon: "solar:chat-round-bold",
      color: "text-blue-500",
      description: "Komentar yang dibuat dalam 30 hari terakhir",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              {card.title}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Icon
                      icon="solar:info-circle-linear"
                      className="h-3 w-3 text-muted-foreground"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{card.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
            <Icon icon={card.icon} className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {card.value.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

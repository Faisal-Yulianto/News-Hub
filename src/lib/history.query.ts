import { Prisma } from "@prisma/client";

export const historyWithNewsArgs =
  Prisma.validator<Prisma.HistoryFindManyArgs>()({
    include: {
      news: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
          createdAt: true,
        },
      },
    },
  });

export type HistoryWithNews =
  Prisma.HistoryGetPayload<typeof historyWithNewsArgs>;

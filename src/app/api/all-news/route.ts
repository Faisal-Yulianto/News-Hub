import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const MAX_LIMIT = 20;
const MAX_PAGE = 100;

type SortKey = "newest" | "oldest" | "views" | "likes" | "comments";
type SortDirection = "asc" | "desc";

function sanitizeSearch(q: string) {
  const cleaned = q
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length < 2 || cleaned.split(" ").length > 5) {
    return null;
  }

  return cleaned;
}

function getDateRange(timeRange: string) {
  const now = new Date();
  const ranges: Record<string, number> = {
    week: 7,
    month: 30,
    year: 365,
  };

  if (!ranges[timeRange]) return null;

  const start = new Date(now);
  start.setDate(start.getDate() - ranges[timeRange]);

  return { start, now };
}

function resolveSort(sort?: string): {
  key: SortKey;
  direction: SortDirection;
} {
  if (!sort) return { key: "newest", direction: "desc" };

  if (sort === "oldest") {
    return { key: "oldest", direction: "asc" };
  }

  const [key, direction] = sort.split("-");

  if (key === "newest") {
    return { key: "newest", direction: "desc" };
  }

  if (["views", "likes", "comments"].includes(key)) {
    return {
      key: key as SortKey,
      direction: direction === "asc" ? "asc" : "desc",
    };
  }

  return { key: "newest", direction: "desc" };
}


const SORT_SQL: Record<SortKey, Prisma.Sql> = {
  newest: Prisma.sql`n."publishedAt" DESC`,
  oldest: Prisma.sql`n."publishedAt" ASC`,
  views: Prisma.sql`n.views DESC`,
  likes: Prisma.sql`n."likeCount" DESC`,
  comments: Prisma.sql`n."commentCount" DESC`,
};


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const rawQ = searchParams.get("q");
  const category = searchParams.get("category");
  const { key: sortKey,direction} = resolveSort(searchParams.get("sort") || undefined);
  const timeRange = searchParams.get("timeRange") || "all";

  const page = Math.min(
    Math.max(Number(searchParams.get("page") || 1), 1),
    MAX_PAGE
  );

  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") || 10), 1),
    MAX_LIMIT
  );

const offset = (page - 1) * limit;
const dateRange = getDateRange(timeRange);
const safeQuery = rawQ ? sanitizeSearch(rawQ) : null;

function buildOrderBy(
  key: SortKey,
  direction: SortDirection
): Prisma.NewsOrderByWithRelationInput[] {
  switch (key) {
    case "views":
      return [{ views: direction }, { publishedAt: "desc" }];
    case "likes":
      return [{ likeCount: direction }, { publishedAt: "desc" }];
    case "comments":
      return [{ commentCount: direction }, { publishedAt: "desc" }];
    case "oldest":
      return [{ publishedAt: "asc" }];
    default:
      return [{ publishedAt: "desc" }];
  }
}

if (!safeQuery) {
  const where: Prisma.NewsWhereInput = {
    status: "PUBLISHED",
    ...(category && { category: { slug: category } }),
    ...(dateRange && {
      publishedAt: {
        gte: dateRange.start,
        lte: dateRange.now,
      },
    }),
  };

  const [data, total, categoryInfo] = await Promise.all([
      prisma.news.findMany({
        where,
        orderBy: buildOrderBy(sortKey, direction),
        skip: offset,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          thumbnailUrl: true,
          publishedAt: true,
          views: true,
          likeCount: true,
          commentCount: true,
          author: { select: { name: true } },
          category: { select: { name: true, icon: true } },
        },
      }),
      prisma.news.count({ where }),
      category
        ? prisma.category.findUnique({
            where: { slug: category },
            select: { name: true, slug: true },
          })
        : null,
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data,
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
      nextPage: page < totalPages ? page + 1 : null,
      categoryInfo, 
    });
  }


  const tsQuery = Prisma.sql`plainto_tsquery('simple', ${safeQuery})`;

  const categoryFilter = category
    ? Prisma.sql`c.slug = ${category}`
    : Prisma.sql`TRUE`;

  const dateFilter = dateRange?.start
    ? Prisma.sql`n."publishedAt" BETWEEN ${dateRange.start} AND ${dateRange.now}`
    : Prisma.sql`TRUE`;

  const data = await prisma.$queryRaw<
    {
      id: string;
      title: string;
      slug: string;
      excerpt: string;
      thumbnailUrl: string;
      publishedAt: Date;
      views: number;
      likeCount: number;
      commentCount: number;
      authorName: string;
      rank: number;
    }[]
  >`
  SELECT
    n.id,
    n.title,
    n.slug,
    n.excerpt,
    n."thumbnailUrl",
    n."publishedAt",
    n.views,
    n."likeCount",
    n."commentCount",
    u.name AS "authorName",
    ts_rank(
      setweight(to_tsvector('simple', n.title), 'A') ||
      setweight(to_tsvector('simple', n.excerpt), 'B') ||
      setweight(to_tsvector('simple', n.content), 'C'),
      ${tsQuery}
    ) AS rank
  FROM "News" n
  JOIN "User" u ON u.id = n."authorId"
  LEFT JOIN "Category" c ON c.id = n."categoryId"
  WHERE
    n.status = 'PUBLISHED'
    AND (
      setweight(to_tsvector('simple', n.title), 'A') ||
      setweight(to_tsvector('simple', n.excerpt), 'B') ||
      setweight(to_tsvector('simple', n.content), 'C')
    ) @@ ${tsQuery}
    AND ${categoryFilter}
    AND ${dateFilter}
  ORDER BY
    rank DESC,
    ${SORT_SQL[sortKey]},
    n."publishedAt" DESC
  LIMIT ${limit} OFFSET ${offset};
`;

  const countResult = await prisma.$queryRaw<{ count: bigint }[]>`
  SELECT COUNT(*)::bigint AS count
  FROM "News" n
  LEFT JOIN "Category" c ON c.id = n."categoryId"
  WHERE
    n.status = 'PUBLISHED'
    AND (
      setweight(to_tsvector('simple', n.title), 'A') ||
      setweight(to_tsvector('simple', n.excerpt), 'B') ||
      setweight(to_tsvector('simple', n.content), 'C')
    ) @@ ${tsQuery}
    AND ${categoryFilter};
`;

  const total = Number(countResult[0]?.count ?? 0);
  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({
    data: data.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      thumbnailUrl: item.thumbnailUrl,
      publishedAt: item.publishedAt,
      views: item.views,
      likeCount: item.likeCount,
      commentCount: item.commentCount,
      author: { name: item.authorName },
      rank: item.rank,
    })),
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
    nextPage: page < totalPages ? page + 1 : null,
  });
}

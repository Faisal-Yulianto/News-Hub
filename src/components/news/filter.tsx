import { DropdownSelect } from "@/components/reusable/dropdown-select";
import { useRouter, useSearchParams } from "next/navigation";
import type { DropdownOption } from "@/app/search-news/page";
import { useCommentSortStore } from "@/app/store/comment-sorting";

type CategoryFilterProps = {
  options: DropdownOption[];
};

const filterOptions = [
  {
    value: "null",
    label: "Filter",
    icon: "stash:filter-solid",
  },
  {
    value: "all",
    label: "Semua",
    icon: "fluent-mdl2:all-apps",
  },
  {
    value: "week",
    label: "Minggu ini",
    icon: "material-symbols:next-week",
  },
  {
    value: "month",
    label: "Bulan ini",
    icon: "bi:calendar-month-fill",
  },
  {
    value: "year",
    label: "Tahun ini",
    icon: "fluent-mdl2:calendar-year",
  },
] as const;

const sortOptions = [
  {
    value: "null",
    label: "Sorting",
    icon: "material-symbols:sort",
  },
  {
    value: "likes-desc",
    label: "Like Terbanyak",
    icon: "mdi:like",
  },
  {
    value: "likes-asc",
    label: "Like Terkecil",
    icon: "mdi:dislike",
  },
  {
    value: "views-desc",
    label: "View Terbanyak",
    icon: "raphael:view",
  },
  {
    value: "views-asc",
    label: "View Terkecil",
    icon: "icon-park-solid:recent-views-sort",
  },
  {
    value: "comments-desc",
    label: "Komen Terbanyak",
    icon: "mingcute:comment-fill",
  },
  {
    value: "comments-asc",
    label: "Komen Terkecil",
    icon: "mingcute:comment-fill",
  },
  {
    value: "newest",
    label: "Terbaru",
    icon: "carbon:modified-newest",
  },
  {
    value: "oldest",
    label: "Terlama",
    icon: "carbon:modified-oldest",
  },
] as const;

const CommentsortOptions = [
  {
    value: "newest",
    label: "Terbaru",
    icon: "carbon:modified-newest",
  },
  {
    value: "oldest",
    label: "Terlama",
    icon: "carbon:modified-oldest",
  },
  {
    value: "populer",
    label: "Populer",
    icon: "solar:chat-round-like-bold",
  },
] as const;

export function Filter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterBy = searchParams.get("timeRange");

  function onChange(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("timeRange", value);
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    }
  }

  return (
    <DropdownSelect
      label="Filter"
      buttonIcon="stash:filter-solid"
      options={filterOptions}
      selected={filterBy}
      onChange={onChange}
    />
  );
}

export function Sorting() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderBy = searchParams.get("sort");

  function onChange(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("sort", value);
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    }
  }

  return (
    <DropdownSelect
      label="Sorting"
      buttonIcon="material-symbols:sort"
      options={sortOptions}
      selected={orderBy}
      onChange={onChange}
    />
  );
}

export function CategoryFilter({ options }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderBy = searchParams.get("category");

  function onChange(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("category", value);
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    }
  }

  return (
    <DropdownSelect
      label="Category"
      buttonIcon="material-symbols:category"
      options={options}
      selected={orderBy}
      onChange={onChange}
    />
  );
}

export function CommentSorting() {
  const sort = useCommentSortStore((s) => s.sort);
  const setSort = useCommentSortStore((s) => s.setSort);

  function onChange(value: string | null) {
    if (!value) return;
    setSort(value as "newest" | "oldest" | "populer");
  }

  return (
    <DropdownSelect
      label="Urutkan"
      buttonIcon="material-symbols:sort"
      options={CommentsortOptions}
      selected={sort}
      onChange={onChange}
    />
  );
}

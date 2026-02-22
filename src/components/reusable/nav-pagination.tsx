"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Props = {
  currentPage: number;
  totalPages: number;
  category: string;
  sort: string;
  timeRange: string;
};

type SearchProps = {
  currentPage: number;
  totalPages: number;
  category: string;
  sort: string;
  timeRange: string;
  query: string;
};

export  function CategoryPagination({
  currentPage,
  totalPages,
  category,
  sort,
  timeRange,
}: Props) {
  const createUrl = (page: number) =>
    `/category/${category}?page=${Math.max(1, Math.min(page, totalPages))}&sort=${sort}&timeRange=${timeRange}`;

  const getPageNumbers = () => {
    const delta = 2;
    const range: number[] = [];
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  };

  const pages = getPageNumbers();

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href={createUrl(Math.max(1, currentPage - 1))} />
        </PaginationItem>
        {pages[0] > 1 && (
          <>
            <PaginationItem>
              <PaginationLink href={createUrl(1)}>1</PaginationLink>
            </PaginationItem>
            {pages[0] > 2 && <span className="px-2">…</span>}
          </>
        )}

        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink isActive={page === currentPage} href={createUrl(page)}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className="px-2">…</span>}
            <PaginationItem>
              <PaginationLink href={createUrl(totalPages)}>{totalPages}</PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext href={createUrl(Math.min(totalPages, currentPage + 1))} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export  function SearchPagination({
  currentPage,
  totalPages,
  category,
  sort,
  timeRange,
  query,

}: SearchProps) {
  const createUrl = (page: number) =>
    `/search-news?q=${encodeURIComponent(query)}&page=${Math.max(1, Math.min(page, totalPages))}&sort=${sort}&timeRange=${timeRange}&category=${category}`;

  const getPageNumbers = () => {
    const delta = 2;
    const range: number[] = [];
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  };

  const pages = getPageNumbers();

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href={createUrl(Math.max(1, currentPage - 1))} />
        </PaginationItem>
        {pages[0] > 1 && (
          <>
            <PaginationItem>
              <PaginationLink href={createUrl(1)}>1</PaginationLink>
            </PaginationItem>
            {pages[0] > 2 && <span className="px-2">…</span>}
          </>
        )}

        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink isActive={page === currentPage} href={createUrl(page)}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className="px-2">…</span>}
            <PaginationItem>
              <PaginationLink href={createUrl(totalPages)}>{totalPages}</PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext href={createUrl(Math.min(totalPages, currentPage + 1))} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

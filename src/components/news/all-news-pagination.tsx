interface SEOPaginationProps {
  totalPages: number;
  currentPage?: number;
}

export function SEOPagination({ totalPages, currentPage = 1 }: SEOPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from(
    { length: Math.min(totalPages, 20) },
    (_, i) => i + 1
  );

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <>
      {prevPage && (
        <link rel="prev" href={prevPage === 1 ? "/" : `/?page=${prevPage}`} />
      )}
      {nextPage && (
        <link rel="next" href={`/?page=${nextPage}`} />
      )}
      <nav className="sr-only" aria-label="Navigasi halaman berita">
        <ul>
          {prevPage && (
            <li>
              <a href={prevPage === 1 ? "/" : `/?page=${prevPage}`}>
                Halaman Sebelumnya
              </a>
            </li>
          )}

          {pages.map((page) => (
            <li key={page}>
              <a
                href={page === 1 ? "/" : `/?page=${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                Halaman {page}
              </a>
            </li>
          ))}

          {nextPage && (
            <li>
              <a href={`/?page=${nextPage}`}>Halaman Berikutnya</a>
            </li>
          )}
        </ul>
      </nav>
    </>
  );
}
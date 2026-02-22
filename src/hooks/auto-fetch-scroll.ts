import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

interface AutoFetchOptions {
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
}

export default function useAutoFetchOnScroll({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: AutoFetchOptions) {
  const { ref, inView } = useInView({
    rootMargin: "300px",
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return ref;
}

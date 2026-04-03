"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.25,
});

function RouteProgressContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (anchor?.href && anchor.target !== "_blank") {
        const currentUrl = window.location.href;
        const nextUrl = anchor.href;

        if (currentUrl !== nextUrl) {
          NProgress.start();
        }
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParamsString]);

  return null;
}

export default function RouteProgress() {
  return (
    <Suspense fallback={null}>
      <RouteProgressContent />
    </Suspense>
  );
}
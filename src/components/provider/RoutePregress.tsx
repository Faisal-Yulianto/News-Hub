"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.25,
});

export default function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const isNavigating = useRef(false);

  useEffect(() => {
    isNavigating.current = true;
    NProgress.start();


    requestAnimationFrame(() => {
      if (isNavigating.current) {
        NProgress.done(true);
        isNavigating.current = false;
      }
    });
  }, [pathname, searchParamsString]);

  return null;
}

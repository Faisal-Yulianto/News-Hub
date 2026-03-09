"use client";

import { useEffect } from "react";
import { getOrCreateVisitorId } from "@/lib/visitor-cookie";
import { usePathname } from "next/navigation";
import { isInternalRoute } from "@/lib/constants";

export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (isInternalRoute(pathname)) return;
    const visitorId = getOrCreateVisitorId();

    fetch("/api/admin/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        visitorId,
        page: pathname,
      }),
    }).catch((err) => {
      console.error("Failed to send analytics data:", err);
    });
  }, [pathname]);

  return null;
}

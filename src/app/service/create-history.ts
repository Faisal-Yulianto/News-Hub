
"use client";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

interface CreateHistoryPayload {
  newsId: string;
}

const createHistory = async (payload: CreateHistoryPayload) => {
  const res = await fetch("/api/history", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to create history");
  }

  return res.json();
};

export const useCreateHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["history"],
      });
    },
  });
};

interface HistoryTrackerProps {
  newsId: string;
  minReadTime?: number; 
}

export default function HistoryTracker({
  newsId,
  minReadTime = 5000,
}: HistoryTrackerProps) {
  const { mutate } = useCreateHistory();

  const hasSentRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!newsId) return;
    if (hasSentRef.current) return;

    const startTimer = () => {
      timerRef.current = setTimeout(() => {
        if (!hasSentRef.current && document.visibilityState === "visible") {
          hasSentRef.current = true;
          mutate({ newsId });
        }
      }, minReadTime);
    };

    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    if (document.visibilityState === "visible") {
      startTimer();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        clearTimer();
      } else if (!hasSentRef.current) {
        startTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimer();
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [newsId, minReadTime, mutate]);

  return null;
}
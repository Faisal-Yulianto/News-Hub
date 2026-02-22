"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const MAX_LENGTH = 100;

  const qFromUrl = searchParams.get("q") ?? "";
  const [value, setValue] = useState(qFromUrl);

  useEffect(() => {
    setValue(qFromUrl);
  }, [qFromUrl]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.slice(0, MAX_LENGTH).replace(/\s+/g, " ");

    setValue(v);

    const params = new URLSearchParams(searchParams.toString());

    if (v) {
      params.set("q", v);
      params.set("page", "1");
    } else {
      params.delete("q");
      params.set("page", "1");
    }

    router.push(`?${params.toString()}`);
  }

  return (
    <input
      value={value}
      onChange={onChange}
      placeholder="Cari Berita..."
      className="pl-2 rounded-md border-1 dark:border-white/30 border-black/10 text-sm font-extralight dark:bg-black/90"
    />
  );
}

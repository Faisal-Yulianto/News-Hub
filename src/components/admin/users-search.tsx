"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import { useDebounce } from "@/hooks/admin/use-debounce";
import { useEffect } from "react";

interface UsersSearchProps {
  onSearch: (value: string) => void;
}

export function UsersSearch({ onSearch }: UsersSearchProps) {
  const [value, setValue] = useState("");
  const debouncedValue = useDebounce(value, 500);
  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  return (
    <div className="relative w-full sm:w-64">
      <Icon
        icon="solar:magnifer-linear"
        className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
      />
      <Input
        placeholder="Cari user..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}

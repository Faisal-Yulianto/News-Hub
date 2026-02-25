"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Icon } from "@iconify/react";
import { useUpdateProfile } from "@/app/service/edit-profile";

export default function EditName() {
  const { mutate} = useUpdateProfile();
  const [name, setName] = useState("");
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) return;
    const formData = new FormData();
    formData.append("name", trimmed);

    mutate(formData);
    setName("");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Change name"
          className="absolute top-12 right-2 text-white hover:scale-110 transition-transform"
        >
          <Icon icon="bi:vector-pen" width={20} height={20} />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-45 h-10">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Gati nama ..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full py-1 text-sm bottom-3 relative border-none outline-none focus:outline-none focus:ring-0"
          />
        </form>
      </PopoverContent>
    </Popover>
  );
}

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
  const { mutate } = useUpdateProfile();

  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (trimmed.length < 5) {
      setError("Nama minimal 5 karakter");
      return;
    }

    const formData = new FormData();
    formData.append("name", trimmed);

    mutate(formData);

    setName("");
    setError("");
  };

  const handleChange = (value: string) => {
    setName(value);

    if (error) setError("");
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

      <PopoverContent align="end" className="w-56">
        <form onSubmit={handleSubmit} className="flex flex-col gap-1">
          <input
            type="text"
            placeholder="Ganti nama ..."
            value={name}
            onChange={(e) => handleChange(e.target.value)}
            className={`w-full text-sm border-none outline-none focus:ring-0 ${
              error ? "text-red-500" : ""
            }`}
          />

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
        </form>
      </PopoverContent>
    </Popover>
  );
}
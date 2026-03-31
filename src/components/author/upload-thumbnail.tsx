"use client";

import { useCallback } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThumbnailUploadProps {
  value: { url: string; hash: string } | null;
  onChange: (value: { url: string; hash: string } | null) => void;
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
  disabled?: boolean;
}

export function ThumbnailUpload({
  value,
  onChange,
  onUpload,
  uploading,
  disabled,
}: ThumbnailUploadProps) {
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      await onUpload(file);
      e.target.value = "";
    },
    [onUpload],
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      await onUpload(file);
    },
    [onUpload],
  );

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative rounded-lg overflow-hidden border aspect-video bg-muted">
          <Image
            src={value.url}
            alt="Thumbnail preview"
            fill
            className="object-cover"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={() => onChange(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            "relative border-2 border-dashed rounded-lg aspect-video flex flex-col items-center justify-center gap-2 transition-colors",
            uploading
              ? "border-primary/50 bg-primary/5"
              : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50 cursor-pointer",
          )}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileChange}
            disabled={uploading || disabled}
          />
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Mengunggah...</p>
            </>
          ) : (
            <>
              <UploadCloud className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm font-medium">
                Masukan gambar di sini atau klik untuk mengunggah
              </p>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WebP — max 5MB
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ContentImageValue } from "@/lib/validation/add-news-validation";

interface ContentImageUploadProps {
  value: ContentImageValue[];
  onChange: (value: ContentImageValue[]) => void;
  onUpload: (files: File[]) => Promise<void>;
  uploading: boolean;
  disabled?: boolean;
}

const MAX_IMAGES = 3;

export function ContentImageUpload({
  value,
  onChange,
  onUpload,
  uploading,
  disabled,
}: ContentImageUploadProps) {
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (!files.length) return;

      const remaining = MAX_IMAGES - value.length;
      const toUpload = files.slice(0, remaining);
      await onUpload(toUpload);
      e.target.value = "";
    },
    [onUpload, value.length],
  );

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleCaptionChange = (index: number, caption: string) => {
    onChange(value.map((img, i) => (i === index ? { ...img, caption } : img)));
  };

  const canUploadMore = value.length < MAX_IMAGES && !disabled;

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {value.map((img, index) => (
            <div key={index} className="space-y-1.5">
              <div className="relative rounded-lg overflow-hidden border aspect-video bg-muted">
                <Image
                  src={img.url}
                  alt={`Content image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                {!disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1.5 right-1.5 h-6 w-6"
                    onClick={() => handleRemove(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <Input
                placeholder="Caption (optional)"
                value={img.caption ?? ""}
                onChange={(e) => handleCaptionChange(index, e.target.value)}
                maxLength={200}
                disabled={disabled}
                className="text-xs h-8"
              />
            </div>
          ))}
        </div>
      )}
      {canUploadMore && (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 transition-colors",
            uploading
              ? "border-primary/50 bg-primary/5"
              : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50 cursor-pointer",
          )}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileChange}
            disabled={uploading}
          />
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Mengunggah...</p>
            </>
          ) : (
            <>
              <UploadCloud className="w-6 h-6 text-muted-foreground" />
              <p className="text-sm font-medium">
                Unggah gambar konten ({value.length}/{MAX_IMAGES})
              </p>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WebP — max 3MB per gambar
              </p>
            </>
          )}
        </div>
      )}

      {value.length >= MAX_IMAGES && (
        <p className="text-xs text-muted-foreground text-center">
          Maksimal {MAX_IMAGES} gambar tercapai{" "}
        </p>
      )}
    </div>
  );
}

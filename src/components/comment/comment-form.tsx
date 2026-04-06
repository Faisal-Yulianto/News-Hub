"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Loader2, Send, X } from "lucide-react";
import Image from "next/image";

interface CommentFormProps {
  newsId: string;
  parentId?: string;
  parentAuthorName?: string;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  submitLabel?: string;
}

export function CommentForm({
  parentId,
  parentAuthorName,
  onSubmit,
  onCancel,
  isSubmitting = false,
  autoFocus = false,
  placeholder = "Tulis komentar...",
  submitLabel = "Kirim",
}: CommentFormProps) {
  const { data: session } = useSession();
  const { data: userProfile } = useUserProfile();
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [content]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent || isSubmitting) return;

    onSubmit(trimmedContent);
    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e as unknown as React.FormEvent);
    }

    if (e.key === "Escape" && onCancel) {
      onCancel();
    }
  };

  if (!session) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4 text-center">
        <p className="text-xs sm:text-sm text-gray-600">
          Harap{" "}
          <button className="text-blue-600 hover:underline font-medium">
            log in terlebih dahulu
          </button>{" "}
          untuk {parentId ? "balas" : "komentar"}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0">
          <div className="relative w-full h-full rounded-full overflow-hidden dark:ring-white">
            <Image
              src={userProfile?.avatar || "/newshub.png"}
              alt="User profile photo"
              fill
              sizes="(max-width: 640px) 32px, 40px"
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {parentAuthorName && (
            <div className="mb-2 text-xs sm:text-sm text-gray-600">
              Balas ke <span className="font-semibold">{parentAuthorName}</span>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={2000}
            rows={1}
            disabled={isSubmitting}
            className="
              w-full resize-none rounded-lg border border-gray-300 
              px-3 sm:px-4 py-2 sm:py-2.5
              text-xs sm:text-sm placeholder:text-gray-400
              focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
              disabled:bg-gray-100 disabled:cursor-not-allowed
              min-h-[40px] sm:min-h-[42px] max-h-[200px]
              transition-colors
              text-black dark:text-white
            "
          />

          <div className="mt-1 flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs text-gray-500">
            <span>
              {content.length > 0 && (
                <>
                  {content.length} / 2000
                  {content.length > 1900 && (
                    <span className="ml-1 text-orange-600">
                      ({2000 - content.length} left)
                    </span>
                  )}
                </>
              )}
            </span>
            <span className="text-gray-400 hidden sm:inline">
              Ctrl+Enter • Esc batal
            </span>
            <span className="text-gray-400 sm:hidden">⌘/Ctrl+Enter</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 sm:gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="
              inline-flex items-center gap-1 sm:gap-2 
              px-3 sm:px-4 py-1.5 sm:py-2 
              text-xs sm:text-sm font-medium
              text-gray-700 hover:bg-gray-100 rounded-lg
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Batal</span>
          </button>
        )}

        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="
            inline-flex items-center gap-1 sm:gap-2 
            px-3 sm:px-5 py-1.5 sm:py-2 
            text-xs sm:text-sm font-medium
            text-white bg-blue-600 rounded-lg
            hover:bg-blue-700 active:bg-blue-800
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:bg-blue-600
          "
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              <span>Mengirim...</span>
            </>
          ) : (
            <>
              <Send className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{submitLabel}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

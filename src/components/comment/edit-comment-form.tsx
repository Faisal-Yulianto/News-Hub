'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CommentEditFormProps {
  initialContent: string;
  onSubmit: (content: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CommentEditForm({
  initialContent,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CommentEditFormProps) {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent || isSubmitting) return;
    if (trimmedContent === initialContent.trim()) {
      toast.info('Tidak ada perubahan terdeteksi');
      onCancel();
      return;
    }

    onSubmit(trimmedContent);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e as unknown as React.FormEvent);
    }

    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const hasChanges = content.trim() !== initialContent.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Edit Komentar..."
          maxLength={2000}
          rows={1}
          disabled={isSubmitting}
          className="
            w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5
            text-sm placeholder:text-gray-400
            focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
            disabled:bg-gray-100 disabled:cursor-not-allowed
            min-h-[42px] max-h-[200px]
            transition-colors
          "
        />
        <div className="mt-1 flex items-center justify-between text-xs">
          <span
            className={`
              ${content.length > 1900 ? 'text-orange-600 font-medium' : 'text-gray-500'}
              ${content.length >= 2000 ? 'text-red-600 font-semibold' : ''}
            `}
          >
            {content.length > 0 && (
              <>
                {content.length} / 2000
                {content.length > 1900 && content.length < 2000 && (
                  <span className="ml-1">({2000 - content.length} left)</span>
                )}
                {content.length >= 2000 && (
                  <span className="ml-1">(Maximum reached!)</span>
                )}
              </>
            )}
          </span>
          <span className="text-gray-400">
            Ctrl+Enter untuk merubah • Esc untuk batal
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="
            inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
            text-gray-700 hover:bg-gray-100 rounded-lg
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <X className="h-4 w-4" />
          batal
        </button>

        <button
          type="submit"
          disabled={!content.trim() || !hasChanges || isSubmitting}
          className="
            inline-flex items-center gap-2 px-4 py-2 text-sm font-medium
            text-white bg-blue-600 rounded-lg
            hover:bg-blue-700 active:bg-blue-800
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:bg-blue-600
          "
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Simpan
            </>
          )}
        </button>
      </div>
    </form>
  );
}
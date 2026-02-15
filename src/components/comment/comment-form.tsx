'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, Send, X } from 'lucide-react';
import Image from 'next/image';


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
  placeholder = 'Tulis komentar...',
  submitLabel = 'Kirim',
}: CommentFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
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
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e as unknown as React.FormEvent);
    }

    if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  if (!session) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
        <p className="text-sm text-gray-600">
          Harap{' '}
          <button className="text-blue-600 hover:underline font-medium">
            log in terlebih dahulu
          </button>{' '}
          untuk {parentId ? 'balas' : 'komentar'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 ">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-10 w-[45px] h-[45px] overflow-hidden rounded-full">
          <Image
            src={session.user.avatar || '/default-avatar.png'}
            alt={session.user.name || 'User'}
            width={45}
            height={45}
            className="object-cover "
          />
        </div>
        <div className="flex-1">
          {parentAuthorName && (
            <div className="mb-2 text-sm text-gray-600">
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
              w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5
              text-sm placeholder:text-gray-400
              focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
              disabled:bg-gray-100 disabled:cursor-not-allowed
              min-h-[42px] max-h-[200px]
              transition-
              text-black dark:text-white
            "
          />
          <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
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
            <span className="text-gray-400">
              Ctrl+Enter untuk mengirim • Esc untuk batal
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 pl-[52px]">
        {onCancel && (
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
            Batal
          </button>
        )}

        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
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
              Mengirim...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
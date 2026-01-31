'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useLikeComment } from '@/app/service/like-comment-service';
import { Heart, Loader2 } from 'lucide-react';

interface LikeButtonProps {
  commentId: string;
  newsId: string;
  likeCount: number;
  isLiked: boolean;
}

export function LikeButton({
  commentId,
  newsId,
  likeCount,
  isLiked,
}: LikeButtonProps) {
  const { data: session } = useSession();
  const { mutate: toggleLike, isPending } = useLikeComment(newsId);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);

  useEffect(() => {
    setLocalIsLiked(isLiked);
    setLocalLikeCount(likeCount);
  }, [isLiked, likeCount]);

  const handleLike = () => {
    if (!session) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 2000);
      return;
    }

    const newIsLiked = !localIsLiked;
    setLocalIsLiked(newIsLiked);
    setLocalLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);
    
    toggleLike(commentId);
  };

  return (
    <div className="relative">
      <button
        onClick={handleLike}
        disabled={isPending}
        className={`
          flex items-center gap-1.5 text-sm font-medium transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isPending ? 'scale-95' : 'hover:scale-105'}
          ${localIsLiked 
            ? 'text-red-600' 
            : 'text-gray-600 hover:text-red-600'
          }
        `}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart 
            className={`h-4 w-4 transition-all ${
              localIsLiked ? 'fill-current' : ''
            }`}
          />
        )}
        <span>{localLikeCount}</span>
      </button>

      {showLoginPrompt && (
        <div className="absolute left-0 top-full mt-2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg">
          Log in terlebih dahulu untuk like!
          <div className="absolute -top-1 left-4 h-2 w-2 rotate-45 bg-gray-900" />
        </div>
      )}
    </div>
  );
}
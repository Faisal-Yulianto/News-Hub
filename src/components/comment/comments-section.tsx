"use client";

import { useAllComments, allCommentProps } from "@/hooks/use-all-coments";
import { useMemo } from "react";
import useAutoFetchOnScroll from "@/hooks/auto-fetch-scroll";
import { Skeleton } from "../ui/skeleton";
import { Icon } from "@iconify/react";
import { CommentSorting } from "../news/filter";
import { CommentItemDisplay } from "./comment-item";
import { useCreateComment } from "@/app/service/create-comment";
import { CommentForm } from "./comment-form";

export default function CommentSection({ newsId }: allCommentProps) {
  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } =
    useAllComments({ newsId });

  const { mutate: createComment, isPending: isCreatingComment } =
    useCreateComment(newsId);
  const items = useMemo(
    () => data?.pages.flatMap((page) => page.comments) ?? [],
    [data],
  );
  const isEmpty = !isLoading && items.length === 0;

  const ref = useAutoFetchOnScroll({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  });
  
  const handleCreateComment = (content: string) => {
    createComment({
      newsId,
      content,
    });
  };
  return (
    <section className="m-auto w-[80%] py-4 px-10 shadow-md shadow-black/20 rounded-sm">
      {isLoading && (
        <>
          <Icon icon="eos-icons:bubble-loading" width={30} className="m-auto" />
        </>
      )}
      {!isLoading && (
        <>
          <div className="px-6 py-4  bg-gray-50 dark:bg-black/10 rounded-md my-2">
            <CommentForm
              newsId={newsId}
              onSubmit={handleCreateComment}
              isSubmitting={isCreatingComment}
              placeholder="Tulis Komentar"
              submitLabel="Kirim Komentar"
            />
          </div>
          <p className="text-sm">
            {items[0]?.news.commentCount || "0"} Komentar
          </p>
          <div className="border-b-2 border-black dark:border-white my-2" />
          <div className="flex flex-col justify-end items-end mb-2">
            <CommentSorting />
          </div>
          {items.map((comment) => (
            <CommentItemDisplay
              key={comment.id}
              comment={comment}
              newsId={comment.newsId}
              depth={comment.depth}
            />
          ))}
        </>
      )}
      {isEmpty && (
        <div className="w-full text-center py-10 text-muted-foreground text-sm">
          <h2>Belum ada komentar saat ini.</h2>
        </div>
      )}
      {isFetchingNextPage && (
        <div className="w-full flex flex-wrap justify-center gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-30 md:h-30 w-full lg:w-[49.0%]" />
          ))}
        </div>
      )}
      <div ref={ref} style={{ height: 1 }} />
    </section>
  );
}

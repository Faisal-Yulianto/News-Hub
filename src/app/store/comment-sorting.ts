import { create } from "zustand";

export type CommentSort = "newest" | "oldest" | "populer";

interface CommentSortState {
  sort: CommentSort;
  setSort: (sort: CommentSort) => void;
}

export const useCommentSortStore = create<CommentSortState>((set) => ({
  sort: "newest",
  setSort: (sort) => set({ sort }),
}));

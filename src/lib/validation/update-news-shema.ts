import { z } from "zod";
import { NewsStatus } from "@prisma/client";

export const updateNewsSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must be at most 200 characters")
    .trim(),
  excerpt: z
    .string()
    .min(10, "Excerpt must be at least 10 characters")
    .max(500, "Excerpt must be at most 500 characters")
    .trim(),
  content: z.string().min(50, "Content is too short").trim(),
  categoryId: z.string().min(1, "Category is required"),
  thumbnailUrl: z.string().url("Invalid thumbnail URL"),
  thumbnailHash: z.string().min(1),
  source: z.string().min(2, "Source is required").max(200).trim(),
  isBreaking: z.boolean(),
  metaTitle: z.string().max(100).optional().or(z.literal("")),
  metaDescription: z.string().max(200).optional().or(z.literal("")),
  contentImages: z
    .array(
      z.object({
        url: z.string().url(),
        hash: z.string().min(1),
        caption: z.string().max(200).optional().or(z.literal("")),
      })
    )
    .max(3),
  status: z.enum([NewsStatus.DRAFT, NewsStatus.PENDING_REVIEW]),
});
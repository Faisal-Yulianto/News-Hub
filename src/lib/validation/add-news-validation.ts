import { z } from "zod";

export const contentImageSchema = z.object({
  url: z.string().url("Invalid image URL"),
  hash: z.string().min(1),
  caption: z
    .string()
    .max(200, "Caption too long")
    .optional()
    .or(z.literal("")),
});

export const createNewsSchema = z.object({
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
  content: z.string().min(50, "Content is too short"),
  categoryId: z.string().min(1, "Category is required"),
  thumbnailUrl: z.string().url("Thumbnail is required"),
  thumbnailHash: z.string().min(1),
  source: z
    .string()
    .min(2, "Source is required")
    .max(200, "Source too long")
    .trim(),
  isBreaking: z.boolean(),
  metaTitle: z
    .string()
    .max(100, "Meta title too long")
    .optional()
    .or(z.literal("")),
  metaDescription: z
    .string()
    .max(200, "Meta description too long")
    .optional()
    .or(z.literal("")),
  contentImages: z.array(contentImageSchema).max(3, "Maximum 3 content images"),
  status: z.enum(["DRAFT", "PENDING_REVIEW"]),
});

export type CreateNewsFormValues = z.infer<typeof createNewsSchema>;
export type ContentImageValue = z.infer<typeof contentImageSchema>;
import { z } from "zod";

const iconifyRegex = /^[a-z0-9-]+:[a-z0-9-]+$/;

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be at most 50 characters")
    .trim(),
  icon: z
    .string()
    .max(100, "Icon string must be at most 100 characters")
    .refine(
      (val) => val.trim() === "" || iconifyRegex.test(val.trim()),
      "Invalid icon format. Expected format: prefix:icon-name (e.g. material-symbols:folder-rounded)"
    )
    .optional()
    .or(z.literal("")),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
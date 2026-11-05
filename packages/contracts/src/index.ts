import { z } from "zod";

export const projectImageKeys = [
  "freight",
  "ordinal",
  "common-ground",
] as const;

export const projectInputSchema = z.object({
  category: z.string().trim().min(2).max(80),
  description: z.string().trim().min(8).max(500),
  featured: z.boolean(),
  image: z.enum(projectImageKeys),
  imageUrl: z
    .string()
    .url()
    .refine((value) => ["http:", "https:"].includes(new URL(value).protocol))
    .nullable(),
  published: z.boolean(),
  sortOrder: z.number().int().min(0).max(99),
  summary: z.string().trim().min(8).max(240),
  title: z.string().trim().min(2).max(80),
  year: z.string().regex(/^\d{4}(?:[–-]\d{2})?$/),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;

export type Project = ProjectInput & { id: string };

export const projectSchema = projectInputSchema.extend({
  id: z.string().uuid(),
});
export const projectListSchema = z.array(projectSchema);

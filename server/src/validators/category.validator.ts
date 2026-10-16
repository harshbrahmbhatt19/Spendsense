import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1).max(40),
  type: z.enum(["income", "expense"]),
  icon: z.string().default("circle"),
  color: z.string().default("#6366f1"),
});

export const updateCategorySchema = createCategorySchema.partial();

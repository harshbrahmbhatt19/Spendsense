import { z } from "zod";

export const createBudgetSchema = z.object({
  categoryId: z.string().optional(),
  amount: z.number().positive(),
  period: z.enum(["monthly", "yearly"]).default("monthly"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export const updateBudgetSchema = createBudgetSchema.partial();

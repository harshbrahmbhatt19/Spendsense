import { z } from "zod";

export const createGoalSchema = z.object({
  title: z.string().min(1).max(80),
  targetAmount: z.number().positive(),
  currentAmount: z.number().min(0).default(0),
  targetDate: z.coerce.date().optional(),
  description: z.string().max(300).optional(),
  icon: z.string().default("target"),
});

export const updateGoalSchema = createGoalSchema.partial();

export const goalContributionSchema = z.object({
  amount: z.number().positive(),
});

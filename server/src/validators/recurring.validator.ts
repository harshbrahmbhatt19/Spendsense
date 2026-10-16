import { z } from "zod";

export const createRecurringSchema = z.object({
  title: z.string().min(1).max(120),
  amount: z.number().positive(),
  type: z.enum(["income", "expense"]),
  categoryId: z.string().optional(),
  accountId: z.string().min(1),
  paymentMethod: z
    .enum(["cash", "upi", "credit_card", "debit_card", "bank_transfer"])
    .default("cash"),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  autoCreate: z.boolean().default(true),
});

export const updateRecurringSchema = createRecurringSchema.partial();

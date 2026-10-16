import { z } from "zod";

export const createTransactionSchema = z.object({
  title: z.string().min(1).max(120),
  amount: z.number().positive("Amount must be greater than 0"),
  type: z.enum(["income", "expense", "transfer"]),
  categoryId: z.string().optional(),
  accountId: z.string().min(1, "Account is required"),
  toAccountId: z.string().optional(),
  paymentMethod: z
    .enum(["cash", "upi", "credit_card", "debit_card", "bank_transfer"])
    .default("cash"),
  date: z.coerce.date().default(() => new Date()),
  notes: z.string().max(500).optional(),
  tags: z.array(z.string()).default([]),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

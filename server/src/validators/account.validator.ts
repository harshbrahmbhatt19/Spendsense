import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(1).max(60),
  type: z.enum(["cash", "bank", "savings", "credit_card", "wallet", "other"]).default("cash"),
  balance: z.number().default(0),
  currency: z.string().default("INR"),
  icon: z.string().default("wallet"),
});

export const updateAccountSchema = createAccountSchema.partial();

export const transferSchema = z.object({
  fromAccountId: z.string().min(1),
  toAccountId: z.string().min(1),
  amount: z.number().positive(),
  notes: z.string().max(300).optional(),
});

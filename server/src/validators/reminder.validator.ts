import { z } from "zod";

export const createReminderSchema = z.object({
  title: z.string().min(1).max(120),
  amount: z.number().positive(),
  dueDate: z.coerce.date(),
  category: z.string().max(60).optional(),
  reminderFrequency: z.enum(["once", "daily", "weekly"]).default("once"),
});

export const updateReminderSchema = createReminderSchema.partial();

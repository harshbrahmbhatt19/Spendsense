import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  currency: z.string().min(1).max(10).optional(),
  theme: z.enum(["light", "dark"]).optional(),
  monthlyIncomeGoal: z.number().min(0).optional(),
  savingsTarget: z.number().min(0).optional(),
  monthStartDate: z.number().min(1).max(28).optional(),
  profileImage: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

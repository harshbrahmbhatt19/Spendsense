import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  userId: z
    .string()
    .min(3, "ID must be at least 3 characters")
    .max(30)
    .regex(/^[a-zA-Z0-9_.]+$/, "ID can only contain letters, numbers, '.' and '_'"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  userId: z.string().min(1, "ID is required"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

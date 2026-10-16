import { z } from "zod";

export const askAssistantSchema = z.object({
  message: z.string().min(1).max(500),
});

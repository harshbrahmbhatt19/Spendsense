import { Response } from "express";
import { AuthRequest } from "@/middleware/auth";
import { asyncHandler } from "@/utils/asyncHandler";
import { generateInsights } from "@/services/insights.service";

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const insights = await generateInsights(req.userId!);
  res.status(200).json({ success: true, data: insights });
});

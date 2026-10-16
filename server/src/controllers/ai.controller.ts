import { Response } from "express";
import { AuthRequest } from "@/middleware/auth";
import { asyncHandler } from "@/utils/asyncHandler";
import {
  askFinancialAssistant,
  getConversationHistory,
  clearConversation,
} from "@/services/ai.service";
import { scanReceipt as scanReceiptImage } from "@/services/receipt.service";
import { ApiError } from "@/utils/ApiError";

export const ask = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await askFinancialAssistant(req.userId!, req.body.message);
  res.status(200).json({ success: true, data: result });
});

export const history = asyncHandler(async (req: AuthRequest, res: Response) => {
  const messages = await getConversationHistory(req.userId!);
  res.status(200).json({ success: true, data: messages });
});

export const reset = asyncHandler(async (req: AuthRequest, res: Response) => {
  await clearConversation(req.userId!);
  res.status(200).json({ success: true, message: "Conversation cleared" });
});

export const scanReceipt = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) throw new ApiError(400, "Receipt image is required");
  const data = await scanReceiptImage(req.file.buffer, req.file.mimetype);
  res.status(200).json({ success: true, data });
});

import { Response } from "express";
import { AuthRequest } from "@/middleware/auth";
import { asyncHandler } from "@/utils/asyncHandler";
import { Budget } from "@/models/Budget";
import { ApiError } from "@/utils/ApiError";
import { getBudgetsWithProgress } from "@/services/budget.service";

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const budget = await Budget.create({ ...req.body, userId: req.userId });
  res.status(201).json({ success: true, data: budget });
});

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const budgets = await getBudgetsWithProgress(req.userId!);
  res.status(200).json({ success: true, data: budgets });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const budget = await Budget.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!budget) throw new ApiError(404, "Budget not found");
  res.status(200).json({ success: true, data: budget });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!budget) throw new ApiError(404, "Budget not found");
  res.status(200).json({ success: true, message: "Budget deleted" });
});

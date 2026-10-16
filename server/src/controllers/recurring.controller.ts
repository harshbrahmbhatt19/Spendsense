import { Response } from "express";
import { AuthRequest } from "@/middleware/auth";
import { asyncHandler } from "@/utils/asyncHandler";
import { RecurringTransaction } from "@/models/RecurringTransaction";
import { ApiError } from "@/utils/ApiError";
import { previewUpcoming } from "@/services/recurring.service";

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const rule = await RecurringTransaction.create({
    ...req.body,
    userId: req.userId,
    nextOccurrence: req.body.startDate,
  });
  res.status(201).json({ success: true, data: rule });
});

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const rules = await RecurringTransaction.find({ userId: req.userId })
    .populate("categoryId", "name icon color")
    .populate("accountId", "name icon")
    .sort({ nextOccurrence: 1 });

  const data = rules.map((rule) => ({
    ...rule.toObject(),
    upcoming: previewUpcoming(rule),
  }));

  res.status(200).json({ success: true, data });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const rule = await RecurringTransaction.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!rule) throw new ApiError(404, "Recurring transaction not found");
  res.status(200).json({ success: true, data: rule });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const rule = await RecurringTransaction.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
  });
  if (!rule) throw new ApiError(404, "Recurring transaction not found");
  res.status(200).json({ success: true, message: "Recurring transaction deleted" });
});

export const toggleActive = asyncHandler(async (req: AuthRequest, res: Response) => {
  const rule = await RecurringTransaction.findOne({ _id: req.params.id, userId: req.userId });
  if (!rule) throw new ApiError(404, "Recurring transaction not found");
  rule.active = !rule.active;
  await rule.save();
  res.status(200).json({ success: true, data: rule });
});

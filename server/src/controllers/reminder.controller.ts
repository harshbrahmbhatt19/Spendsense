import { Response } from "express";
import { AuthRequest } from "@/middleware/auth";
import { asyncHandler } from "@/utils/asyncHandler";
import { Reminder } from "@/models/Reminder";
import { ApiError } from "@/utils/ApiError";

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reminder = await Reminder.create({ ...req.body, userId: req.userId });
  res.status(201).json({ success: true, data: reminder });
});

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reminders = await Reminder.find({ userId: req.userId }).sort({ dueDate: 1 });
  res.status(200).json({ success: true, data: reminders });
});

export const upcoming = asyncHandler(async (req: AuthRequest, res: Response) => {
  const in7Days = new Date();
  in7Days.setDate(in7Days.getDate() + 7);

  const reminders = await Reminder.find({
    userId: req.userId,
    status: { $in: ["pending", "overdue"] },
    dueDate: { $lte: in7Days },
  }).sort({ dueDate: 1 });

  res.status(200).json({ success: true, data: reminders });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reminder = await Reminder.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!reminder) throw new ApiError(404, "Reminder not found");
  res.status(200).json({ success: true, data: reminder });
});

export const markPaid = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reminder = await Reminder.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { status: "paid" },
    { new: true }
  );
  if (!reminder) throw new ApiError(404, "Reminder not found");
  res.status(200).json({ success: true, data: reminder });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!reminder) throw new ApiError(404, "Reminder not found");
  res.status(200).json({ success: true, message: "Reminder deleted" });
});

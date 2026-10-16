import { Response } from "express";
import { AuthRequest } from "@/middleware/auth";
import { asyncHandler } from "@/utils/asyncHandler";
import { Notification } from "@/models/Notification";
import { ApiError } from "@/utils/ApiError";

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notifications = await Notification.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .limit(100);
  const unreadCount = await Notification.countDocuments({ userId: req.userId, isRead: false });
  res.status(200).json({ success: true, data: notifications, unreadCount });
});

export const markRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw new ApiError(404, "Notification not found");
  res.status(200).json({ success: true, data: notification });
});

export const markAllRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Notification.updateMany({ userId: req.userId, isRead: false }, { isRead: true });
  res.status(200).json({ success: true, message: "All notifications marked as read" });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
  });
  if (!notification) throw new ApiError(404, "Notification not found");
  res.status(200).json({ success: true, message: "Notification deleted" });
});

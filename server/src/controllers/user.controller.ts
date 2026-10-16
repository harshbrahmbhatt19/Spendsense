import { Response } from "express";
import { AuthRequest } from "@/middleware/auth";
import { asyncHandler } from "@/utils/asyncHandler";
import { User } from "@/models/User";
import { Account } from "@/models/Account";
import { AIConversation } from "@/models/AIConversation";
import { Budget } from "@/models/Budget";
import { Category } from "@/models/Category";
import { Goal } from "@/models/Goal";
import { Notification } from "@/models/Notification";
import { RecurringTransaction } from "@/models/RecurringTransaction";
import { Reminder } from "@/models/Reminder";
import { Transaction } from "@/models/Transaction";
import { ApiError } from "@/utils/ApiError";

const sanitizeUser = (user: any) => ({
  id: user._id,
  userId: user.userId,
  name: user.name,
  profileImage: user.profileImage,
  currency: user.currency,
  theme: user.theme,
  monthlyIncomeGoal: user.monthlyIncomeGoal,
  savingsTarget: user.savingsTarget,
  monthStartDate: user.monthStartDate,
});

export const updateMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findByIdAndUpdate(req.userId, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json({ success: true, data: { user: sanitizeUser(user) } });
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).select("+password");
  if (!user) throw new ApiError(404, "User not found");

  const isMatch = await user.comparePassword(req.body.currentPassword);
  if (!isMatch) throw new ApiError(401, "Current password is incorrect");

  user.password = req.body.newPassword;
  await user.save();

  res.status(200).json({ success: true, message: "Password updated" });
});

export const resetData = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  await Promise.all([
    Account.deleteMany({ userId }),
    AIConversation.deleteMany({ userId }),
    Budget.deleteMany({ userId }),
    Category.deleteMany({ userId }),
    Goal.deleteMany({ userId }),
    Notification.deleteMany({ userId }),
    RecurringTransaction.deleteMany({ userId }),
    Reminder.deleteMany({ userId }),
    Transaction.deleteMany({ userId }),
  ]);

  res.status(200).json({ success: true, message: "All personal data was reset" });
});

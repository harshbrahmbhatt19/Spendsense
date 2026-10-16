import { Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { signToken } from "@/utils/jwt";
import { registerUser, authenticateUser } from "@/services/auth.service";
import { User } from "@/models/User";
import { AuthRequest } from "@/middleware/auth";
import { env } from "@/config/env";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

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

export const register = asyncHandler(async (req, res: Response) => {
  const user = await registerUser(req.body);
  const token = signToken({ userId: user._id.toString() });

  res.cookie("token", token, COOKIE_OPTIONS);
  res.status(201).json({ success: true, data: { user: sanitizeUser(user), token } });
});

export const login = asyncHandler(async (req, res: Response) => {
  const user = await authenticateUser(req.body);
  const token = signToken({ userId: user._id.toString() });

  res.cookie("token", token, COOKIE_OPTIONS);
  res.status(200).json({ success: true, data: { user: sanitizeUser(user), token } });
});

export const logout = asyncHandler(async (req, res: Response) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.status(200).json({ success: true, message: "Logged out" });
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.status(200).json({ success: true, data: { user: sanitizeUser(user) } });
});

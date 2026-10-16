import { Response } from "express";
import { AuthRequest } from "@/middleware/auth";
import { asyncHandler } from "@/utils/asyncHandler";
import { Goal } from "@/models/Goal";
import { Notification } from "@/models/Notification";
import { ApiError } from "@/utils/ApiError";

const withProgress = (goal: any) => {
  const percent = goal.targetAmount > 0
    ? Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)
    : 0;

  let estimatedCompletion: string | null = null;
  if (goal.status === "active" && percent < 100 && goal.targetDate) {
    estimatedCompletion = goal.targetDate;
  }

  return { ...goal.toObject(), percent, estimatedCompletion };
};

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const goal = await Goal.create({ ...req.body, userId: req.userId });
  res.status(201).json({ success: true, data: withProgress(goal) });
});

export const list = asyncHandler(async (req: AuthRequest, res: Response) => {
  const goals = await Goal.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: goals.map(withProgress) });
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const goal = await Goal.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!goal) throw new ApiError(404, "Goal not found");
  res.status(200).json({ success: true, data: withProgress(goal) });
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!goal) throw new ApiError(404, "Goal not found");
  res.status(200).json({ success: true, message: "Goal deleted" });
});

const adjustGoal = async (req: AuthRequest, res: Response, sign: 1 | -1) => {
  const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
  if (!goal) throw new ApiError(404, "Goal not found");

  const amount = req.body.amount as number;
  if (sign === -1 && amount > goal.currentAmount) {
    throw new ApiError(400, "Cannot withdraw more than the current saved amount");
  }

  const wasComplete = goal.currentAmount >= goal.targetAmount;
  goal.currentAmount += sign * amount;
  if (goal.currentAmount >= goal.targetAmount) {
    goal.status = "completed";
  } else if (goal.status === "completed") {
    goal.status = "active";
  }
  await goal.save();

  if (!wasComplete && goal.status === "completed") {
    await Notification.create({
      userId: req.userId,
      title: "Goal completed! 🎉",
      message: `You've reached your "${goal.title}" savings goal.`,
      type: "goal",
    });
  }

  res.status(200).json({ success: true, data: withProgress(goal) });
};

export const addMoney = asyncHandler((req: AuthRequest, res: Response) => adjustGoal(req, res, 1));
export const withdrawMoney = asyncHandler((req: AuthRequest, res: Response) =>
  adjustGoal(req, res, -1)
);

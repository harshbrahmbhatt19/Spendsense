import { Types } from "mongoose";
import { Budget, IBudget } from "@/models/Budget";
import { Transaction } from "@/models/Transaction";

export interface BudgetWithProgress {
  budget: IBudget;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: "on_track" | "warning_50" | "warning_75" | "warning_90" | "exceeded";
}

const statusFor = (percentUsed: number): BudgetWithProgress["status"] => {
  if (percentUsed >= 100) return "exceeded";
  if (percentUsed >= 90) return "warning_90";
  if (percentUsed >= 75) return "warning_75";
  if (percentUsed >= 50) return "warning_50";
  return "on_track";
};

export const getBudgetsWithProgress = async (
  userId: string
): Promise<BudgetWithProgress[]> => {
  const budgets = await Budget.find({ userId }).populate("categoryId", "name icon color");

  const results = await Promise.all(
    budgets.map(async (budget) => {
      const query: Record<string, any> = {
        userId: new Types.ObjectId(userId),
        type: "expense",
        date: { $gte: budget.startDate, $lte: budget.endDate },
      };
      if (budget.categoryId) query.categoryId = budget.categoryId;

      const agg = await Transaction.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const spent = agg[0]?.total || 0;
      const percentUsed = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;

      return {
        budget,
        spent,
        remaining: Math.max(budget.amount - spent, 0),
        percentUsed,
        status: statusFor(percentUsed),
      };
    })
  );

  return results;
};

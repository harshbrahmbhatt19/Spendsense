import { Types } from "mongoose";
import { Transaction } from "@/models/Transaction";

const oid = (userId: string) => new Types.ObjectId(userId);

export interface MonthTotals {
  year: number;
  month: number; // 1-12
  income: number;
  expense: number;
  savings: number;
}

const monthRange = (year: number, month: number) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

export const getMonthTotals = async (
  userId: string,
  year: number,
  month: number
): Promise<MonthTotals> => {
  const { start, end } = monthRange(year, month);
  const agg = await Transaction.aggregate([
    {
      $match: {
        userId: oid(userId),
        date: { $gte: start, $lte: end },
        type: { $in: ["income", "expense"] },
      },
    },
    { $group: { _id: "$type", total: { $sum: "$amount" } } },
  ]);

  const income = agg.find((a) => a._id === "income")?.total || 0;
  const expense = agg.find((a) => a._id === "expense")?.total || 0;

  return { year, month, income, expense, savings: income - expense };
};

// Last N months of income/expense/savings totals, oldest first - powers the
// dashboard's income-vs-expense chart and the prediction/health-score logic.
export const getLastNMonths = async (userId: string, n: number): Promise<MonthTotals[]> => {
  const now = new Date();
  const months: { year: number; month: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return Promise.all(months.map((m) => getMonthTotals(userId, m.year, m.month)));
};

export interface CategoryBreakdownItem {
  categoryId: string | null;
  name: string;
  icon: string;
  color: string;
  total: number;
  percent: number;
}

export const getCategoryBreakdown = async (
  userId: string,
  start: Date,
  end: Date,
  type: "income" | "expense" = "expense"
): Promise<CategoryBreakdownItem[]> => {
  const agg = await Transaction.aggregate([
    { $match: { userId: oid(userId), type, date: { $gte: start, $lte: end } } },
    { $group: { _id: "$categoryId", total: { $sum: "$amount" } } },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    { $sort: { total: -1 } },
  ]);

  const grandTotal = agg.reduce((sum, a) => sum + a.total, 0);

  return agg.map((a) => ({
    categoryId: a._id ? a._id.toString() : null,
    name: a.category?.name || "Uncategorized",
    icon: a.category?.icon || "circle-ellipsis",
    color: a.category?.color || "#64748b",
    total: a.total,
    percent: grandTotal > 0 ? Math.round((a.total / grandTotal) * 100) : 0,
  }));
};

export const getSpendingTrend = async (
  userId: string,
  start: Date,
  end: Date,
  granularity: "daily" | "weekly" | "monthly" = "daily"
) => {
  const dateFormat =
    granularity === "monthly" ? "%Y-%m" : granularity === "weekly" ? "%Y-%U" : "%Y-%m-%d";

  const agg = await Transaction.aggregate([
    { $match: { userId: oid(userId), type: "expense", date: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: "$date" } },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return agg.map((a) => ({ period: a._id, total: a.total }));
};

export const getHighestTransactions = async (
  userId: string,
  start: Date,
  end: Date,
  limit = 5
) => {
  return Transaction.find({
    userId: oid(userId),
    type: "expense",
    date: { $gte: start, $lte: end },
  })
    .sort({ amount: -1 })
    .limit(limit)
    .populate("categoryId", "name icon color");
};

export const getAverageDailyExpense = async (userId: string, start: Date, end: Date) => {
  const agg = await Transaction.aggregate([
    { $match: { userId: oid(userId), type: "expense", date: { $gte: start, $lte: end } } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const total = agg[0]?.total || 0;
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  return { total, days, average: Math.round((total / days) * 100) / 100 };
};

export const getWeekdayVsWeekendSpending = async (userId: string, start: Date, end: Date) => {
  const agg = await Transaction.aggregate([
    { $match: { userId: oid(userId), type: "expense", date: { $gte: start, $lte: end } } },
    {
      $project: {
        amount: 1,
        dayOfWeek: { $dayOfWeek: "$date" }, // 1 = Sunday, 7 = Saturday
      },
    },
    {
      $group: {
        _id: { $in: ["$dayOfWeek", [1, 7]] }, // true = weekend
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const weekend = agg.find((a) => a._id === true);
  const weekday = agg.find((a) => a._id === false);

  return {
    weekendTotal: weekend?.total || 0,
    weekendAvgPerDay: weekend ? Math.round((weekend.total / 2) * 100) / 100 : 0,
    weekdayTotal: weekday?.total || 0,
    weekdayAvgPerDay: weekday ? Math.round((weekday.total / 5) * 100) / 100 : 0,
  };
};

// GitHub-style heatmap data: daily expense totals in a date range.
export const getSpendingHeatmap = async (userId: string, start: Date, end: Date) => {
  const agg = await Transaction.aggregate([
    { $match: { userId: oid(userId), type: "expense", date: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  return agg.map((a) => ({ date: a._id, total: a.total }));
};

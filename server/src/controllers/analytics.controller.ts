import { Response } from "express";
import { AuthRequest } from "@/middleware/auth";
import { asyncHandler } from "@/utils/asyncHandler";
import { Account } from "@/models/Account";
import {
  getMonthTotals,
  getLastNMonths,
  getCategoryBreakdown,
  getSpendingTrend,
  getHighestTransactions,
  getAverageDailyExpense,
  getSpendingHeatmap,
} from "@/services/analytics.service";

const currentYearMonth = () => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
};

export const dashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { year, month } = currentYearMonth();
  const prevDate = new Date(year, month - 2, 1);

  const [current, previous, last6Months, accounts] = await Promise.all([
    getMonthTotals(req.userId!, year, month),
    getMonthTotals(req.userId!, prevDate.getFullYear(), prevDate.getMonth() + 1),
    getLastNMonths(req.userId!, 6),
    Account.find({ userId: req.userId }),
  ]);

  const pctChange = (curr: number, prev: number) =>
    prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100);

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  const categoryBreakdown = await getCategoryBreakdown(req.userId!, start, end, "expense");

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const savingsRate =
    current.income > 0 ? Math.round((current.savings / current.income) * 100) : 0;

  res.status(200).json({
    success: true,
    data: {
      totalBalance,
      monthlyIncome: { amount: current.income, changePercent: pctChange(current.income, previous.income) },
      monthlyExpense: { amount: current.expense, changePercent: pctChange(current.expense, previous.expense) },
      monthlySavings: { amount: current.savings, changePercent: pctChange(current.savings, previous.savings), savingsRate },
      last6Months,
      categoryBreakdown,
    },
  });
});

export const overview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const start = req.query.start ? new Date(req.query.start as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const end = req.query.end ? new Date(req.query.end as string) : new Date();

  const [expenseByCategory, incomeByCategory, trend, highest, avgDaily] = await Promise.all([
    getCategoryBreakdown(req.userId!, start, end, "expense"),
    getCategoryBreakdown(req.userId!, start, end, "income"),
    getSpendingTrend(req.userId!, start, end, (req.query.granularity as any) || "daily"),
    getHighestTransactions(req.userId!, start, end, 10),
    getAverageDailyExpense(req.userId!, start, end),
  ]);

  const totalIncome = incomeByCategory.reduce((s, c) => s + c.total, 0);
  const totalExpense = expenseByCategory.reduce((s, c) => s + c.total, 0);
  const totalSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((totalSavings / totalIncome) * 100) : 0;

  res.status(200).json({
    success: true,
    data: {
      range: { start, end },
      totals: { income: totalIncome, expense: totalExpense, savings: totalSavings, savingsRate },
      expenseByCategory,
      incomeByCategory,
      trend,
      highestTransactions: highest,
      averageDailyExpense: avgDaily,
    },
  });
});

export const heatmap = asyncHandler(async (req: AuthRequest, res: Response) => {
  const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);
  const data = await getSpendingHeatmap(req.userId!, start, end);
  res.status(200).json({ success: true, data });
});

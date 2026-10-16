import { Transaction } from "@/models/Transaction";
import {
  getMonthTotals,
  getCategoryBreakdown,
  getHighestTransactions,
} from "@/services/analytics.service";

export interface ReportParams {
  start: Date;
  end: Date;
}

export const buildReport = async (userId: string, { start, end }: ReportParams) => {
  const [expenseByCategory, incomeByCategory, highestExpenses, transactions] = await Promise.all([
    getCategoryBreakdown(userId, start, end, "expense"),
    getCategoryBreakdown(userId, start, end, "income"),
    getHighestTransactions(userId, start, end, 10),
    Transaction.find({ userId, date: { $gte: start, $lte: end } })
      .sort({ date: -1 })
      .populate("categoryId", "name")
      .populate("accountId", "name"),
  ]);

  const totalIncome = incomeByCategory.reduce((s, c) => s + c.total, 0);
  const totalExpense = expenseByCategory.reduce((s, c) => s + c.total, 0);

  return {
    range: { start, end },
    summary: {
      totalIncome,
      totalExpense,
      totalSavings: totalIncome - totalExpense,
      savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0,
    },
    expenseByCategory,
    incomeByCategory,
    highestExpenses,
    transactions,
  };
};

export const buildMonthlyReport = (userId: string, year: number, month: number) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return buildReport(userId, { start, end });
};

export const buildYearlyReport = (userId: string, year: number) => {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);
  return buildReport(userId, { start, end });
};

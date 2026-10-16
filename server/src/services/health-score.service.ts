import { getLastNMonths } from "@/services/analytics.service";
import { getBudgetsWithProgress } from "@/services/budget.service";

interface ScoreComponent {
  label: string;
  score: number; // 0-100
  weight: number;
  rating: "Excellent" | "Good" | "Average" | "Needs Attention";
}

const ratingFor = (score: number): ScoreComponent["rating"] => {
  if (score >= 85) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 40) return "Average";
  return "Needs Attention";
};

const statusFor = (score: number) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Improvement";
};

export const calculateFinancialHealthScore = async (userId: string) => {
  const months = await getLastNMonths(userId, 6);
  const monthsWithIncome = months.filter((m) => m.income > 0);

  // 1. Savings rate: average savings/income across recent months with income.
  const avgSavingsRate =
    monthsWithIncome.length > 0
      ? monthsWithIncome.reduce((sum, m) => sum + m.savings / m.income, 0) / monthsWithIncome.length
      : 0;
  // Map a 20% savings rate to ~100, scaled linearly, capped at 100 and floored at 0.
  const savingsScore = Math.max(0, Math.min(100, Math.round((avgSavingsRate / 0.2) * 100)));

  // 2. Budget adherence: percentage of budgets currently within limit (not exceeded).
  const budgets = await getBudgetsWithProgress(userId);
  const budgetScore =
    budgets.length > 0
      ? Math.round((budgets.filter((b) => b.status !== "exceeded").length / budgets.length) * 100)
      : 70; // neutral default when no budgets are set up yet

  // 3. Expense consistency: lower month-to-month variability scores higher.
  const expenses = months.map((m) => m.expense).filter((e) => e > 0);
  let consistencyScore = 70;
  if (expenses.length >= 2) {
    const mean = expenses.reduce((s, e) => s + e, 0) / expenses.length;
    const variance = expenses.reduce((s, e) => s + Math.pow(e - mean, 2), 0) / expenses.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;
    // Lower variation = higher score. 0 variation -> 100, 60%+ variation -> 0.
    consistencyScore = Math.max(0, Math.min(100, Math.round(100 - coefficientOfVariation * 166)));
  }

  // 4. Emergency savings proxy: current month's savings relative to average monthly expense.
  const avgExpense =
    expenses.length > 0 ? expenses.reduce((s, e) => s + e, 0) / expenses.length : 0;
  const latestMonth = months[months.length - 1];
  const emergencyMonthsCovered = avgExpense > 0 ? latestMonth.savings / avgExpense : 0;
  // 3+ months of expenses covered by recent savings -> full score.
  const emergencyScore = Math.max(0, Math.min(100, Math.round((emergencyMonthsCovered / 3) * 100)));

  const components: Record<string, ScoreComponent> = {
    savings: { label: "Savings", score: savingsScore, weight: 0.35, rating: ratingFor(savingsScore) },
    budgetDiscipline: { label: "Budget Discipline", score: budgetScore, weight: 0.25, rating: ratingFor(budgetScore) },
    spendingControl: { label: "Spending Control", score: consistencyScore, weight: 0.25, rating: ratingFor(consistencyScore) },
    emergencySavings: { label: "Emergency Savings", score: emergencyScore, weight: 0.15, rating: ratingFor(emergencyScore) },
  };

  const overall = Math.round(
    Object.values(components).reduce((sum, c) => sum + c.score * c.weight, 0)
  );

  return {
    score: overall,
    status: statusFor(overall),
    breakdown: components,
    explanation: [
      `Savings: based on your average savings rate of ${Math.round(avgSavingsRate * 100)}% over the last ${monthsWithIncome.length} month(s) with income.`,
      `Budget Discipline: ${budgets.length > 0 ? `${budgets.filter((b) => b.status !== "exceeded").length} of ${budgets.length} budgets are within limit.` : "No budgets set up yet."}`,
      `Spending Control: measures how consistent your monthly expenses have been over the last 6 months.`,
      `Emergency Savings: estimates how many months of expenses your current savings could cover.`,
    ],
  };
};

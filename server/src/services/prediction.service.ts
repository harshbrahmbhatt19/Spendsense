import { getLastNMonths, getCategoryBreakdown } from "@/services/analytics.service";

// Simple statistical prediction: average of the last 3 months. The function
// signature deliberately returns a plain breakdown so a future ML model can
// replace the body without touching callers.
export const predictNextMonthExpense = async (userId: string) => {
  const months = await getLastNMonths(userId, 3);
  const validMonths = months.filter((m) => m.expense > 0);
  const total = validMonths.reduce((sum, m) => sum + m.expense, 0);
  const predictedTotal = validMonths.length > 0 ? Math.round(total / validMonths.length) : 0;

  // Category-level prediction: average each category's spend over the same 3 months.
  const now = new Date();
  const breakdowns = await Promise.all(
    [0, 1, 2].map((i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      return getCategoryBreakdown(userId, start, end, "expense");
    })
  );

  const categoryTotals = new Map<string, { name: string; icon: string; color: string; sum: number; count: number }>();
  for (const monthBreakdown of breakdowns) {
    for (const cat of monthBreakdown) {
      const key = cat.categoryId || "uncategorized";
      const existing = categoryTotals.get(key) || {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        sum: 0,
        count: 0,
      };
      existing.sum += cat.total;
      existing.count += 1;
      categoryTotals.set(key, existing);
    }
  }

  const categoryPredictions = Array.from(categoryTotals.entries())
    .map(([categoryId, v]) => ({
      categoryId,
      name: v.name,
      icon: v.icon,
      color: v.color,
      predictedAmount: Math.round(v.sum / 3),
    }))
    .sort((a, b) => b.predictedAmount - a.predictedAmount);

  return {
    predictedTotal,
    basedOnMonths: validMonths.length,
    categoryPredictions,
  };
};

import {
  getMonthTotals,
  getCategoryBreakdown,
  getWeekdayVsWeekendSpending,
} from "@/services/analytics.service";
import { getBudgetsWithProgress } from "@/services/budget.service";

export interface Insight {
  icon: string;
  title: string;
  description: string;
  level: "info" | "warning" | "positive" | "critical";
}

export const generateInsights = async (userId: string): Promise<Insight[]> => {
  const insights: Insight[] = [];
  const now = new Date();
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [current, previous] = await Promise.all([
    getMonthTotals(userId, now.getFullYear(), now.getMonth() + 1),
    getMonthTotals(userId, prevDate.getFullYear(), prevDate.getMonth() + 1),
  ]);

  // Month-over-month expense change
  if (previous.expense > 0) {
    const changePct = Math.round(((current.expense - previous.expense) / previous.expense) * 100);
    if (changePct >= 15) {
      insights.push({
        icon: "trending-up",
        title: "Spending is up this month",
        description: `You've spent ${changePct}% more than last month so far.`,
        level: "warning",
      });
    } else if (changePct <= -15) {
      insights.push({
        icon: "trending-down",
        title: "Spending is down this month",
        description: `You've spent ${Math.abs(changePct)}% less than last month so far. Nice work.`,
        level: "positive",
      });
    }
  }

  // Savings comparison
  if (current.savings > previous.savings && previous.income > 0) {
    insights.push({
      icon: "piggy-bank",
      title: "Savings increased",
      description: `Your savings this month (₹${current.savings.toLocaleString()}) are ahead of last month (₹${previous.savings.toLocaleString()}).`,
      level: "positive",
    });
  }

  // Top spending category
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const categoryBreakdown = await getCategoryBreakdown(userId, start, now, "expense");
  if (categoryBreakdown.length > 0) {
    const top = categoryBreakdown[0];
    insights.push({
      icon: "bar-chart-3",
      title: `${top.name} is your highest spending category`,
      description: `You've spent ₹${top.total.toLocaleString()} on ${top.name} this month, ${top.percent}% of total expenses.`,
      level: "info",
    });
  }

  // Weekend vs weekday spending
  const weekdayVsWeekend = await getWeekdayVsWeekendSpending(userId, start, now);
  if (weekdayVsWeekend.weekendAvgPerDay > weekdayVsWeekend.weekdayAvgPerDay * 1.3 && weekdayVsWeekend.weekendTotal > 0) {
    insights.push({
      icon: "calendar",
      title: "Weekend spending is higher",
      description: "Your average daily spending on weekends is notably higher than on weekdays.",
      level: "info",
    });
  }

  // Budget thresholds
  const budgets = await getBudgetsWithProgress(userId);
  for (const b of budgets) {
    const categoryName = (b.budget as any).categoryId?.name || "your overall budget";
    if (b.status === "exceeded") {
      insights.push({
        icon: "alert-triangle",
        title: `${categoryName} budget exceeded`,
        description: `You've used ${b.percentUsed}% of your ${categoryName} budget.`,
        level: "critical",
      });
    } else if (b.status === "warning_90" || b.status === "warning_75") {
      insights.push({
        icon: "alert-circle",
        title: `Close to your ${categoryName} budget limit`,
        description: `You've used ${b.percentUsed}% of your ${categoryName} budget (₹${b.spent.toLocaleString()} of ₹${b.budget.amount.toLocaleString()}).`,
        level: "warning",
      });
    }
  }

  return insights;
};

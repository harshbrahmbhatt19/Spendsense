import { useEffect, useState } from "react";
import { analyticsService, insightsService } from "@/services/insightsService";
import { transactionService } from "@/services/financeService";
import type { DashboardData, Insight, Transaction } from "@/types";
import { StatCard } from "@/components/dashboard/StatCard";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { CategoryDonut } from "@/components/dashboard/CategoryDonut";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { TransactionRow } from "@/components/transactions/TransactionRow";
import { CardSkeleton, EmptyState, ErrorState, Skeleton } from "@/components/common/States";
import { getErrorMessage } from "@/services/api";
import { Receipt } from "lucide-react";
import { Link } from "react-router-dom";

export const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [dashRes, insightsRes, txRes] = await Promise.all([
          analyticsService.dashboard(),
          insightsService.list(),
          transactionService.list({ limit: 5, sortBy: "date", sortOrder: "desc" }),
        ]);
        if (!mounted) return;
        setData(dashRes.data.data);
        setInsights(insightsRes.data.data);
        setRecent(txRes.data.items);
        setError("");
      } catch (err) {
        if (mounted) setError(getErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const refresh = () => {
      if (document.visibilityState === "visible") void load();
    };
    void load();
    const interval = window.setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    window.addEventListener("spendsense:data-changed", refresh);
    return () => {
      mounted = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("spendsense:data-changed", refresh);
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Dashboard</h1>
        <p className="text-sm text-muted">Your financial overview for this month.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total balance" amount={data.totalBalance} emphasis />
        <StatCard
          label="Monthly income"
          amount={data.monthlyIncome.amount}
          changePercent={data.monthlyIncome.changePercent}
        />
        <StatCard
          label="Monthly expenses"
          amount={data.monthlyExpense.amount}
          changePercent={data.monthlyExpense.changePercent}
        />
        <StatCard
          label="Monthly savings"
          amount={data.monthlySavings.amount}
          changePercent={data.monthlySavings.changePercent}
          sub={`${data.monthlySavings.savingsRate}% savings rate`}
        />
      </div>

      {insights.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-lg">Insights</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {insights.slice(0, 4).map((i, idx) => (
              <InsightCard key={idx} insight={i} />
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-line p-4">
          <h2 className="mb-3 font-display text-lg">Income vs Expenses</h2>
          <IncomeExpenseChart data={data.last6Months} />
        </div>
        <div className="rounded-xl border border-line p-4">
          <h2 className="mb-3 font-display text-lg">Expense by category</h2>
          <CategoryDonut data={data.categoryBreakdown} />
        </div>
      </div>

      <div className="rounded-xl border border-line p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-lg">Recent transactions</h2>
          <Link to="/app/transactions" className="text-sm text-emerald hover:underline">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No transactions yet"
            description="Start tracking your spending by adding your first transaction."
          />
        ) : (
          <div>
            {recent.map((t) => (
              <TransactionRow key={t._id} transaction={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

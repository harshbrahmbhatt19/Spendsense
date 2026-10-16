import { useEffect, useState } from "react";
import { analyticsService, predictionService, healthScoreService } from "@/services/insightsService";
import { CategoryDonut } from "@/components/dashboard/CategoryDonut";
import { ErrorState, Skeleton } from "@/components/common/States";
import { formatMoney, formatDate } from "@/utils/format";
import { getErrorMessage } from "@/services/api";
import { cn } from "@/utils/format";

export const AnalyticsPage = () => {
  const [overview, setOverview] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<{ date: string; total: number }[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  const [healthScore, setHealthScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      analyticsService.overview(),
      analyticsService.heatmap(),
      predictionService.get(),
      healthScoreService.get(),
    ])
      .then(([o, h, p, s]) => {
        setOverview(o.data.data);
        setHeatmap(h.data.data);
        setPrediction(p.data.data);
        setHealthScore(s.data.data);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (error) return <ErrorState message={error} />;
  if (!overview) return null;

  const maxHeat = Math.max(1, ...heatmap.map((h) => h.total));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Analytics</h1>
        <p className="text-sm text-muted">Deeper look at your spending this month.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-line p-4">
          <p className="text-sm text-muted">Total income</p>
          <p className="font-display text-xl tabular">{formatMoney(overview.totals.income)}</p>
        </div>
        <div className="rounded-xl border border-line p-4">
          <p className="text-sm text-muted">Total expenses</p>
          <p className="font-display text-xl tabular">{formatMoney(overview.totals.expense)}</p>
        </div>
        <div className="rounded-xl border border-line p-4">
          <p className="text-sm text-muted">Savings rate</p>
          <p className="font-display text-xl tabular">{overview.totals.savingsRate}%</p>
        </div>
        <div className="rounded-xl border border-line p-4">
          <p className="text-sm text-muted">Avg daily expense</p>
          <p className="font-display text-xl tabular">{formatMoney(overview.averageDailyExpense.average)}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-line p-4">
          <h2 className="mb-3 font-display text-lg">Expense by category</h2>
          <CategoryDonut data={overview.expenseByCategory} />
        </div>

        {healthScore && (
          <div className="rounded-xl border border-line p-4">
            <h2 className="mb-3 font-display text-lg">Financial health score</h2>
            <div className="flex items-center gap-4">
              <div className="flex size-20 shrink-0 items-center justify-center rounded-full border-4 border-emerald font-display text-2xl">
                {healthScore.score}
              </div>
              <div>
                <p className="font-medium">{healthScore.status}</p>
                <p className="text-sm text-muted">out of 100</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {Object.values(healthScore.breakdown).map((c: any) => (
                <div key={c.label} className="flex items-center justify-between text-sm">
                  <span className="text-ink/80">{c.label}</span>
                  <span
                    className={cn(
                      "font-medium",
                      c.rating === "Excellent" || c.rating === "Good" ? "text-emerald" : "text-amber"
                    )}
                  >
                    {c.rating}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {prediction && (
        <div className="rounded-xl border border-line p-4">
          <h2 className="font-display text-lg">Predicted next month expenses</h2>
          <p className="mt-1 font-display text-3xl tabular text-emerald">{formatMoney(prediction.predictedTotal)}</p>
          <p className="text-xs text-muted">Based on the average of your last {prediction.basedOnMonths} month(s)</p>
          {prediction.categoryPredictions.length > 0 && (
            <div className="mt-4 space-y-2">
              {prediction.categoryPredictions.slice(0, 5).map((c: any) => (
                <div key={c.categoryId} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </span>
                  <span className="tabular">{formatMoney(c.predictedAmount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-line p-4">
        <h2 className="mb-3 font-display text-lg">Spending heatmap</h2>
        {heatmap.length === 0 ? (
          <p className="text-sm text-muted">No spending recorded yet this year.</p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {heatmap.map((d) => {
              const intensity = d.total / maxHeat;
              return (
                <div
                  key={d.date}
                  title={`${formatDate(d.date)}: ${formatMoney(d.total)}`}
                  className="size-3 rounded-sm"
                  style={{
                    backgroundColor:
                      intensity === 0
                        ? "#e2ded3"
                        : `rgba(15, 107, 76, ${0.25 + intensity * 0.75})`,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {overview.highestTransactions.length > 0 && (
        <div className="rounded-xl border border-line p-4">
          <h2 className="mb-3 font-display text-lg">Highest transactions</h2>
          <div className="space-y-2">
            {overview.highestTransactions.map((t: any) => (
              <div key={t._id} className="flex items-center justify-between text-sm">
                <span>{t.title}</span>
                <span className="tabular font-medium">{formatMoney(t.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import { useEffect, useState } from "react";
import { budgetService, goalService } from "@/services/planningService";
import { categoryService } from "@/services/financeService";
import type { BudgetProgress, Category, Goal } from "@/types";
import { EmptyState, ErrorState, Skeleton } from "@/components/common/States";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { formatMoney, formatDate, cn } from "@/utils/format";
import { useToastStore } from "@/store/toastStore";
import { getErrorMessage } from "@/services/api";
import { Target, PiggyBank, Plus, X, Trash2 } from "lucide-react";

const STATUS_COLOR: Record<BudgetProgress["status"], string> = {
  on_track: "bg-emerald",
  warning_50: "bg-emerald",
  warning_75: "bg-amber",
  warning_90: "bg-amber",
  exceeded: "bg-brick",
};

export const BudgetsGoalsPage = () => {
  const [tab, setTab] = useState<"budgets" | "goals">("budgets");
  const [budgets, setBudgets] = useState<BudgetProgress[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [deleteBudget, setDeleteBudget] = useState<BudgetProgress | null>(null);
  const [deleteGoal, setDeleteGoal] = useState<Goal | null>(null);
  const push = useToastStore((s) => s.push);

  const load = () => {
    setLoading(true);
    Promise.all([budgetService.list(), goalService.list(), categoryService.list("expense")])
      .then(([b, g, c]) => {
        setBudgets(b.data.data);
        setGoals(g.data.data);
        setCategories(c.data.data);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDeleteBudget = async () => {
    if (!deleteBudget) return;
    await budgetService.remove(deleteBudget.budget._id);
    push("Budget deleted", "success");
    setDeleteBudget(null);
    load();
  };

  const handleDeleteGoal = async () => {
    if (!deleteGoal) return;
    await goalService.remove(deleteGoal._id);
    push("Goal deleted", "success");
    setDeleteGoal(null);
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl">Budgets & Goals</h1>
        <p className="text-sm text-muted">Set limits and track what you're saving for.</p>
      </div>

      <div className="flex rounded-lg border border-line p-1 w-fit">
        <button
          onClick={() => setTab("budgets")}
          className={cn("rounded-md px-4 py-1.5 text-sm", tab === "budgets" ? "bg-emerald text-white" : "text-muted")}
        >
          Budgets
        </button>
        <button
          onClick={() => setTab("goals")}
          className={cn("rounded-md px-4 py-1.5 text-sm", tab === "goals" ? "bg-emerald text-white" : "text-muted")}
        >
          Goals
        </button>
      </div>

      {error && <ErrorState message={error} />}

      {tab === "budgets" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={() => setShowBudgetForm(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald px-3 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              <Plus size={14} /> New budget
            </button>
          </div>

          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : budgets.length === 0 ? (
            <EmptyState icon={Target} title="No budgets set up" description="Create a budget to track spending against a limit." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {budgets.map((b) => (
                <div key={b.budget._id} className="rounded-xl border border-line p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{b.budget.categoryId?.name || "Overall budget"}</p>
                      <p className="text-xs text-muted capitalize">{b.budget.period}</p>
                    </div>
                    <button onClick={() => setDeleteBudget(b)} className="text-muted hover:text-brick">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between text-sm tabular">
                    <span>{formatMoney(b.spent)}</span>
                    <span className="text-muted">of {formatMoney(b.budget.amount)}</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-paper-dim">
                    <div
                      className={cn("h-full rounded-full", STATUS_COLOR[b.status])}
                      style={{ width: `${Math.min(b.percentUsed, 100)}%` }}
                    />
                  </div>
                  <p className={cn("mt-1.5 text-xs", b.status === "exceeded" ? "text-brick" : "text-muted")}>
                    {b.percentUsed}% used · {formatMoney(b.remaining)} remaining
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "goals" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={() => setShowGoalForm(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald px-3 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              <Plus size={14} /> New goal
            </button>
          </div>

          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : goals.length === 0 ? (
            <EmptyState icon={PiggyBank} title="No savings goals yet" description="Set a target and start tracking progress." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {goals.map((g) => (
                <GoalCard key={g._id} goal={g} onChanged={load} onDelete={() => setDeleteGoal(g)} />
              ))}
            </div>
          )}
        </div>
      )}

      {showBudgetForm && (
        <BudgetFormModal
          categories={categories}
          onClose={() => setShowBudgetForm(false)}
          onSaved={() => {
            load();
            push("Budget created", "success");
          }}
        />
      )}
      {showGoalForm && (
        <GoalFormModal
          onClose={() => setShowGoalForm(false)}
          onSaved={() => {
            load();
            push("Goal created", "success");
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteBudget}
        title="Delete budget?"
        description="This will remove the budget limit. Past spending isn't affected."
        onConfirm={handleDeleteBudget}
        onCancel={() => setDeleteBudget(null)}
      />
      <ConfirmDialog
        open={!!deleteGoal}
        title="Delete goal?"
        description={`"${deleteGoal?.title}" and its progress will be removed.`}
        onConfirm={handleDeleteGoal}
        onCancel={() => setDeleteGoal(null)}
      />
    </div>
  );
};

const GoalCard = ({ goal, onChanged, onDelete }: { goal: Goal; onChanged: () => void; onDelete: () => void }) => {
  const [amount, setAmount] = useState("");
  const push = useToastStore((s) => s.push);

  const addMoney = async () => {
    if (!amount || Number(amount) <= 0) return;
    try {
      await goalService.addMoney(goal._id, Number(amount));
      setAmount("");
      onChanged();
      push("Added to goal", "success");
    } catch (err) {
      push(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="rounded-xl border border-line p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium">{goal.title}</p>
          {goal.targetDate && <p className="text-xs text-muted">Target: {formatDate(goal.targetDate)}</p>}
        </div>
        <div className="flex items-center gap-2">
          {goal.status === "completed" && (
            <span className="rounded-full bg-emerald-soft px-2 py-0.5 text-xs text-emerald">Completed 🎉</span>
          )}
          <button onClick={onDelete} className="text-muted hover:text-brick">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between text-sm tabular">
        <span>{formatMoney(goal.currentAmount)}</span>
        <span className="text-muted">of {formatMoney(goal.targetAmount)}</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-paper-dim">
        <div className="h-full rounded-full bg-emerald" style={{ width: `${goal.percent}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-muted">{goal.percent}% saved</p>

      {goal.status !== "completed" && (
        <div className="mt-3 flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="w-full rounded-lg border border-line bg-white px-3 py-1.5 text-sm tabular outline-none focus:border-emerald"
          />
          <button onClick={addMoney} className="shrink-0 rounded-lg bg-emerald px-3 py-1.5 text-sm text-white hover:opacity-90">
            Add
          </button>
        </div>
      )}
    </div>
  );
};

const BudgetFormModal = ({
  categories,
  onClose,
  onSaved,
}: {
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) => {
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a positive amount.");
      return;
    }
    const now = new Date();
    const startDate = period === "monthly" ? new Date(now.getFullYear(), now.getMonth(), 1) : new Date(now.getFullYear(), 0, 1);
    const endDate =
      period === "monthly"
        ? new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        : new Date(now.getFullYear(), 11, 31, 23, 59, 59);

    setSaving(true);
    try {
      await budgetService.create({
        categoryId: categoryId || undefined,
        amount: Number(amount),
        period,
        startDate,
        endDate,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center">
      <div className="w-full max-w-sm rounded-t-2xl border border-line bg-paper p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl">New budget</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {error && <div className="rounded-lg border border-brick/30 bg-brick-soft px-3 py-2 text-sm text-brick">{error}</div>}
          <div>
            <label className="mb-1 block text-sm text-muted">Category (optional — overall if blank)</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
            >
              <option value="">Overall budget</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm tabular outline-none focus:border-emerald"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as "monthly" | "yearly")}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-emerald py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Create budget"}
          </button>
        </form>
      </div>
    </div>
  );
};

const GoalFormModal = ({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) => {
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount || Number(targetAmount) <= 0) {
      setError("Please enter a goal name and a positive target amount.");
      return;
    }
    setSaving(true);
    try {
      await goalService.create({
        title: title.trim(),
        targetAmount: Number(targetAmount),
        targetDate: targetDate || undefined,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center">
      <div className="w-full max-w-sm rounded-t-2xl border border-line bg-paper p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl">New savings goal</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {error && <div className="rounded-lg border border-brick/30 bg-brick-soft px-3 py-2 text-sm text-brick">{error}</div>}
          <div>
            <label className="mb-1 block text-sm text-muted">Goal name</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. MacBook Pro"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Target amount</label>
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm tabular outline-none focus:border-emerald"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Target date (optional)</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-emerald py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Create goal"}
          </button>
        </form>
      </div>
    </div>
  );
};

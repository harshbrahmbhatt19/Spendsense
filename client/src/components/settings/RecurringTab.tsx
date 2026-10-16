import { useEffect, useState } from "react";
import { recurringService } from "@/services/planningService";
import { accountService, categoryService } from "@/services/financeService";
import type { Account, Category, RecurringTransaction } from "@/types";
import { useToastStore } from "@/store/toastStore";
import { getErrorMessage } from "@/services/api";
import { EmptyState, Skeleton } from "@/components/common/States";
import { formatMoney, formatDate, cn } from "@/utils/format";
import { Repeat, Plus, X, Trash2 } from "lucide-react";

const FREQUENCIES = ["daily", "weekly", "monthly", "yearly"] as const;

export const RecurringTab = () => {
  const [rules, setRules] = useState<RecurringTransaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const push = useToastStore((s) => s.push);

  const load = () => {
    setLoading(true);
    Promise.all([recurringService.list(), accountService.list(), categoryService.list()])
      .then(([r, a, c]) => {
        setRules(r.data.data);
        setAccounts(a.data.data);
        setCategories(c.data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggle = async (id: string) => {
    try {
      await recurringService.toggle(id);
      load();
    } catch (err) {
      push(getErrorMessage(err), "error");
    }
  };

  const remove = async (id: string) => {
    try {
      await recurringService.remove(id);
      push("Recurring item deleted", "success");
      load();
    } catch (err) {
      push(getErrorMessage(err), "error");
    }
  };

  if (loading) return <Skeleton className="h-40 w-full" />;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 rounded-lg bg-emerald px-3 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus size={14} /> New recurring
        </button>
      </div>

      {rules.length === 0 ? (
        <EmptyState icon={Repeat} title="No recurring transactions" description="Set up subscriptions, rent, or salary to auto-generate each period." />
      ) : (
        <div className="rounded-xl border border-line p-4">
          {rules.map((r) => (
            <div key={r._id} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{r.title}</p>
                <p className="text-xs text-muted capitalize">
                  {r.frequency} · Next: {formatDate(r.nextOccurrence)}
                </p>
              </div>
              <span className={cn("tabular text-sm", r.type === "income" ? "text-emerald" : "text-ink")}>
                {formatMoney(r.amount)}
              </span>
              <button
                onClick={() => toggle(r._id)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs",
                  r.active ? "bg-emerald-soft text-emerald" : "bg-paper-dim text-muted"
                )}
              >
                {r.active ? "Active" : "Paused"}
              </button>
              <button onClick={() => remove(r._id)} className="text-muted hover:text-brick">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <RecurringFormModal
          accounts={accounts}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            load();
            push("Recurring transaction created", "success");
          }}
        />
      )}
    </div>
  );
};

const RecurringFormModal = ({
  accounts,
  categories,
  onClose,
  onSaved,
}: {
  accounts: Account[];
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [frequency, setFrequency] = useState<(typeof FREQUENCIES)[number]>("monthly");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredCategories = categories.filter((c) => c.type === type);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0 || !accountId) {
      setError("Please fill in title, a positive amount, and an account.");
      return;
    }
    setSaving(true);
    try {
      await recurringService.create({
        title: title.trim(),
        amount: Number(amount),
        type,
        accountId,
        categoryId: categoryId || undefined,
        frequency,
        startDate,
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
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-t-2xl border border-line bg-paper p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl">New recurring transaction</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {error && <div className="rounded-lg border border-brick/30 bg-brick-soft px-3 py-2 text-sm text-brick">{error}</div>}
          <div>
            <label className="mb-1 block text-sm text-muted">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Netflix subscription"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
            />
          </div>
          <div className="flex rounded-lg border border-line p-1">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 rounded-md py-1.5 text-sm capitalize ${
                  type === t ? "bg-emerald text-white" : "text-muted"
                }`}
              >
                {t}
              </button>
            ))}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-muted">Account</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
              >
                <option value="">Select</option>
                {accounts.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
              >
                <option value="">None</option>
                {filteredCategories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-muted">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm capitalize outline-none focus:border-emerald"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-emerald py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
};

import { useEffect, useState } from "react";
import { reminderService } from "@/services/planningService";
import type { Reminder } from "@/types";
import { useToastStore } from "@/store/toastStore";
import { getErrorMessage } from "@/services/api";
import { EmptyState, Skeleton } from "@/components/common/States";
import { formatMoney, formatDate, cn } from "@/utils/format";
import { Bell, Plus, X, Check } from "lucide-react";

export const RemindersTab = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const push = useToastStore((s) => s.push);

  const load = () => {
    setLoading(true);
    reminderService.list().then((res) => setReminders(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const markPaid = async (id: string) => {
    try {
      await reminderService.markPaid(id);
      push("Marked as paid", "success");
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
          <Plus size={14} /> New reminder
        </button>
      </div>

      {reminders.length === 0 ? (
        <EmptyState icon={Bell} title="No bill reminders" description="Add electricity, rent, or subscription due dates." />
      ) : (
        <div className="rounded-xl border border-line p-4">
          {reminders.map((r) => (
            <div key={r._id} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{r.title}</p>
                <p
                  className={cn(
                    "text-xs",
                    r.status === "overdue" ? "text-brick" : "text-muted"
                  )}
                >
                  {r.status === "overdue" ? "Overdue" : "Due"} {formatDate(r.dueDate)}
                </p>
              </div>
              <span className="tabular text-sm">{formatMoney(r.amount)}</span>
              {r.status === "paid" ? (
                <span className="rounded-full bg-emerald-soft px-2.5 py-1 text-xs text-emerald">Paid</span>
              ) : (
                <button
                  onClick={() => markPaid(r._id)}
                  className="flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-xs hover:bg-paper-dim"
                >
                  <Check size={12} /> Mark paid
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ReminderFormModal
          onClose={() => setShowForm(false)}
          onSaved={() => {
            load();
            push("Reminder created", "success");
          }}
        />
      )}
    </div>
  );
};

const ReminderFormModal = ({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0 || !dueDate) {
      setError("Please fill in all fields.");
      return;
    }
    setSaving(true);
    try {
      await reminderService.create({ title: title.trim(), amount: Number(amount), dueDate });
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
          <h2 className="font-display text-xl">New reminder</h2>
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
              placeholder="e.g. Electricity bill"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
            />
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
            <label className="mb-1 block text-sm text-muted">Due date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-emerald py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add reminder"}
          </button>
        </form>
      </div>
    </div>
  );
};

import { useEffect, useState } from "react";
import { categoryService } from "@/services/financeService";
import type { Category } from "@/types";
import { useToastStore } from "@/store/toastStore";
import { getErrorMessage } from "@/services/api";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Skeleton } from "@/components/common/States";
import { Plus, Trash2, X } from "lucide-react";

const COLORS = ["#0f6b4c", "#d98e3b", "#c4433d", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6", "#f97316"];

export const CategoriesTab = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const push = useToastStore((s) => s.push);

  const load = () => {
    setLoading(true);
    categoryService.list().then((res) => setCategories(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await categoryService.remove(deleteTarget._id);
      push("Category deleted", "success");
      setDeleteTarget(null);
      load();
    } catch (err) {
      push(getErrorMessage(err), "error");
    }
  };

  const expense = categories.filter((c) => c.type === "expense");
  const income = categories.filter((c) => c.type === "income");

  if (loading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 rounded-lg bg-emerald px-3 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <Plus size={14} /> New category
        </button>
      </div>

      <CategoryGroup title="Expense categories" items={expense} onDelete={setDeleteTarget} />
      <CategoryGroup title="Income categories" items={income} onDelete={setDeleteTarget} />

      {showForm && (
        <CategoryFormModal
          onClose={() => setShowForm(false)}
          onSaved={() => {
            load();
            push("Category created", "success");
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete category?"
        description="Categories in use by transactions or budgets can't be deleted."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

const CategoryGroup = ({
  title,
  items,
  onDelete,
}: {
  title: string;
  items: Category[];
  onDelete: (c: Category) => void;
}) => (
  <div>
    <h3 className="mb-2 text-sm font-medium text-muted">{title}</h3>
    <div className="flex flex-wrap gap-2">
      {items.map((c) => (
        <div
          key={c._id}
          className="flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm"
        >
          <span className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} />
          {c.name}
          {!c.isDefault && (
            <button onClick={() => onDelete(c)} className="text-muted hover:text-brick">
              <Trash2 size={12} />
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
);

const CategoryFormModal = ({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a category name.");
      return;
    }
    setSaving(true);
    try {
      await categoryService.create({ name: name.trim(), type, color, icon: "circle" });
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
          <h2 className="font-display text-xl">New category</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {error && <div className="rounded-lg border border-brick/30 bg-brick-soft px-3 py-2 text-sm text-brick">{error}</div>}
          <div>
            <label className="mb-1 block text-sm text-muted">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            <label className="mb-1 block text-sm text-muted">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="size-7 rounded-full"
                  style={{ backgroundColor: c, outline: color === c ? "2px solid #14181b" : "none", outlineOffset: 2 }}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-emerald py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Create category"}
          </button>
        </form>
      </div>
    </div>
  );
};

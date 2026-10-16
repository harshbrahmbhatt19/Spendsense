import { useEffect, useRef, useState } from "react";
import { Loader2, ScanLine, X } from "lucide-react";
import { accountService, aiService, categoryService, transactionService } from "@/services/financeService";
import type { Account, Category, PaymentMethod, Transaction, TransactionType } from "@/types";
import { useToastStore } from "@/store/toastStore";
import { getErrorMessage } from "@/services/api";

interface AddTransactionModalProps {
  onClose: () => void;
  onSaved?: () => void;
  editing?: Transaction;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

export const AddTransactionModal = ({ onClose, onSaved, editing }: AddTransactionModalProps) => {
  const [type, setType] = useState<TransactionType>(editing?.type || "expense");
  const [title, setTitle] = useState(editing?.title || "");
  const [amount, setAmount] = useState(editing?.amount?.toString() || "");
  const [categoryId, setCategoryId] = useState(
    typeof editing?.categoryId === "object" ? editing.categoryId._id : editing?.categoryId || ""
  );
  const [accountId, setAccountId] = useState(
    typeof editing?.accountId === "object" ? editing.accountId._id : editing?.accountId || ""
  );
  const [toAccountId, setToAccountId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(editing?.paymentMethod || "cash");
  const [date, setDate] = useState(
    editing?.date ? editing.date.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState(editing?.notes || "");

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const push = useToastStore((s) => s.push);

  useEffect(() => {
    accountService.list().then((res) => setAccounts(res.data.data));
  }, []);

  useEffect(() => {
    if (type === "transfer") return;
    setCategoriesLoading(true);
    categoryService
      .list(type)
      .then((res) => setCategories(res.data.data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setCategoriesLoading(false));
  }, [type]);

  const scanReceipt = async (file?: File) => {
    if (!file) return;
    setError("");
    setScanning(true);
    try {
      const result = await aiService.scanReceipt(file);
      const receipt = result.data.data;
      setTitle(receipt.title);
      setAmount(String(receipt.amount));
      if (receipt.date) setDate(receipt.date);
      if (receipt.paymentMethod) setPaymentMethod(receipt.paymentMethod);
      if (receipt.notes) setNotes(receipt.notes);
      push("Receipt scanned. Review the details before saving.", "success");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setScanning(false);
      if (receiptInputRef.current) receiptInputRef.current.value = "";
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !amount || Number(amount) <= 0 || !accountId) {
      setError("Please fill in the title, a positive amount, and an account.");
      return;
    }
    if (type === "transfer" && !toAccountId) {
      setError("Please choose a destination account for the transfer.");
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        title: title.trim(),
        amount: Number(amount),
        type,
        accountId,
        paymentMethod,
        date,
        notes,
      };
      if (type !== "transfer" && categoryId) payload.categoryId = categoryId;
      if (type === "transfer") payload.toAccountId = toAccountId;

      if (editing) {
        await transactionService.update(editing._id, payload);
        push("Transaction updated", "success");
      } else {
        await transactionService.create(payload);
        push("Transaction added", "success");
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-line bg-paper p-5 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl">{editing ? "Edit transaction" : "Add transaction"}</h2>
          <div className="flex items-center gap-3">
            {!editing && (
              <>
                <input
                  ref={receiptInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => scanReceipt(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => receiptInputRef.current?.click()}
                  disabled={scanning}
                  title="Scan receipt"
                  className="flex items-center gap-1.5 text-sm text-emerald hover:opacity-75 disabled:opacity-60"
                >
                  {scanning ? <Loader2 size={16} className="animate-spin" /> : <ScanLine size={16} />}
                  {scanning ? "Scanning..." : "Scan receipt"}
                </button>
              </>
            )}
            <button type="button" onClick={onClose} className="text-muted hover:text-ink" aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="mb-4 flex rounded-lg border border-line p-1">
          {(["expense", "income", "transfer"] as TransactionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 rounded-md py-1.5 text-sm capitalize transition-colors ${
                type === t ? "bg-emerald text-white" : "text-muted hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          {error && (
            <div className="rounded-lg border border-brick/30 bg-brick-soft px-3 py-2 text-sm text-brick">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm text-muted">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === "transfer" ? "e.g. Move to savings" : "e.g. Groceries"}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted">Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm tabular outline-none focus:border-emerald"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-muted">
                {type === "transfer" ? "From account" : "Account"}
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
              >
                <option value="">
                  {categoriesLoading ? "Loading..." : categories.length ? "Select" : "No categories"}
                </option>
                {accounts.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {type === "transfer" ? (
              <div>
                <label className="mb-1 block text-sm text-muted">To account</label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
                >
                  <option value="">Select</option>
                  {accounts
                    .filter((a) => a._id !== accountId)
                    .map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-sm text-muted">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
                >
                  <option value="">Select</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-muted">Payment method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
              >
                {PAYMENT_METHODS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-emerald py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : editing ? "Save changes" : "Add transaction"}
          </button>
        </form>
      </div>
    </div>
  );
};

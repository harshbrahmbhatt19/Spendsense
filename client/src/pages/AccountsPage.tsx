import { useEffect, useState } from "react";
import { accountService } from "@/services/financeService";
import type { Account } from "@/types";
import { EmptyState, ErrorState, Skeleton } from "@/components/common/States";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { formatMoney } from "@/utils/format";
import { useToastStore } from "@/store/toastStore";
import { getErrorMessage } from "@/services/api";
import { Wallet, Plus, X, ArrowLeftRight, Trash2 } from "lucide-react";

const ACCOUNT_TYPES = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Account" },
  { value: "savings", label: "Savings Account" },
  { value: "credit_card", label: "Credit Card" },
  { value: "wallet", label: "Digital Wallet" },
  { value: "other", label: "Other" },
];

export const AccountsPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  const push = useToastStore((s) => s.push);

  const load = () => {
    setLoading(true);
    accountService
      .list()
      .then((res) => {
        setAccounts(res.data.data);
        setTotalBalance(res.data.totalBalance);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await accountService.remove(deleteTarget._id);
      push("Account deleted", "success");
      setDeleteTarget(null);
      load();
    } catch (err) {
      push(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">Accounts</h1>
          <p className="text-sm text-muted">Combined balance: {formatMoney(totalBalance)}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTransfer(true)}
            className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm hover:bg-paper-dim"
          >
            <ArrowLeftRight size={14} /> Transfer
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus size={14} /> Add account
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} />}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No accounts yet"
          description="Add a cash, bank, or card account to start tracking balances."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => (
            <div key={a._id} className="rounded-xl border border-line p-4">
              <div className="flex items-start justify-between">
                <div className="flex size-9 items-center justify-center rounded-full bg-emerald-soft text-emerald">
                  <Wallet size={16} />
                </div>
                <button
                  onClick={() => setDeleteTarget(a)}
                  className="text-muted hover:text-brick"
                  aria-label="Delete account"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <p className="mt-3 text-sm text-muted">{a.name}</p>
              <p className="font-display text-2xl tabular">{formatMoney(a.balance, a.currency)}</p>
              <p className="mt-1 text-xs capitalize text-muted">{a.type.replace("_", " ")}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AccountFormModal
          onClose={() => setShowForm(false)}
          onSaved={() => {
            load();
            push("Account created", "success");
          }}
        />
      )}
      {showTransfer && (
        <TransferModal
          accounts={accounts}
          onClose={() => setShowTransfer(false)}
          onSaved={() => {
            load();
            push("Transfer complete", "success");
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete account?"
        description={`"${deleteTarget?.name}" can only be deleted if it has no transactions.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

const AccountFormModal = ({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("cash");
  const [balance, setBalance] = useState("0");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter an account name.");
      return;
    }
    setSaving(true);
    try {
      await accountService.create({ name: name.trim(), type: type as Account["type"], balance: Number(balance) || 0 });
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
          <h2 className="font-display text-xl">Add account</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {error && (
            <div className="rounded-lg border border-brick/30 bg-brick-soft px-3 py-2 text-sm text-brick">
              {error}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm text-muted">Account name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">Starting balance</label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm tabular outline-none focus:border-emerald"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-emerald py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add account"}
          </button>
        </form>
      </div>
    </div>
  );
};

const TransferModal = ({
  accounts,
  onClose,
  onSaved,
}: {
  accounts: Account[];
  onClose: () => void;
  onSaved: () => void;
}) => {
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccountId || !toAccountId || !amount || Number(amount) <= 0) {
      setError("Please choose both accounts and a positive amount.");
      return;
    }
    setSaving(true);
    try {
      await accountService.transfer({ fromAccountId, toAccountId, amount: Number(amount) });
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
          <h2 className="font-display text-xl">Transfer money</h2>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {error && (
            <div className="rounded-lg border border-brick/30 bg-brick-soft px-3 py-2 text-sm text-brick">
              {error}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm text-muted">From</label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
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
            <label className="mb-1 block text-sm text-muted">To</label>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
            >
              <option value="">Select</option>
              {accounts
                .filter((a) => a._id !== fromAccountId)
                .map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
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
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-emerald py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Transferring..." : "Transfer"}
          </button>
        </form>
      </div>
    </div>
  );
};

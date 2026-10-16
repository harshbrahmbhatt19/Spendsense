import { useEffect, useState } from "react";
import { transactionService, categoryService, accountService, type TransactionFilters } from "@/services/financeService";
import type { Account, Category, Transaction } from "@/types";
import { TransactionRow } from "@/components/transactions/TransactionRow";
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState, ErrorState, Skeleton } from "@/components/common/States";
import { useToastStore } from "@/store/toastStore";
import { getErrorMessage } from "@/services/api";
import { Search, Receipt, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<Transaction | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const push = useToastStore((s) => s.push);

  useEffect(() => {
    categoryService.list().then((res) => setCategories(res.data.data));
    accountService.list().then((res) => setAccounts(res.data.data));
  }, []);

  const load = () => {
    setLoading(true);
    setError("");
    const filters: TransactionFilters = { page, limit: 15, sortBy: "date", sortOrder: "desc" };
    if (search) filters.search = search;
    if (type) filters.type = type;
    if (categoryId) filters.categoryId = categoryId;
    if (accountId) filters.accountId = accountId;

    transactionService
      .list(filters)
      .then((res) => {
        setTransactions(res.data.items);
        setPagination(res.data.pagination);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, type, categoryId, accountId]);

  useEffect(() => {
    setPage(1);
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") load();
    };
    const interval = window.setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    window.addEventListener("spendsense:data-changed", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("spendsense:data-changed", refresh);
    };
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await transactionService.remove(deleteTarget._id);
      push("Transaction deleted", "success");
      setDeleteTarget(null);
      load();
    } catch (err) {
      push(getErrorMessage(err), "error");
    }
  };

  const handleDuplicate = async (t: Transaction) => {
    try {
      await transactionService.duplicate(t._id);
      push("Transaction duplicated", "success");
      load();
    } catch (err) {
      push(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">Transactions</h1>
          <p className="text-sm text-muted">{pagination.total} total</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="rounded-lg bg-emerald px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Add transaction
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="w-full rounded-lg border border-line bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald"
          />
        </div>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm hover:bg-paper-dim"
        >
          <SlidersHorizontal size={14} /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 rounded-lg border border-line p-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm"
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
          </select>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm"
          >
            <option value="">All accounts</option>
            {accounts.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && <ErrorState message={error} />}

      <div className="rounded-xl border border-line p-4">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No transactions found"
            description="Try adjusting your filters, or add your first transaction."
          />
        ) : (
          <div>
            {transactions.map((t) => (
              <TransactionRow
                key={t._id}
                transaction={t}
                onEdit={() => setEditing(t)}
                onDelete={() => setDeleteTarget(t)}
                onDuplicate={() => handleDuplicate(t)}
              />
            ))}
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-line p-2 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-muted">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-line p-2 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {adding && <AddTransactionModal onClose={() => setAdding(false)} />}
      {editing && (
        <AddTransactionModal editing={editing} onClose={() => setEditing(null)} />
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete transaction?"
        description={`This will remove "${deleteTarget?.title}" and adjust the related account balance.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

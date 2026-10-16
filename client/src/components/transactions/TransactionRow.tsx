import type { Transaction } from "@/types";
import { formatShortDate, formatMoney, cn } from "@/utils/format";
import { ArrowLeftRight, MoreVertical } from "lucide-react";
import { useState } from "react";

interface Props {
  transaction: Transaction;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export const TransactionRow = ({ transaction, onEdit, onDelete, onDuplicate }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const category = typeof transaction.categoryId === "object" ? transaction.categoryId : undefined;
  const account = typeof transaction.accountId === "object" ? transaction.accountId : undefined;

  const amountColor =
    transaction.type === "income" ? "text-emerald" : transaction.type === "expense" ? "text-ink" : "text-muted";
  const sign = transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : "";

  return (
    <div className="flex items-center gap-3 border-b border-line py-3 last:border-0">
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-medium"
        style={{
          backgroundColor: transaction.type === "transfer" ? "#e2ded3" : (category?.color || "#64748b") + "22",
          color: transaction.type === "transfer" ? "#6b7280" : category?.color || "#64748b",
        }}
      >
        {transaction.type === "transfer" ? <ArrowLeftRight size={15} /> : (category?.name?.[0] || "?")}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{transaction.title}</p>
        <p className="truncate text-xs text-muted">
          {category?.name || "Transfer"} · {formatShortDate(transaction.date)}
          {account ? ` · ${account.name}` : ""}
        </p>
      </div>

      <span className={cn("tabular text-sm font-medium", amountColor)}>
        {sign}
        {formatMoney(transaction.amount)}
      </span>

      {(onEdit || onDelete || onDuplicate) && (
        <div className="relative">
          <button onClick={() => setMenuOpen((o) => !o)} className="p-1 text-muted hover:text-ink">
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-1 w-32 rounded-lg border border-line bg-white py-1 text-sm shadow-md">
                {onEdit && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit();
                    }}
                    className="block w-full px-3 py-1.5 text-left hover:bg-paper-dim"
                  >
                    Edit
                  </button>
                )}
                {onDuplicate && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDuplicate();
                    }}
                    className="block w-full px-3 py-1.5 text-left hover:bg-paper-dim"
                  >
                    Duplicate
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete();
                    }}
                    className="block w-full px-3 py-1.5 text-left text-brick hover:bg-brick-soft"
                  >
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

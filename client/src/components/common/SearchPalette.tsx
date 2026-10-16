import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Search, X, Receipt, Tag, Wallet, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { searchService } from "@/services/insightsService";
import { formatMoney } from "@/utils/format";

interface SearchPaletteProps {
  open: boolean;
  onClose: () => void;
}

export const SearchPalette = ({ open, onClose }: SearchPaletteProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const t = setTimeout(() => {
      searchService.search(query).then((res) => setResults(res.data.data));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;

  const hasResults =
    results &&
    (results.transactions.length > 0 ||
      results.categories.length > 0 ||
      results.accounts.length > 0 ||
      results.goals.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 px-4 pt-24">
      <div className="w-full max-w-lg rounded-xl border border-line bg-paper shadow-xl">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <Search size={16} className="text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions, categories, accounts, goals..."
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {!query.trim() && <p className="px-3 py-8 text-center text-sm text-muted">Start typing to search.</p>}

          {query.trim() && !hasResults && results && (
            <p className="px-3 py-8 text-center text-sm text-muted">No results for "{query}".</p>
          )}

          {results?.transactions?.length > 0 && (
            <ResultGroup icon={Receipt} label="Transactions">
              {results.transactions.map((t: any) => (
                <div key={t._id} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-paper-dim">
                  <span>{t.title}</span>
                  <span className="tabular text-muted">{formatMoney(t.amount)}</span>
                </div>
              ))}
            </ResultGroup>
          )}

          {results?.categories?.length > 0 && (
            <ResultGroup icon={Tag} label="Categories">
              {results.categories.map((c: any) => (
                <div key={c._id} className="rounded-lg px-3 py-2 text-sm hover:bg-paper-dim">
                  {c.name}
                </div>
              ))}
            </ResultGroup>
          )}

          {results?.accounts?.length > 0 && (
            <ResultGroup icon={Wallet} label="Accounts">
              {results.accounts.map((a: any) => (
                <div key={a._id} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-paper-dim">
                  <span>{a.name}</span>
                  <span className="tabular text-muted">{formatMoney(a.balance)}</span>
                </div>
              ))}
            </ResultGroup>
          )}

          {results?.goals?.length > 0 && (
            <ResultGroup icon={Target} label="Goals">
              {results.goals.map((g: any) => (
                <div key={g._id} className="rounded-lg px-3 py-2 text-sm hover:bg-paper-dim">
                  {g.title}
                </div>
              ))}
            </ResultGroup>
          )}
        </div>
      </div>
    </div>
  );
};

const ResultGroup = ({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) => (
  <div className="mb-1">
    <p className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted">
      <Icon size={12} /> {label}
    </p>
    {children}
  </div>
);

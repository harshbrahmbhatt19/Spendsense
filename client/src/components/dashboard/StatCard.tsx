import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatMoney } from "@/utils/format";
import { cn } from "@/utils/format";

interface StatCardProps {
  label: string;
  amount: number;
  changePercent?: number;
  emphasis?: boolean;
  sub?: string;
}

export const StatCard = ({ label, amount, changePercent, emphasis, sub }: StatCardProps) => {
  const positive = (changePercent ?? 0) >= 0;

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        emphasis ? "border-emerald/40 bg-emerald-soft" : "border-line"
      )}
    >
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1.5 font-display text-2xl tabular md:text-3xl">{formatMoney(amount)}</p>
      {changePercent !== undefined && (
        <div className="mt-1.5 flex items-center gap-1 text-xs">
          <span
            className={cn(
              "flex items-center gap-0.5",
              positive ? "text-emerald" : "text-brick"
            )}
          >
            {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(changePercent)}%
          </span>
          <span className="text-muted">vs last month</span>
        </div>
      )}
      {sub && <p className="mt-1.5 text-xs text-muted">{sub}</p>}
    </div>
  );
};

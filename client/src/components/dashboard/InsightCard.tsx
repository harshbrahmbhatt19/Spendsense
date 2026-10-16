import { AlertTriangle, TrendingUp, TrendingDown, Info, AlertCircle, PiggyBank, BarChart3, Calendar } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Insight } from "@/types";
import { cn } from "@/utils/format";

const ICONS: Record<string, LucideIcon> = {
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  "piggy-bank": PiggyBank,
  "bar-chart-3": BarChart3,
  calendar: Calendar,
  "alert-triangle": AlertTriangle,
  "alert-circle": AlertCircle,
};

const LEVEL_STYLES: Record<Insight["level"], string> = {
  info: "border-line bg-white text-ink",
  positive: "border-emerald/30 bg-emerald-soft text-emerald",
  warning: "border-amber/30 bg-amber-soft text-amber",
  critical: "border-brick/30 bg-brick-soft text-brick",
};

export const InsightCard = ({ insight }: { insight: Insight }) => {
  const Icon = ICONS[insight.icon] || Info;
  return (
    <div className={cn("flex gap-3 rounded-xl border p-4", LEVEL_STYLES[insight.level])}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-medium text-ink">{insight.title}</p>
        <p className="mt-0.5 text-sm text-ink/70">{insight.description}</p>
      </div>
    </div>
  );
};

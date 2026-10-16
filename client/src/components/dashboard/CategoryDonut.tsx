import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatMoney } from "@/utils/format";
import { EmptyState } from "@/components/common/States";
import { PieChart as PieIcon } from "lucide-react";

interface Props {
  data: { name: string; total: number; color: string; percent: number }[];
}

export const CategoryDonut = ({ data }: Props) => {
  if (data.length === 0) {
    return <EmptyState icon={PieIcon} title="No expenses yet" description="Add a transaction to see the breakdown." />;
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ResponsiveContainer width={180} height={180} className="shrink-0">
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatMoney(Number(value))}
            contentStyle={{ borderRadius: 8, fontSize: 13 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="w-full space-y-2">
        {data.slice(0, 6).map((c) => (
          <div key={c.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="text-ink/80">{c.name}</span>
            </div>
            <div className="flex items-center gap-2 tabular">
              <span className="text-muted">{c.percent}%</span>
              <span>{formatMoney(c.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

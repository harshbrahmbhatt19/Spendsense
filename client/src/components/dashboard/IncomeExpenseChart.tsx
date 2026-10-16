import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { monthLabel, formatMoney } from "@/utils/format";

interface Props {
  data: { year: number; month: number; income: number; expense: number }[];
}

export const IncomeExpenseChart = ({ data }: Props) => {
  const chartData = data.map((d) => ({
    label: monthLabel(d.year, d.month),
    Income: d.income,
    Expenses: d.expense,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2ded3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatMoney(v)}
          width={70}
        />
        <Tooltip
          formatter={(value) => formatMoney(Number(value))}
          contentStyle={{ borderRadius: 8, border: "1px solid #e2ded3", fontSize: 13 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Income" fill="#0f6b4c" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Expenses" fill="#d98e3b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

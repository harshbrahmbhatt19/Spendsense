import { useState } from "react";
import { formatMoney } from "@/utils/format";
import { getErrorMessage, api } from "@/services/api";
import { useToastStore } from "@/store/toastStore";
import { Download, FileText } from "lucide-react";

export const ReportsTab = () => {
  const [type, setType] = useState<"monthly" | "yearly">("monthly");
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const push = useToastStore((s) => s.push);

  const params = type === "monthly" ? { type, year, month } : { type, year };

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports", { params });
      setReport(res.data.data);
    } catch (err) {
      push(getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  const download = async (format: "csv" | "pdf") => {
    try {
      const res = await api.get(`/reports/export/${format}`, { params, responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `spendsense-report.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      push(getErrorMessage(err), "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-line p-4">
        <div>
          <label className="mb-1 block text-sm text-muted">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "monthly" | "yearly")}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        {type === "monthly" && (
          <div>
            <label className="mb-1 block text-sm text-muted">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-emerald"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1, 1).toLocaleDateString("en-IN", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm text-muted">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-24 rounded-lg border border-line bg-white px-3 py-2 text-sm tabular outline-none focus:border-emerald"
          />
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="rounded-lg bg-emerald px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate report"}
        </button>
      </div>

      {report && (
        <div className="rounded-xl border border-line p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg">Summary</h3>
            <div className="flex gap-2">
              <button
                onClick={() => download("csv")}
                className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-paper-dim"
              >
                <Download size={13} /> CSV
              </button>
              <button
                onClick={() => download("pdf")}
                className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-paper-dim"
              >
                <FileText size={13} /> PDF
              </button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted">Income</p>
              <p className="tabular font-medium">{formatMoney(report.summary.totalIncome)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Expense</p>
              <p className="tabular font-medium">{formatMoney(report.summary.totalExpense)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Savings</p>
              <p className="tabular font-medium">{formatMoney(report.summary.totalSavings)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Savings rate</p>
              <p className="tabular font-medium">{report.summary.savingsRate}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

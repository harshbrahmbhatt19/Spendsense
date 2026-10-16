import { Response } from "express";
import { AuthRequest } from "@/middleware/auth";
import { asyncHandler } from "@/utils/asyncHandler";
import { ApiError } from "@/utils/ApiError";
import { buildMonthlyReport, buildYearlyReport, buildReport } from "@/services/report.service";
import { toCsv } from "@/utils/csv";
import { streamReportPdf } from "@/utils/pdf";

type ResolvedRange =
  | { kind: "monthly"; year: number; month: number }
  | { kind: "yearly"; year: number }
  | { kind: "custom"; start: Date; end: Date };

const resolveRange = (req: AuthRequest): ResolvedRange => {
  const { type, year, month, start, end } = req.query as Record<string, string>;

  if (type === "monthly") {
    if (!year || !month) throw new ApiError(400, "year and month are required for a monthly report");
    return { kind: "monthly", year: Number(year), month: Number(month) };
  }
  if (type === "yearly") {
    if (!year) throw new ApiError(400, "year is required for a yearly report");
    return { kind: "yearly", year: Number(year) };
  }
  if (!start || !end) throw new ApiError(400, "start and end are required for a custom report");
  return { kind: "custom", start: new Date(start), end: new Date(end) };
};

const getReportData = async (userId: string, req: AuthRequest) => {
  const range = resolveRange(req);
  if (range.kind === "monthly") return buildMonthlyReport(userId, range.year, range.month);
  if (range.kind === "yearly") return buildYearlyReport(userId, range.year);
  return buildReport(userId, { start: range.start, end: range.end });
};

export const generate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const report = await getReportData(req.userId!, req);
  res.status(200).json({ success: true, data: report });
});

export const exportCsv = asyncHandler(async (req: AuthRequest, res: Response) => {
  const report = await getReportData(req.userId!, req);

  const rows = report.transactions.map((t: any) => ({
    date: t.date.toISOString().split("T")[0],
    title: t.title,
    type: t.type,
    category: t.categoryId?.name || "Uncategorized",
    account: t.accountId?.name || "",
    amount: t.amount,
    notes: t.notes || "",
  }));

  const csv = toCsv(rows);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=spendsense-report.csv");
  res.status(200).send(csv);
});

export const exportPdf = asyncHandler(async (req: AuthRequest, res: Response) => {
  const report = await getReportData(req.userId!, req);
  streamReportPdf(res, report as any);
});

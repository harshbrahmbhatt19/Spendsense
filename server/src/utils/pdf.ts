import PDFDocument from "pdfkit";
import { Response } from "express";

interface PdfReportData {
  range: { start: Date; end: Date };
  summary: { totalIncome: number; totalExpense: number; totalSavings: number; savingsRate: number };
  expenseByCategory: { name: string; total: number; percent: number }[];
  incomeByCategory: { name: string; total: number; percent: number }[];
  highestExpenses: { title: string; amount: number; date: Date }[];
}

const money = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;
const fmtDate = (d: Date) => new Date(d).toISOString().split("T")[0];

export const streamReportPdf = (res: Response, data: PdfReportData) => {
  const doc = new PDFDocument({ margin: 50, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=spendsense-report.pdf");
  doc.pipe(res);

  doc.fontSize(20).text("SpendSense Financial Report", { align: "center" });
  doc
    .fontSize(10)
    .fillColor("#666")
    .text(`${fmtDate(data.range.start)} to ${fmtDate(data.range.end)}`, { align: "center" });
  doc.moveDown(1.5);

  doc.fillColor("#000").fontSize(14).text("Summary");
  doc.moveDown(0.3);
  doc.fontSize(11);
  doc.text(`Total Income: ${money(data.summary.totalIncome)}`);
  doc.text(`Total Expense: ${money(data.summary.totalExpense)}`);
  doc.text(`Total Savings: ${money(data.summary.totalSavings)}`);
  doc.text(`Savings Rate: ${data.summary.savingsRate}%`);
  doc.moveDown(1);

  doc.fontSize(14).text("Expense by Category");
  doc.moveDown(0.3);
  doc.fontSize(11);
  if (data.expenseByCategory.length === 0) {
    doc.fillColor("#666").text("No expenses in this period.");
    doc.fillColor("#000");
  } else {
    for (const c of data.expenseByCategory) {
      doc.text(`${c.name}: ${money(c.total)} (${c.percent}%)`);
    }
  }
  doc.moveDown(1);

  doc.fontSize(14).text("Income by Category");
  doc.moveDown(0.3);
  doc.fontSize(11);
  if (data.incomeByCategory.length === 0) {
    doc.fillColor("#666").text("No income in this period.");
    doc.fillColor("#000");
  } else {
    for (const c of data.incomeByCategory) {
      doc.text(`${c.name}: ${money(c.total)} (${c.percent}%)`);
    }
  }
  doc.moveDown(1);

  doc.fontSize(14).text("Highest Expenses");
  doc.moveDown(0.3);
  doc.fontSize(11);
  if (data.highestExpenses.length === 0) {
    doc.fillColor("#666").text("No expenses in this period.");
  } else {
    for (const t of data.highestExpenses) {
      doc.text(`${fmtDate(t.date)} - ${t.title}: ${money(t.amount)}`);
    }
  }

  doc.end();
};

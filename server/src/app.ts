import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "@/config/env";
import { notFound, errorHandler } from "@/middleware/errorHandler";

import authRoutes from "@/routes/auth.routes";
import userRoutes from "@/routes/user.routes";
import transactionRoutes from "@/routes/transaction.routes";
import accountRoutes from "@/routes/account.routes";
import categoryRoutes from "@/routes/category.routes";
import budgetRoutes from "@/routes/budget.routes";
import goalRoutes from "@/routes/goal.routes";
import recurringRoutes from "@/routes/recurring.routes";
import reminderRoutes from "@/routes/reminder.routes";
import notificationRoutes from "@/routes/notification.routes";
import analyticsRoutes from "@/routes/analytics.routes";
import insightsRoutes from "@/routes/insights.routes";
import predictionRoutes from "@/routes/prediction.routes";
import financialHealthRoutes from "@/routes/financial-health.routes";
import aiRoutes from "@/routes/ai.routes";
import reportRoutes from "@/routes/report.routes";
import searchRoutes from "@/routes/search.routes";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
if (env.nodeEnv !== "test") {
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
}

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SpendSense API is running 🚀",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "SpendSense API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/financial-health", financialHealthRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/search", searchRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

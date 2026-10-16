import cron from "node-cron";
import { processDueRecurringTransactions } from "@/services/recurring.service";
import { markOverdueReminders } from "@/services/reminder.service";

// Runs once a day at 00:05 server time. Also exported so it can be triggered
// manually (e.g. an admin endpoint or on server boot) without waiting for cron.
export const runDailyJobs = async () => {
  const createdCount = await processDueRecurringTransactions();
  const overdueCount = await markOverdueReminders();
  console.log(
    `[jobs] daily run complete: ${createdCount} recurring transaction(s) created, ${overdueCount} reminder(s) marked overdue`
  );
};

export const scheduleJobs = () => {
  cron.schedule("5 0 * * *", () => {
    runDailyJobs().catch((err) => console.error("[jobs] daily run failed:", err));
  });
};

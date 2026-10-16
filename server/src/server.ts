import app from "@/app";
import { connectDB } from "@/config/db";
import { env } from "@/config/env";
import { scheduleJobs } from "@/jobs/scheduler";

const start = async () => {
  await connectDB();
  scheduleJobs();
  app.listen(env.port, () => {
    console.log(`SpendSense API listening on port ${env.port} [${env.nodeEnv}]`);
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

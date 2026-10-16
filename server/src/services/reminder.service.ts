import { Reminder } from "@/models/Reminder";

export const markOverdueReminders = async (): Promise<number> => {
  const result = await Reminder.updateMany(
    { status: "pending", dueDate: { $lt: new Date() } },
    { $set: { status: "overdue" } }
  );
  return result.modifiedCount;
};

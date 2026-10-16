import { RecurringTransaction, IRecurringTransaction } from "@/models/RecurringTransaction";
import { createTransaction } from "@/services/transaction.service";

export const advanceOccurrence = (date: Date, frequency: string): Date => {
  const next = new Date(date);
  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
};

// Finds every active recurring rule whose nextOccurrence has arrived, creates the
// matching transaction, and rolls nextOccurrence forward. Safe to call repeatedly
// (e.g. from a daily cron job) since it only ever processes rules that are due.
export const processDueRecurringTransactions = async (): Promise<number> => {
  const now = new Date();
  const due = await RecurringTransaction.find({
    active: true,
    autoCreate: true,
    nextOccurrence: { $lte: now },
  });

  let created = 0;

  for (const rule of due) {
    if (rule.endDate && rule.nextOccurrence > rule.endDate) {
      rule.active = false;
      await rule.save();
      continue;
    }

    await createTransaction(rule.userId.toString(), {
      title: rule.title,
      amount: rule.amount,
      type: rule.type,
      categoryId: rule.categoryId?.toString(),
      accountId: rule.accountId.toString(),
      paymentMethod: rule.paymentMethod,
      date: rule.nextOccurrence,
      notes: `Auto-generated from recurring: ${rule.title}`,
      tags: ["recurring"],
    });
    created += 1;

    rule.nextOccurrence = advanceOccurrence(rule.nextOccurrence, rule.frequency);
    if (rule.endDate && rule.nextOccurrence > rule.endDate) {
      rule.active = false;
    }
    await rule.save();
  }

  return created;
};

export const previewUpcoming = (rule: IRecurringTransaction, count = 3): Date[] => {
  const dates: Date[] = [];
  let cursor = rule.nextOccurrence;
  for (let i = 0; i < count; i++) {
    if (rule.endDate && cursor > rule.endDate) break;
    dates.push(new Date(cursor));
    cursor = advanceOccurrence(cursor, rule.frequency);
  }
  return dates;
};

import { api } from "@/services/api";
import type { BudgetProgress, Goal, RecurringTransaction, Reminder } from "@/types";

export const budgetService = {
  list: () => api.get<{ data: BudgetProgress[] }>("/budgets"),
  create: (data: any) => api.post("/budgets", data),
  update: (id: string, data: any) => api.patch(`/budgets/${id}`, data),
  remove: (id: string) => api.delete(`/budgets/${id}`),
};

export const goalService = {
  list: () => api.get<{ data: Goal[] }>("/goals"),
  create: (data: Partial<Goal>) => api.post<{ data: Goal }>("/goals", data),
  update: (id: string, data: Partial<Goal>) => api.patch<{ data: Goal }>(`/goals/${id}`, data),
  remove: (id: string) => api.delete(`/goals/${id}`),
  addMoney: (id: string, amount: number) =>
    api.post<{ data: Goal }>(`/goals/${id}/add`, { amount }),
  withdrawMoney: (id: string, amount: number) =>
    api.post<{ data: Goal }>(`/goals/${id}/withdraw`, { amount }),
};

export const recurringService = {
  list: () => api.get<{ data: RecurringTransaction[] }>("/recurring"),
  create: (data: any) => api.post("/recurring", data),
  update: (id: string, data: any) => api.patch(`/recurring/${id}`, data),
  remove: (id: string) => api.delete(`/recurring/${id}`),
  toggle: (id: string) => api.post(`/recurring/${id}/toggle`),
};

export const reminderService = {
  list: () => api.get<{ data: Reminder[] }>("/reminders"),
  upcoming: () => api.get<{ data: Reminder[] }>("/reminders/upcoming"),
  create: (data: any) => api.post("/reminders", data),
  markPaid: (id: string) => api.post(`/reminders/${id}/paid`),
  remove: (id: string) => api.delete(`/reminders/${id}`),
};

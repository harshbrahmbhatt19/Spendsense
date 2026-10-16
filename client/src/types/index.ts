export type TransactionType = "income" | "expense" | "transfer";
export type PaymentMethod = "cash" | "upi" | "credit_card" | "debit_card" | "bank_transfer";

export interface User {
  id: string;
  userId: string;
  name: string;
  profileImage?: string;
  currency: string;
  theme: "light" | "dark";
  monthlyIncomeGoal?: number;
  savingsTarget?: number;
  monthStartDate: number;
}

export interface Account {
  _id: string;
  name: string;
  type: "cash" | "bank" | "savings" | "credit_card" | "wallet" | "other";
  balance: number;
  currency: string;
  icon: string;
}

export interface Category {
  _id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface Transaction {
  _id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId?: Category | string;
  accountId: Account | string;
  toAccountId?: Account | string;
  paymentMethod: PaymentMethod;
  date: string;
  notes?: string;
  tags: string[];
  createdAt: string;
}

export interface BudgetProgress {
  budget: {
    _id: string;
    categoryId?: Category;
    amount: number;
    period: "monthly" | "yearly";
    startDate: string;
    endDate: string;
  };
  spent: number;
  remaining: number;
  percentUsed: number;
  status: "on_track" | "warning_50" | "warning_75" | "warning_90" | "exceeded";
}

export interface Goal {
  _id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  description?: string;
  icon: string;
  status: "active" | "completed" | "abandoned";
  percent: number;
}

export interface RecurringTransaction {
  _id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  categoryId?: Category;
  accountId: Account;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  nextOccurrence: string;
  endDate?: string;
  autoCreate: boolean;
  active: boolean;
  upcoming: string[];
}

export interface Reminder {
  _id: string;
  title: string;
  amount: number;
  dueDate: string;
  category?: string;
  status: "pending" | "paid" | "overdue";
}

export interface AppNotification {
  _id: string;
  title: string;
  message: string;
  type: "budget" | "reminder" | "goal" | "summary" | "system";
  isRead: boolean;
  createdAt: string;
}

export interface Insight {
  icon: string;
  title: string;
  description: string;
  level: "info" | "warning" | "positive" | "critical";
}

export interface DashboardData {
  totalBalance: number;
  monthlyIncome: { amount: number; changePercent: number };
  monthlyExpense: { amount: number; changePercent: number };
  monthlySavings: { amount: number; changePercent: number; savingsRate: number };
  last6Months: { year: number; month: number; income: number; expense: number; savings: number }[];
  categoryBreakdown: { categoryId: string | null; name: string; icon: string; color: string; total: number; percent: number }[];
}

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

import { Types } from "mongoose";

export const EXPENSE_CATEGORIES = [
  { name: "Food & Dining", icon: "utensils", color: "#f97316" },
  { name: "Transportation", icon: "car", color: "#3b82f6" },
  { name: "Shopping", icon: "shopping-bag", color: "#ec4899" },
  { name: "Entertainment", icon: "clapperboard", color: "#a855f7" },
  { name: "Bills", icon: "receipt", color: "#ef4444" },
  { name: "Healthcare", icon: "heart-pulse", color: "#14b8a6" },
  { name: "Education", icon: "graduation-cap", color: "#6366f1" },
  { name: "Travel", icon: "plane", color: "#0ea5e9" },
  { name: "Rent", icon: "home", color: "#f59e0b" },
  { name: "Groceries", icon: "shopping-cart", color: "#22c55e" },
  { name: "Subscriptions", icon: "repeat", color: "#8b5cf6" },
  { name: "Other", icon: "circle-ellipsis", color: "#64748b" },
];

export const INCOME_CATEGORIES = [
  { name: "Salary", icon: "banknote", color: "#22c55e" },
  { name: "Freelancing", icon: "laptop", color: "#0ea5e9" },
  { name: "Investments", icon: "trending-up", color: "#6366f1" },
  { name: "Business", icon: "briefcase", color: "#f59e0b" },
  { name: "Gifts", icon: "gift", color: "#ec4899" },
  { name: "Other", icon: "circle-ellipsis", color: "#64748b" },
];

export const buildDefaultCategories = (userId: Types.ObjectId) => {
  const expense = EXPENSE_CATEGORIES.map((c) => ({
    ...c,
    userId,
    type: "expense" as const,
    isDefault: true,
  }));
  const income = INCOME_CATEGORIES.map((c) => ({
    ...c,
    userId,
    type: "income" as const,
    isDefault: true,
  }));
  return [...expense, ...income];
};

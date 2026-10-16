const currencySymbols: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export const formatMoney = (amount: number, currency = "INR"): string => {
  const symbol = currencySymbols[currency] || currency + " ";
  const sign = amount < 0 ? "-" : "";
  return `${sign}${symbol}${Math.abs(amount).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatShortDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

export const monthLabel = (year: number, month: number): string => {
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
};

export const cn = (...classes: (string | false | null | undefined)[]): string =>
  classes.filter(Boolean).join(" ");

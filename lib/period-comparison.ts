export type ComparisonRange =
  | "this-month"
  | "last-30-days"
  | "last-3-months"
  | "last-6-months"
  | "last-12-months"
  | "year-to-date";

export type TransactionLike = {
  amount?: number | string | null;
  type?: string | null;
  date?: string | null;
};

export type PeriodSummary = {
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
};

const dayMs = 24 * 60 * 60 * 1000;

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

export function getComparisonRange(range: ComparisonRange) {
  const now = new Date();
  let start: Date;
  let end = endOfDay(now);
  let label: string;

  if (range === "this-month") {
    start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    label = "vs last month";
  } else if (range === "last-3-months") {
    start = startOfDay(addMonths(now, -3));
    label = "vs previous 3 months";
  } else if (range === "last-6-months") {
    start = startOfDay(addMonths(now, -6));
    label = "vs previous 6 months";
  } else if (range === "last-12-months") {
    start = startOfDay(addMonths(now, -12));
    label = "vs previous 12 months";
  } else if (range === "year-to-date") {
    start = startOfDay(new Date(now.getFullYear(), 0, 1));
    label = "vs previous period";
  } else {
    start = startOfDay(new Date(now.getTime() - 29 * dayMs));
    label = "vs previous 30 days";
  }

  const duration = end.getTime() - start.getTime() + 1;
  const previousEnd = new Date(start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - duration + 1);

  return {
    start,
    end,
    previousStart,
    previousEnd,
    label,
  };
}

export function summarizeTransactions(transactions: TransactionLike[]): PeriodSummary {
  const summary = transactions.reduce(
    (total, transaction) => {
      const amount = Number(transaction.amount ?? 0);

      if (transaction.type === "income") {
        total.income += amount;
      } else if (transaction.type === "expense") {
        total.expenses += amount;
      }

      return total;
    },
    { income: 0, expenses: 0 }
  );
  const savings = summary.income - summary.expenses;

  return {
    ...summary,
    savings,
    savingsRate: summary.income > 0 ? Math.round((savings / summary.income) * 100) : 0,
  };
}

export function calculatePercentChange(current: number, previous: number) {
  if (previous === 0) {
    return null;
  }

  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

export function getTrendFromChange(change: number | null, inverse = false) {
  if (change === null || change === 0) return "neutral" as const;

  const isPositive = change > 0;

  if (inverse) {
    return isPositive ? "down" as const : "up" as const;
  }

  return isPositive ? "up" as const : "down" as const;
}

export function formatPercentChange(change: number | null, label: string) {
  if (change === null) return `No previous period`;
  if (change === 0) return `No change ${label}`;

  return `${Math.abs(change)}% ${change > 0 ? "up" : "down"} ${label}`;
}

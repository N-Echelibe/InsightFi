"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { AccountsCard } from "@/components/dashboard/accounts-card";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { BudgetOverview } from "@/components/dashboard/budget-overview";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SavingsGoals } from "@/components/dashboard/savings-goals";
import {
  FinancialProfileCard,
  SpendingBreakdownCard,
  CashRunwayAlertCard,
  SmartRecommendationsCard,
  type DashboardInsights,
} from "@/components/dashboard/insights-card";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  AlertTriangle,
  Target,
  CalendarClock,
  Clock,
  ArrowRight,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/skeletons";
import { ErrorState } from "@/components/states";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import api from "@/lib/api";
import { supabase } from "@/lib/supabase";
import {
  createAccountTransfer,
  type AccountTransferInput,
} from "@/lib/account-transfer";
import {
  calculatePercentChange,
  getComparisonRange,
  getTrendFromChange,
  summarizeTransactions,
  type TransactionLike,
} from "@/lib/period-comparison";
import {
  getFinancialHealthProfile,
  getFinancialHealthRecommendations,
} from "@/lib/financial-profile";

type DashboardSummary = {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
};

type DashboardBudget = {
  categories?: {
    name?: string;
  };
  category_id?: {
    name?: string;
  };
  spent?: number | string;
  expense?: number | string;
  budget?: number | string;
  amount?: number | string;
};

type TrendComparison = {
  incomeChange: number | null;
  expensesChange: number | null;
  savingsRateChange: number | null;
  savingsRatePointChange: number | null;
  label: string;
};

type SavingsGoal = {
  id: string | number;
  name: string;
  current: number;
  target: number;
  icon?: LucideIcon;
  color?: string;
  autoSave?: boolean;
};

type CategoryRecord = {
  id: string;
  name: string;
  type?: string;
};

type DialogMode = "transaction" | "transfer";

type FocusBudgetRisk = {
  category: string;
  status: "exceeded" | "watch" | "safe";
  spent: number;
  budget: number;
  percentUsed: number;
};

const formatCurrency = (value: number) =>
  `${"\u20a6"}${value.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const formatDashboardDate = (value?: string) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
  }).format(date);
};

const getDaysRemainingInMonth = () => {
  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return Math.max(endOfMonth.getDate() - today.getDate() + 1, 1);
};

const getSafeSpend = (summary: DashboardSummary, targetSavingsRate = 20) => {
  if (summary.monthlyIncome <= 0) {
    return null;
  }

  const maxExpensesForTarget =
    summary.monthlyIncome * (1 - targetSavingsRate / 100);
  const remaining = maxExpensesForTarget - summary.monthlyExpenses;
  const daysRemaining = getDaysRemainingInMonth();

  return {
    remaining,
    perDay: remaining / daysRemaining,
    daysRemaining,
    targetSavingsRate,
  };
};

const normalizeBudgetRisk = (budget: DashboardBudget): FocusBudgetRisk => {
  const spent = Number(budget.spent ?? budget.expense ?? 0);
  const limit = Number(budget.budget ?? budget.amount ?? 0);
  const percentUsed = limit > 0 ? Math.round((spent / limit) * 100) : 0;

  return {
    category: budget.categories?.name ?? budget.category_id?.name ?? "Budget",
    status:
      percentUsed >= 100 ? "exceeded" : percentUsed >= 75 ? "watch" : "safe",
    spent,
    budget: limit,
    percentUsed,
  };
};

const getGoalProgressRate = (goals: SavingsGoal[]) => {
  const activeGoals = goals.filter((goal) => goal.target > 0);

  if (activeGoals.length === 0) return null;

  const totalProgress = activeGoals.reduce(
    (sum, goal) => sum + Math.min((goal.current / goal.target) * 100, 100),
    0,
  );

  return Math.round(totalProgress / activeGoals.length);
};

const getPriorityGoal = (goals: SavingsGoal[]) =>
  [...goals]
    .filter((goal) => goal.target > 0 && goal.current < goal.target)
    .sort((a, b) => a.current / a.target - b.current / b.target)[0] ?? null;

const getPeriodLabel = (label: string) =>
  label.replace(/^vs\s+/i, "").trim() || "previous period";

const formatDirectionalChange = ({
  metric,
  change,
  label,
  unit = "%",
  inverse = false,
}: {
  metric: string;
  change: number | null;
  label: string;
  unit?: "%" | "points";
  inverse?: boolean;
}) => {
  if (change === null) return `No ${getPeriodLabel(label)} comparison yet`;
  if (change === 0) return `${metric} unchanged vs ${getPeriodLabel(label)}`;

  const amount = `${Math.abs(change)}${unit === "%" ? "%" : " points"}`;
  const direction = change > 0 ? "up" : "down";

  if (inverse && change > 0) {
    return `${metric} up ${amount}; watch spend vs ${getPeriodLabel(label)}`;
  }

  if (metric === "Income" && change < 0) {
    return `Income lower by ${amount} vs ${getPeriodLabel(label)}`;
  }

  if (metric === "Savings rate" && change < 0) {
    return `Savings rate down ${amount} vs ${getPeriodLabel(label)}`;
  }

  return `${metric} ${direction} ${amount} vs ${getPeriodLabel(label)}`;
};

const emptyInsights: DashboardInsights = {
  categories: [],
  metrics: {
    totalSpending: 0,
    monthlyIncome: 0,
    remainingBalance: 0,
    spendingRate: 0,
    classification: "Not enough data",
    classificationColor: "text-muted-foreground",
    classificationDescription: "Add transactions and budgets to build a spending profile.",
    classificationBenchmark: "No data yet",
    classificationScore: null,
    classificationReasons: [],
    classificationNextAction: "Add income and expense transactions to unlock a financial health profile.",
    safeSpendPerDay: null,
    safeSpendRemaining: null,
    daysUntilRunout: null,
  },
  recommendations: [],
};

const resolveIcon = (iconName?: string) => {
  if (!iconName) {
    return LucideIcons.Tag;
  }

  const normalized = iconName
    .trim()
    .replace(/[-_ ]+/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");

  const icons = LucideIcons as unknown as Record<string, LucideIcon>;

  return icons[normalized] || LucideIcons.Tag;
};

const buildDashboardInsights = ({
  transactions,
  summary,
  budgets = [],
  goals = [],
  trendComparison,
}: {
  transactions: any[];
  summary: DashboardSummary;
  budgets?: DashboardBudget[];
  goals?: SavingsGoal[];
  trendComparison?: TrendComparison;
}): DashboardInsights => {
  const categoryTotals = new Map<string, number>();
  let expenses = 0;

  transactions.forEach((transaction) => {
    if (transaction.type !== "expense") {
      return;
    }

    const amount = Number(transaction.amount ?? 0);
    const feeAmount = Math.max(Number(transaction.fee_amount ?? 0), 0);
    const category = transaction.categories?.name ?? "Uncategorized";
    const expenseAmount = amount + feeAmount;
    expenses += expenseAmount;
    categoryTotals.set(category, (categoryTotals.get(category) ?? 0) + expenseAmount);
  });

  const totalSpending = summary.monthlyExpenses || expenses;
  const monthlyIncome = summary.monthlyIncome;
  const remainingBalance = summary.totalBalance;
  const spendingRate =
    monthlyIncome > 0 ? (totalSpending / monthlyIncome) * 100 : 0;
  const savingsRate =
    monthlyIncome > 0
      ? ((monthlyIncome - totalSpending) / monthlyIncome) * 100
      : 0;
  const dailySpending = totalSpending / 30;
  const daysUntilRunout =
    dailySpending > 0 ? Math.ceil(remainingBalance / dailySpending) : null;
  const hasActivity = monthlyIncome > 0 || totalSpending > 0;
  const budgetRisks = budgets.map(normalizeBudgetRisk);
  const budgetRiskLevel = budgetRisks.some((risk) => risk.status === "exceeded")
    ? "high"
    : budgetRisks.some((risk) => risk.status === "watch")
      ? "medium"
      : budgetRisks.length > 0
        ? "low"
        : "none";
  const goalProgressRate = getGoalProgressRate(goals);
  const financialHealthProfile = getFinancialHealthProfile(savingsRate, {
    income: monthlyIncome,
    expenses: totalSpending,
    hasActivity,
    budgetRiskLevel,
    budgetRiskCount: budgetRisks.filter((risk) => risk.status !== "safe").length,
    cashRunwayDays: daysUntilRunout,
    goalProgressRate,
    isVolatile:
      Math.abs(trendComparison?.incomeChange ?? 0) >= 40 ||
      Math.abs(trendComparison?.expensesChange ?? 0) >= 40,
  });

  const categories = Array.from(categoryTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({
      label,
      value: formatCurrency(value),
      percentage:
        totalSpending > 0 ? Math.round((value / totalSpending) * 100) : 0,
    }));

  const topCategory = categories[0];
  const safeSpend = getSafeSpend(summary);
  const recommendations = getFinancialHealthRecommendations(financialHealthProfile, {
    income: monthlyIncome,
    expenses: totalSpending,
    topCategory,
    budgetRisks,
    cashRunwayDays: daysUntilRunout,
    goalProgressRate,
    hasGoals: goals.length > 0,
    incomeChange: trendComparison?.incomeChange,
    expensesChange: trendComparison?.expensesChange,
    savingsRateChange: trendComparison?.savingsRateChange,
  });

  return {
    categories,
    metrics: {
      totalSpending,
      monthlyIncome,
      remainingBalance,
      spendingRate,
      classification: financialHealthProfile.type,
      classificationColor: financialHealthProfile.color,
      classificationDescription: financialHealthProfile.description,
      classificationBenchmark: financialHealthProfile.benchmark,
      classificationScore: financialHealthProfile.score,
      classificationReasons: financialHealthProfile.reasons,
      classificationNextAction: financialHealthProfile.nextAction,
      safeSpendPerDay: safeSpend?.perDay ?? null,
      safeSpendRemaining: safeSpend?.remaining ?? null,
      daysUntilRunout,
    },
    recommendations,
  };
};

function TodayFocusCard({
  insights,
  summary,
  budgets,
  goals,
  onAddTransaction,
}: {
  insights: DashboardInsights;
  summary: DashboardSummary;
  budgets: DashboardBudget[];
  goals: SavingsGoal[];
  onAddTransaction: () => void;
}) {
  const budgetRisks = budgets
    .map(normalizeBudgetRisk)
    .sort((a, b) => b.percentUsed - a.percentUsed);
  const priorityBudget =
    budgetRisks.find((budget) => budget.status === "exceeded") ??
    budgetRisks.find((budget) => budget.status === "watch") ??
    null;
  const priorityGoal = getPriorityGoal(goals);
  const topCategory = insights.categories[0] ?? null;
  const safeSpend = getSafeSpend(summary);
  const hasSurplusForGoals = Boolean(safeSpend && safeSpend.remaining > 0);
  const primaryRecommendation =
    insights.recommendations[0] ??
    insights.metrics.classificationNextAction ??
    "Add transactions to unlock a clearer dashboard focus.";
  const safeSpendText =
    safeSpend === null
      ? "Add income to calculate a safe daily spend."
      : safeSpend.remaining >= 0
        ? `Spend about ${formatCurrency(Math.max(safeSpend.perDay, 0))}/day for ${safeSpend.daysRemaining} days to keep a ${safeSpend.targetSavingsRate}% savings target.`
        : `You are ${formatCurrency(Math.abs(safeSpend.remaining))} past the ${safeSpend.targetSavingsRate}% savings target. Hold discretionary spending or add income before the month closes.`;
  const priorityText = priorityBudget
    ? priorityBudget.status === "exceeded"
      ? `${priorityBudget.category} is ${formatCurrency(
          Math.max(priorityBudget.spent - priorityBudget.budget, 0),
        )} over budget.`
      : `${priorityBudget.category} has used ${priorityBudget.percentUsed}% of its budget.`
    : topCategory
      ? `${topCategory.label} is ${topCategory.percentage}% of spending this month.`
      : insights.metrics.classificationDescription;
  const goalText = priorityGoal
    ? `${priorityGoal.name} is ${Math.round(
        (priorityGoal.current / priorityGoal.target) * 100,
      )}% funded.`
    : "No active savings goal is competing for surplus yet.";

  return (
    <Card>
      <CardContent className="p-5">
        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Today's Focus</Badge>
              <Badge variant="outline">
                {insights.metrics.classificationScore === null
                  ? insights.metrics.classification
                  : `${insights.metrics.classification} - ${insights.metrics.classificationScore}/100`}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Priority
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight">
                {priorityText}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {primaryRecommendation}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button className="gap-2" onClick={onAddTransaction}>
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
              <Button variant="outline" className="gap-2 bg-transparent" asChild>
                <Link href={priorityBudget ? "/budgets" : "/goals"}>
                  <Target className="h-4 w-4" />
                  {priorityBudget
                    ? "Review Budgets"
                    : priorityGoal && hasSurplusForGoals
                      ? "Fund Goal"
                      : goals.length === 0
                        ? "Create Goal"
                        : "Review Goals"}
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-lg border p-3">
              <div className="mb-1 flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary" />
                <p className="text-xs font-medium text-muted-foreground">
                  Safe Spend
                </p>
              </div>
              <p className="text-sm font-medium">{safeSpendText}</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="mb-1 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <p className="text-xs font-medium text-muted-foreground">
                  Budget Signal
                </p>
              </div>
              <p className="text-sm font-medium">
                {priorityBudget
                  ? priorityText
                  : "No urgent budget pressure is showing."}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="mb-1 flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-success" />
                <p className="text-xs font-medium text-muted-foreground">
                  Goal Signal
                </p>
              </div>
              <p className="text-sm font-medium">{goalText}</p>
              {priorityGoal && hasSurplusForGoals && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Surplus is available; consider adding funds to this goal.
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BudgetDangerCard({ budgets }: { budgets: DashboardBudget[] }) {
  const priorityBudget = budgets
    .map(normalizeBudgetRisk)
    .filter((budget) => budget.status !== "safe")
    .sort((a, b) => b.percentUsed - a.percentUsed)[0];

  if (!priorityBudget) return null;

  const isExceeded = priorityBudget.status === "exceeded";
  const overage = Math.max(priorityBudget.spent - priorityBudget.budget, 0);

  return (
    <Card
      className={
        isExceeded
          ? "border-destructive bg-destructive/5"
          : "border-amber-500/60 bg-amber-500/5"
      }
    >
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle
            className={
              isExceeded
                ? "mt-0.5 h-5 w-5 shrink-0 text-destructive"
                : "mt-0.5 h-5 w-5 shrink-0 text-amber-600"
            }
          />
          <div>
            <p
              className={
                isExceeded
                  ? "font-semibold text-destructive"
                  : "font-semibold text-amber-700"
              }
            >
              {isExceeded ? "Budget exceeded" : "Budget close to limit"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {isExceeded
                ? `${priorityBudget.category} is ${formatCurrency(overage)} over budget. Handle this before reviewing charts.`
                : `${priorityBudget.category} has used ${priorityBudget.percentUsed}% of its budget. Slow spending here before it crosses the limit.`}
            </p>
          </div>
        </div>
        <Button variant="outline" className="w-full gap-2 bg-background sm:w-auto" asChild>
          <Link href="/budgets">
            Review Budget
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsRate: 0,
  });
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [cashflow, setCashflow] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [firstName, setFirstName] = useState("");
  const [dashboardInsights, setDashboardInsights] =
    useState<DashboardInsights>(emptyInsights);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogMode, setAddDialogMode] = useState<DialogMode>("transaction");
  const [reloadTick, setReloadTick] = useState(0);
  const [trendComparison, setTrendComparison] = useState<TrendComparison>({
    incomeChange: null,
    expensesChange: null,
    savingsRateChange: null,
    savingsRatePointChange: null,
    label: "vs last month",
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setHasError(false);
        setIsLoading(true);
        const comparisonRange = getComparisonRange("this-month");
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const [
          summaryResponse,
          accountsResponse,
          recentResponse,
          categoriesResponse,
          cashflowResponse,
          budgetsResponse,
          savingsBucketsResponse,
          currentTransactionsResponse,
          previousTransactionsResponse,
          profileResponse,
        ] = await Promise.all([
          api.get<DashboardSummary>("/dashboard/summary", {
            query: {
              startDate: comparisonRange.start.toISOString(),
              endDate: comparisonRange.end.toISOString(),
            },
          }),
          api.get<{ accounts: any[]; data?: any[] }>("/accounts"),
          api.get<{ transactions: any[] }>("/dashboard/recent-transactions"),
          api.get<{ categories: CategoryRecord[] }>("/categories"),
          api.get<{ cashflow: any[] }>("/dashboard/cashflow", {
            query: { period: "12m" },
          }),
          api.get<{ budgets?: any[]; data?: any[] }>("/budgets"),
          api.get<{ buckets: any[] }>("/savings-buckets"),
          api.get<{ transactions: TransactionLike[] }>("/transactions", {
            query: {
              limit: 1000,
              startDate: comparisonRange.start.toISOString(),
              endDate: comparisonRange.end.toISOString(),
            },
          }),
          api.get<{ transactions: TransactionLike[] }>("/transactions", {
            query: {
              limit: 1000,
              startDate: comparisonRange.previousStart.toISOString(),
              endDate: comparisonRange.previousEnd.toISOString(),
            },
          }),
          user
            ? supabase
                .from("profiles")
                .select("first_name, full_name")
                .eq("user_id", user.id)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
        ]);
        const currentPeriod = summarizeTransactions(
          currentTransactionsResponse.transactions ?? []
        );
        const previousPeriod = summarizeTransactions(
          previousTransactionsResponse.transactions ?? []
        );
        const nextTrendComparison = {
          incomeChange: calculatePercentChange(
            currentPeriod.income,
            previousPeriod.income
          ),
          expensesChange: calculatePercentChange(
            currentPeriod.expenses,
            previousPeriod.expenses
          ),
          savingsRateChange: calculatePercentChange(
            currentPeriod.savingsRate,
            previousPeriod.savingsRate
          ),
          savingsRatePointChange:
            previousPeriod.income > 0
              ? currentPeriod.savingsRate - previousPeriod.savingsRate
              : null,
          label: comparisonRange.label,
        };
        const normalizedBudgets = budgetsResponse.budgets ?? budgetsResponse.data ?? [];
        const normalizedGoals = (savingsBucketsResponse.buckets ?? [])
          .slice(0, 3)
          .map((bucket) => ({
            id: bucket.id,
            name: bucket.name,
            current: Number(bucket.current ?? bucket.current_amount ?? 0),
            target: Number(bucket.target ?? bucket.target_amount ?? 0),
            icon: resolveIcon(bucket.icon),
            color: bucket.color ?? "bg-primary/10 text-primary",
            autoSave: Boolean(
              bucket.autoSave?.enabled ??
                bucket.auto_save_enabled ??
                bucket.autosave_enabled,
            ),
          }));

        setSummary(summaryResponse);
        setAccounts(accountsResponse.accounts ?? accountsResponse.data ?? []);
        setCategories(categoriesResponse.categories ?? []);
        setRecentTransactions(recentResponse.transactions);
        setCashflow(cashflowResponse.cashflow);
        setBudgets(normalizedBudgets);
        setSavingsGoals(normalizedGoals);
        setFirstName(
          profileResponse.data?.first_name ??
            String(profileResponse.data?.full_name ?? user?.user_metadata?.first_name ?? "")
              .trim()
              .split(" ")[0],
        );
        setDashboardInsights(
          buildDashboardInsights({
            transactions: currentTransactionsResponse.transactions ?? [],
            summary: summaryResponse,
            budgets: normalizedBudgets,
            goals: normalizedGoals,
            trendComparison: nextTrendComparison,
          }),
        );
        setTrendComparison(nextTrendComparison);
        setHasLoadedOnce(true);
      } catch (error) {
        console.error(error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [reloadTick]);

  const refreshDashboard = () => {
    setReloadTick((value) => value + 1);
  };

  const openAddDialog = (mode: DialogMode) => {
    setAddDialogMode(mode);
    setAddDialogOpen(true);
  };

  const handleCreateTransaction = async (transaction: {
    account_id: string;
    amount: number;
    fee_amount?: number;
    payment_method: string;
    type: "expense" | "income";
    category_id: string;
    description: string;
    date: string;
  }) => {
    await api.post("/transactions", transaction);
    refreshDashboard();
  };

  const handleCreateTransfer = async (transfer: AccountTransferInput) => {
    await createAccountTransfer(transfer);
    refreshDashboard();
  };

  if (isLoading && !hasLoadedOnce) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-9 w-64 rounded-md bg-muted" />
            <div className="mt-2 h-4 w-72 rounded-md bg-muted" />
          </div>
          <div className="h-10 w-36 rounded-md bg-muted" />
        </div>

        <Card>
          <CardContent className="p-5">
            <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="h-6 w-24 rounded-full bg-muted" />
                  <div className="h-6 w-32 rounded-full bg-muted" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-20 rounded-md bg-muted" />
                  <div className="h-7 w-80 rounded-md bg-muted" />
                  <div className="h-4 w-full rounded-md bg-muted" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-24 rounded-lg border bg-muted/30" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <CardSkeleton count={5} variant="stat" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="h-6 w-40 rounded-md bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-80 rounded-md bg-muted" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-6 w-44 rounded-md bg-muted" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-40 rounded-md bg-muted" />
                      <div className="h-3 w-28 rounded-md bg-muted" />
                    </div>
                    <div className="h-4 w-24 rounded-md bg-muted" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-6 w-44 rounded-md bg-muted" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-32 rounded-md bg-muted" />
                      <div className="h-4 w-20 rounded-md bg-muted" />
                    </div>
                    <div className="h-2 rounded-full bg-muted" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-6 w-48 rounded-md bg-muted" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="h-5 w-5 rounded-full bg-muted" />
                    <div className="h-4 flex-1 rounded-md bg-muted" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <div className="h-5 w-36 rounded-md bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-muted/40 p-3">
                  <div className="h-3 w-32 rounded-md bg-muted" />
                  <div className="mt-2 h-6 w-40 rounded-md bg-muted" />
                  <div className="mt-2 h-3 w-20 rounded-md bg-muted" />
                </div>
              </CardContent>
            </Card>

            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="h-5 w-36 rounded-md bg-muted" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {Array.from({ length: 3 }).map((__, rowIndex) => (
                    <div key={rowIndex} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-28 rounded-md bg-muted" />
                        <div className="h-3 w-20 rounded-md bg-muted" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <div className="h-5 w-5 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-36 rounded-md bg-muted" />
                    <div className="h-3 w-full rounded-md bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        description="We couldn't load your financial overview. Please try again."
        onRetry={() => {
          setHasError(false);
          refreshDashboard();
        }}
      />
    );
  }

  const safeSpend = getSafeSpend(summary);
  const supportingRecommendations = dashboardInsights.recommendations.slice(1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Good morning{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-muted-foreground mt-1">
            {"Here's your financial overview for today"}
          </p>
        </div>
        <Button
          className="w-full gap-2 sm:w-auto"
          onClick={() => openAddDialog("transaction")}
        >
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      <TodayFocusCard
        insights={dashboardInsights}
        summary={summary}
        budgets={budgets}
        goals={savingsGoals}
        onAddTransaction={() => openAddDialog("transaction")}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        <StatCard
          title="Total Balance"
          value={summary.totalBalance}
          change="Across all accounts"
          trend="neutral"
          icon={Wallet}
          iconColor="bg-primary/10 text-primary"
          isCurrency={true}
        />
        <StatCard
          title="Monthly Income"
          value={summary.monthlyIncome}
          change={formatDirectionalChange({
            metric: "Income",
            change: trendComparison.incomeChange,
            label: trendComparison.label,
          })}
          trend={getTrendFromChange(trendComparison.incomeChange)}
          icon={TrendingUp}
          iconColor="bg-success/10 text-success"
          isCurrency={true}
        />
        <StatCard
          title="Monthly Expenses"
          value={summary.monthlyExpenses}
          change={formatDirectionalChange({
            metric: "Expenses",
            change: trendComparison.expensesChange,
            label: trendComparison.label,
            inverse: true,
          })}
          trend={getTrendFromChange(trendComparison.expensesChange, true)}
          icon={TrendingDown}
          iconColor="bg-destructive/10 text-destructive"
          isCurrency={true}
        />
        <StatCard
          title="Savings Rate"
          value={`${summary.savingsRate}%`}
          change={formatDirectionalChange({
            metric: "Savings rate",
            change: trendComparison.savingsRatePointChange,
            label: trendComparison.label,
            unit: "points",
          })}
          trend={getTrendFromChange(trendComparison.savingsRatePointChange)}
          icon={PiggyBank}
          iconColor="bg-chart-4/10 text-chart-4"
        />
        <StatCard
          title="Safe Daily Spend"
          value={
            safeSpend === null
              ? "No data"
              : Math.max(safeSpend.perDay, 0)
          }
          change={
            safeSpend === null
              ? "Add income to calculate this"
              : safeSpend.remaining >= 0
                ? `${formatCurrency(safeSpend.remaining)} left for ${safeSpend.targetSavingsRate}% savings`
                : `${formatCurrency(Math.abs(safeSpend.remaining))} past target`
          }
          trend={
            safeSpend === null
              ? "neutral"
              : safeSpend.remaining >= 0
                ? "up"
                : "down"
          }
          icon={CalendarClock}
          iconColor="bg-primary/10 text-primary"
          isCurrency={typeof safeSpend?.perDay === "number"}
        />
        <StatCard
          title="Money Runway"
          value={
            dashboardInsights.metrics.daysUntilRunout === null
              ? "No data"
              : `${dashboardInsights.metrics.daysUntilRunout} days`
          }
          change={
            dashboardInsights.metrics.daysUntilRunout === null
              ? "Add expenses to estimate this"
              : `At your current spending rate`
          }
          trend={
            dashboardInsights.metrics.daysUntilRunout === null
              ? "neutral"
              : dashboardInsights.metrics.daysUntilRunout < 30
                ? "down"
                : "up"
          }
          icon={Clock}
          iconColor="bg-amber-500/10 text-amber-600"
        />
      </div>

      <BudgetDangerCard budgets={budgets} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Charts & Spending Breakdown */}
        <div className="lg:col-span-2 space-y-8">
          <SpendingChart data={cashflow} />
          <RecentTransactions
            transactions={recentTransactions.map((transaction) => ({
              id: transaction.id,
              name: transaction.description,
              category: transaction.categories?.name ?? "Uncategorized",
              icon: resolveIcon(transaction.categories?.icon),
              amount:
                transaction.type === "income"
                  ? Math.max(
                      Number(transaction.amount) - Math.max(Number(transaction.fee_amount ?? 0), 0),
                      0,
                    )
                  : -(
                      Number(transaction.amount) +
                      Math.max(Number(transaction.fee_amount ?? 0), 0)
                    ),
              date: formatDashboardDate(transaction.date),
              color: transaction.categories?.color,
            }))}
          />
          <SpendingBreakdownCard categories={dashboardInsights.categories} />
          <SmartRecommendationsCard
            recommendations={supportingRecommendations}
          />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-8">
          <FinancialProfileCard metrics={dashboardInsights.metrics} />
          <AccountsCard
            accounts={accounts.map((account) => ({
              name: account.name,
              type: account.type,
              balance: Number(account.balance ?? 0),
            }))}
          />
          <BudgetOverview
            budgets={budgets.slice(0, 4).map((budget) => ({
              category: budget.categories?.name ?? budget.category_id?.name ?? "Budget",
              spent: Number(budget.spent ?? budget.expense ?? 0),
              budget: Number(budget.budget ?? budget.amount ?? 0),
            }))}
          />
          <SavingsGoals goals={savingsGoals} />
          <CashRunwayAlertCard metrics={dashboardInsights.metrics} />
        </div>
      </div>
      <AddTransactionDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        accounts={accounts}
        categories={categories}
        defaultMode={addDialogMode}
        onSubmit={handleCreateTransaction}
        onTransferSubmit={handleCreateTransfer}
      />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
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
  ArrowUpRight,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardSkeleton } from "@/components/skeletons";
import { ErrorState } from "@/components/states";
import api from "@/lib/api";
import { supabase } from "@/lib/supabase";
import {
  calculatePercentChange,
  formatPercentChange,
  getComparisonRange,
  getTrendFromChange,
  summarizeTransactions,
  type TransactionLike,
} from "@/lib/period-comparison";

type DashboardSummary = {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
};

type TrendComparison = {
  incomeChange: number | null;
  expensesChange: number | null;
  savingsRateChange: number | null;
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

const emptyInsights: DashboardInsights = {
  categories: [],
  metrics: {
    totalSpending: 0,
    monthlyIncome: 0,
    remainingBalance: 0,
    spendingRate: 0,
    classification: "Not enough data",
    classificationColor: "text-muted-foreground",
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
}: {
  transactions: any[];
  summary: DashboardSummary;
}): DashboardInsights => {
  const categoryTotals = new Map<string, number>();
  let expenses = 0;

  transactions.forEach((transaction) => {
    if (transaction.type !== "expense") {
      return;
    }

    const amount = Number(transaction.amount ?? 0);
    const category = transaction.categories?.name ?? "Uncategorized";
    expenses += amount;
    categoryTotals.set(category, (categoryTotals.get(category) ?? 0) + amount);
  });

  const totalSpending = summary.monthlyExpenses || expenses;
  const monthlyIncome = summary.monthlyIncome;
  const remainingBalance = summary.totalBalance;
  const spendingRate =
    monthlyIncome > 0 ? (totalSpending / monthlyIncome) * 100 : 0;
  const dailySpending = totalSpending / 30;
  const daysUntilRunout =
    dailySpending > 0 ? Math.ceil(remainingBalance / dailySpending) : null;

  let classification = "Not enough data";
  let classificationColor = "text-muted-foreground";

  if (monthlyIncome > 0 || totalSpending > 0) {
    if (spendingRate > 70) {
      classification = "High Spender";
      classificationColor = "text-destructive";
    } else if (spendingRate < 40) {
      classification = "Cautious Spender";
      classificationColor = "text-success";
    } else {
      classification = "Moderate Spender";
      classificationColor = "text-blue-600";
    }
  }

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
  const recommendations = [
    spendingRate > 70
      ? "Your spending is above 70% of income this month. Review flexible categories before the month closes."
      : monthlyIncome > 0
        ? "Your spending is staying within a healthy range for the current month."
        : "",
    topCategory && topCategory.percentage > 40
      ? `${topCategory.label} is ${topCategory.percentage}% of spending. A small cap here would have the biggest impact.`
      : topCategory
        ? `${topCategory.label} is your largest expense category this month. Keep an eye on it.`
        : "",
    summary.savingsRate < 20 && monthlyIncome > 0
      ? "Consider moving a fixed amount into a savings goal after each income transaction."
      : summary.savingsRate >= 20
        ? `Nice savings rate this month: ${summary.savingsRate}%. Keep that rhythm going.`
        : "",
  ].filter(Boolean);

  return {
    categories,
    metrics: {
      totalSpending,
      monthlyIncome,
      remainingBalance,
      spendingRate,
      classification,
      classificationColor,
      daysUntilRunout,
    },
    recommendations,
  };
};

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [summary, setSummary] = useState<DashboardSummary>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsRate: 0,
  });
  const [accounts, setAccounts] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [cashflow, setCashflow] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [firstName, setFirstName] = useState("");
  const [dashboardInsights, setDashboardInsights] =
    useState<DashboardInsights>(emptyInsights);
  const [trendComparison, setTrendComparison] = useState<TrendComparison>({
    incomeChange: null,
    expensesChange: null,
    savingsRateChange: null,
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
          cashflowResponse,
          budgetsResponse,
          savingsBucketsResponse,
          currentTransactionsResponse,
          previousTransactionsResponse,
          profileResponse,
        ] = await Promise.all([
          api.get<DashboardSummary>("/dashboard/summary"),
          api.get<{ accounts: any[]; data?: any[] }>("/accounts"),
          api.get<{ transactions: any[] }>("/dashboard/recent-transactions"),
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

        setSummary(summaryResponse);
        setAccounts(accountsResponse.accounts ?? accountsResponse.data ?? []);
        setRecentTransactions(recentResponse.transactions);
        setCashflow(cashflowResponse.cashflow);
        setBudgets(budgetsResponse.budgets ?? budgetsResponse.data ?? []);
        setSavingsGoals(
          (savingsBucketsResponse.buckets ?? []).slice(0, 3).map((bucket) => ({
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
          })),
        );
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
          }),
        );
        setTrendComparison({
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
          label: comparisonRange.label,
        });
      } catch (error) {
        console.error(error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-9 w-64 rounded-md bg-muted" />
            <div className="mt-2 h-4 w-72 rounded-md bg-muted" />
          </div>
          <div className="h-10 w-36 rounded-md bg-muted" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton count={4} variant="stat" />
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
          setIsLoading(true);
        }}
      />
    );
  }

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
        <Button className="w-full gap-2 sm:w-auto">
          <ArrowUpRight className="h-4 w-4" />
          Quick Transfer
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
          change={formatPercentChange(
            trendComparison.incomeChange,
            trendComparison.label
          )}
          trend={getTrendFromChange(trendComparison.incomeChange)}
          icon={TrendingUp}
          iconColor="bg-success/10 text-success"
          isCurrency={true}
        />
        <StatCard
          title="Monthly Expenses"
          value={summary.monthlyExpenses}
          change={formatPercentChange(
            trendComparison.expensesChange,
            trendComparison.label
          )}
          trend={getTrendFromChange(trendComparison.expensesChange, true)}
          icon={TrendingDown}
          iconColor="bg-destructive/10 text-destructive"
          isCurrency={true}
        />
        <StatCard
          title="Savings Rate"
          value={`${summary.savingsRate}%`}
          change={formatPercentChange(
            trendComparison.savingsRateChange,
            trendComparison.label
          )}
          trend={getTrendFromChange(trendComparison.savingsRateChange)}
          icon={PiggyBank}
          iconColor="bg-chart-4/10 text-chart-4"
        />
      </div>

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
                  ? Number(transaction.amount)
                  : -Number(transaction.amount),
              date: formatDashboardDate(transaction.date),
              color: transaction.categories?.color,
            }))}
          />
          <SpendingBreakdownCard categories={dashboardInsights.categories} />
          <SmartRecommendationsCard
            recommendations={dashboardInsights.recommendations}
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
    </div>
  );
}

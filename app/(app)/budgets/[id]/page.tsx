"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState } from "@/components/states";
import { CardSkeleton } from "@/components/skeletons";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Bus,
  CalendarDays,
  Clock,
  Gamepad2,
  HeartHandshake,
  Home,
  Lightbulb,
  Percent,
  ReceiptText,
  ShieldCheck,
  Target,
  Utensils,
  Wallet,
  Wifi,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type BudgetPeriod = "weekly" | "monthly" | "yearly" | "onetime" | "custom";
type BudgetStatus = "safe" | "warning" | "over";

type BudgetDetail = {
  id: number;
  category: string;
  name: string;
  spent: number;
  budget: number;
  type: BudgetPeriod;
  icon: LucideIcon;
  createdDate?: Date;
  startDate?: Date;
  endDate?: Date;
};

type RelatedTransaction = {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  account: string;
};

const dayMs = 24 * 60 * 60 * 1000;
const naira = "\u20a6";

const budgets: BudgetDetail[] = [
  {
    id: 1,
    category: "Food",
    name: "Food Budget",
    spent: 6800,
    budget: 8000,
    type: "monthly",
    icon: Utensils,
    createdDate: new Date(Date.now() - 8 * dayMs),
  },
  {
    id: 2,
    category: "Transport",
    name: "Transport Budget",
    spent: 3200,
    budget: 5000,
    type: "monthly",
    icon: Bus,
    createdDate: new Date(Date.now() - 10 * dayMs),
  },
  {
    id: 3,
    category: "Data Subscription",
    name: "Data Subscription Budget",
    spent: 4500,
    budget: 4000,
    type: "monthly",
    icon: Wifi,
    createdDate: new Date(Date.now() - 12 * dayMs),
  },
  {
    id: 4,
    category: "Rent/Hostel",
    name: "Hostel Budget",
    spent: 70000,
    budget: 70000,
    type: "monthly",
    icon: Home,
    createdDate: new Date(Date.now() - 18 * dayMs),
  },
  {
    id: 5,
    category: "School Materials",
    name: "School Materials Budget",
    spent: 9000,
    budget: 15000,
    type: "monthly",
    icon: BookOpen,
    createdDate: new Date(Date.now() - 15 * dayMs),
  },
  {
    id: 6,
    category: "Personal Care",
    name: "Personal Care Budget",
    spent: 5200,
    budget: 7000,
    type: "monthly",
    icon: HeartHandshake,
    createdDate: new Date(Date.now() - 9 * dayMs),
  },
  {
    id: 7,
    category: "Entertainment",
    name: "Entertainment Budget",
    spent: 3500,
    budget: 6000,
    type: "weekly",
    icon: Gamepad2,
    createdDate: new Date(Date.now() - 4 * dayMs),
  },
  {
    id: 8,
    category: "Emergency",
    name: "Emergency Budget",
    spent: 0,
    budget: 10000,
    type: "custom",
    icon: ShieldCheck,
    startDate: new Date(2026, 3, 1),
    endDate: new Date(2026, 3, 30),
  },
];

const relatedTransactions: RelatedTransaction[] = [
  {
    id: "txn-001",
    title: "Cafeteria lunch",
    category: "Food",
    date: "2026-04-28",
    amount: 1200,
    account: "Cash",
  },
  {
    id: "txn-002",
    title: "Snacks after lectures",
    category: "Food",
    date: "2026-04-27",
    amount: 800,
    account: "Opay",
  },
  {
    id: "txn-003",
    title: "Dinner at hostel gate",
    category: "Food",
    date: "2026-04-26",
    amount: 1500,
    account: "Bank Account",
  },
  {
    id: "txn-004",
    title: "Campus shuttle",
    category: "Transport",
    date: "2026-04-28",
    amount: 600,
    account: "Cash",
  },
  {
    id: "txn-005",
    title: "Bus fare to town",
    category: "Transport",
    date: "2026-04-25",
    amount: 1100,
    account: "PalmPay",
  },
  {
    id: "txn-006",
    title: "Monthly data plan",
    category: "Data Subscription",
    date: "2026-04-22",
    amount: 3500,
    account: "Kuda",
  },
  {
    id: "txn-007",
    title: "Project handout printing",
    category: "School Materials",
    date: "2026-04-24",
    amount: 2500,
    account: "Cash",
  },
  {
    id: "txn-008",
    title: "Toiletries restock",
    category: "Personal Care",
    date: "2026-04-23",
    amount: 2200,
    account: "Savings Wallet",
  },
  {
    id: "txn-009",
    title: "Department hangout",
    category: "Entertainment",
    date: "2026-04-26",
    amount: 3000,
    account: "Opay",
  },
];

const periodLabels: Record<BudgetPeriod, string> = {
  weekly: "Weekly budget",
  monthly: "Monthly budget",
  yearly: "Yearly budget",
  onetime: "One-time budget",
  custom: "Custom budget",
};

function formatCurrency(value: number) {
  return `${naira}${Math.round(value).toLocaleString("en-NG")}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
  });
}

function calculateBudgetUsagePercent(spent: number, limit: number) {
  if (limit <= 0) return 0;
  return (spent / limit) * 100;
}

function calculateBudgetStatus(percentageUsed: number): BudgetStatus {
  if (percentageUsed >= 100) return "over";
  if (percentageUsed >= 70) return "warning";
  return "safe";
}

function calculateRemainingAmount(spent: number, limit: number) {
  return Math.abs(limit - spent);
}

function getStatusConfig(status: BudgetStatus) {
  const configs = {
    safe: {
      label: "Safe",
      risk: "Low Risk",
      badgeClass:
        "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20",
      progressClass: "[&>div]:bg-emerald-500",
      iconClass: "bg-emerald-500/10 text-emerald-600",
      panelClass: "border-emerald-500/20 bg-emerald-500/5",
    },
    warning: {
      label: "Warning",
      risk: "High Risk",
      badgeClass: "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20",
      progressClass: "[&>div]:bg-amber-500",
      iconClass: "bg-amber-500/10 text-amber-600",
      panelClass: "border-amber-500/20 bg-amber-500/5",
    },
    over: {
      label: "Over Budget",
      risk: "Over Budget",
      badgeClass: "bg-rose-500/10 text-rose-700 hover:bg-rose-500/20",
      progressClass: "[&>div]:bg-rose-500",
      iconClass: "bg-rose-500/10 text-rose-600",
      panelClass: "border-rose-500/20 bg-rose-500/5",
    },
  };

  return configs[status];
}

function getPeriodLength(budget: BudgetDetail) {
  if ((budget.type === "custom" || budget.type === "onetime") && budget.startDate && budget.endDate) {
    return Math.max(
      1,
      Math.ceil((budget.endDate.getTime() - budget.startDate.getTime()) / dayMs)
    );
  }

  if (budget.type === "weekly") return 7;
  if (budget.type === "yearly") return 365;
  return 30;
}

function getDaysElapsed(budget: BudgetDetail) {
  const startDate = budget.startDate ?? budget.createdDate ?? new Date();
  return Math.max(1, Math.ceil((Date.now() - startDate.getTime()) / dayMs));
}

function calculateProjection(budget: BudgetDetail) {
  const totalDays = getPeriodLength(budget);
  const daysElapsed = Math.min(getDaysElapsed(budget), totalDays);
  const averageDailySpend = budget.spent / Math.max(1, daysElapsed);
  const projectedSpending = averageDailySpend * totalDays;
  const daysUntilExceeded =
    budget.spent >= budget.budget
      ? 0
      : averageDailySpend > 0
        ? Math.ceil((budget.budget - budget.spent) / averageDailySpend)
        : null;

  return {
    totalDays,
    daysElapsed,
    averageDailySpend,
    projectedSpending,
    daysUntilExceeded,
  };
}

function getRecommendation(
  budget: BudgetDetail,
  status: BudgetStatus,
  projection: ReturnType<typeof calculateProjection>
) {
  const reduction = Math.max(100, Math.ceil((budget.spent - budget.budget / 2) / 10) * 10);
  const remainingDays = Math.max(
    0,
    projection.totalDays - projection.daysElapsed
  );

  if (status === "over") {
    return `You have exceeded this budget. Pause non-essential ${budget.category.toLowerCase()} spending and review the latest transactions before spending more.`;
  }

  if (status === "warning") {
    return `At your current pace, this budget may be exceeded${
      projection.daysUntilExceeded ? ` in ${projection.daysUntilExceeded} days` : ""
    }. Try reducing daily spending in this category by about ${formatCurrency(reduction)}.`;
  }

  if (
    projection.daysUntilExceeded !== null &&
    projection.daysUntilExceeded <= remainingDays
  ) {
    return `You are still within this budget, but your current pace may exceed it in ${projection.daysUntilExceeded} days. Try spacing out ${budget.category.toLowerCase()} spending this week.`;
  }

  return `This budget is safe based on your current spending pace. Keep tracking ${budget.category.toLowerCase()} expenses so it stays that way.`;
}

function BudgetDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-9 w-28 rounded-md bg-muted" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="h-8 w-56 rounded-md bg-muted" />
            <div className="h-4 w-72 max-w-full rounded-md bg-muted" />
            <div className="h-6 w-36 rounded-md bg-muted" />
          </div>
          <div className="h-10 w-28 rounded-md bg-muted" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton count={4} variant="stat" />
      </div>

      <Card>
        <CardHeader>
          <div className="h-5 w-40 rounded-md bg-muted" />
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="h-3 rounded-full bg-muted" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="h-16 rounded-lg bg-muted" />
            <div className="h-16 rounded-lg bg-muted" />
            <div className="h-16 rounded-lg bg-muted" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton count={4} variant="content" />
      </div>

      <Card>
        <CardHeader>
          <div className="h-5 w-44 rounded-md bg-muted" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-20 rounded-lg bg-muted" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function BudgetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const budgetId = Number(params.id);
  const budget = budgets.find((item) => item.id === budgetId);

  const pageData = useMemo(() => {
    if (!budget) return null;

    const percentageUsed = calculateBudgetUsagePercent(budget.spent, budget.budget);
    const status = calculateBudgetStatus(percentageUsed);
    const statusConfig = getStatusConfig(status);
    const amountDifference = calculateRemainingAmount(budget.spent, budget.budget);
    const projection = calculateProjection(budget);
    const transactions = relatedTransactions.filter(
      (transaction) => transaction.category === budget.category
    );

    return {
      percentageUsed,
      roundedPercentage: Math.round(percentageUsed),
      progressValue: Math.min(percentageUsed, 100),
      status,
      statusConfig,
      amountDifference,
      projection,
      transactions,
      recommendation: getRecommendation(
        budget,
        status,
        projection
      ),
    };
  }, [budget]);

  const retry = () => {
    setHasError(false);
    setIsLoading(true);
    window.setTimeout(() => setIsLoading(false), 600);
  };

  if (isLoading) {
    return <BudgetDetailSkeleton />;
  }

  if (hasError) {
    return (
      <ErrorState
        title="Failed to load budget"
        description="Something went wrong while loading this budget. Please try again."
        onRetry={retry}
        retryLabel="Retry"
      />
    );
  }

  if (!budget || !pageData) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          className="gap-2 px-0 sm:px-3"
          onClick={() => router.push("/budgets")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Budgets
        </Button>
        <EmptyState
          icon={Target}
          title="Budget not found"
          description="This budget may have been removed or does not exist."
          action={{
            label: "Back to Budgets",
            onClick: () => router.push("/budgets"),
          }}
        />
      </div>
    );
  }

  const Icon = budget.icon;
  const remainingLabel =
    budget.spent > budget.budget
      ? `${formatCurrency(pageData.amountDifference)} over budget`
      : `${formatCurrency(pageData.amountDifference)} remaining`;
  const remainingTitle = budget.spent > budget.budget ? "Amount Over" : "Amount Remaining";
  const projectionRisk =
    pageData.status === "over"
      ? "Over Budget"
      : pageData.projection.projectedSpending >= budget.budget ||
          pageData.status === "warning"
        ? "High Risk"
        : "Low Risk";

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Button
          variant="ghost"
          className="gap-2 px-0 sm:px-3"
          onClick={() => router.push("/budgets")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Budgets
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className={cn("rounded-lg p-2.5", pageData.statusConfig.iconClass)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {budget.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {periodLabels[budget.type]} · {budget.category}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn("text-xs", pageData.statusConfig.badgeClass)}>
                Status: {pageData.statusConfig.label}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {pageData.projection.daysElapsed} of {pageData.projection.totalDays} days used
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Budget Amount"
          value={formatCurrency(budget.budget)}
          change={periodLabels[budget.type]}
          icon={Target}
          iconColor="bg-primary/10 text-primary"
        />
        <StatCard
          title="Amount Spent"
          value={formatCurrency(budget.spent)}
          change={`${pageData.roundedPercentage}% of budget`}
          trend={pageData.status === "over" ? "down" : "neutral"}
          icon={ReceiptText}
          iconColor="bg-rose-500/10 text-rose-600"
        />
        <StatCard
          title={remainingTitle}
          value={formatCurrency(pageData.amountDifference)}
          change={remainingLabel}
          trend={budget.spent > budget.budget ? "down" : "up"}
          icon={Wallet}
          iconColor={pageData.statusConfig.iconClass}
        />
        <StatCard
          title="Percentage Used"
          value={`${pageData.roundedPercentage}%`}
          change={pageData.statusConfig.label}
          trend={pageData.status === "safe" ? "up" : pageData.status === "over" ? "down" : "neutral"}
          icon={Percent}
          iconColor={pageData.statusConfig.iconClass}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            Budget Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">
                {formatCurrency(budget.spent)} of {formatCurrency(budget.budget)} used
              </span>
              <span className="font-medium">{pageData.roundedPercentage}% used</span>
            </div>
            <Progress
              value={pageData.progressValue}
              className={cn("h-3", pageData.statusConfig.progressClass)}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Spent
              </p>
              <p className="mt-1 text-lg font-semibold">{formatCurrency(budget.spent)}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                {budget.spent > budget.budget ? "Over" : "Left"}
              </p>
              <p className="mt-1 text-lg font-semibold">
                {formatCurrency(pageData.amountDifference)}
              </p>
            </div>
            <div className={cn("rounded-lg border p-4", pageData.statusConfig.panelClass)}>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Status
              </p>
              <p className="mt-1 text-lg font-semibold">
                {pageData.statusConfig.label}
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {budget.spent > budget.budget
              ? `${formatCurrency(pageData.amountDifference)} over budget`
              : `${formatCurrency(pageData.amountDifference)} remaining`}
          </p>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Spending Projection</h2>
          <p className="text-sm text-muted-foreground">
            Based on spending so far in this budget period.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Average Daily Spending
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {formatCurrency(pageData.projection.averageDailySpend)}
                  </p>
                </div>
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                  <CalendarDays className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Projected End Spending
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {formatCurrency(pageData.projection.projectedSpending)}
                  </p>
                </div>
                <div className={cn("rounded-lg p-2.5", pageData.statusConfig.iconClass)}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    May Be Exceeded In
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {pageData.projection.daysUntilExceeded === null
                      ? "Not likely"
                      : pageData.projection.daysUntilExceeded === 0
                        ? "Now"
                        : `${pageData.projection.daysUntilExceeded} days`}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-2.5 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Risk Level
                  </p>
                  <p className="mt-1 text-2xl font-bold">{projectionRisk}</p>
                </div>
                <div className={cn("rounded-lg p-2.5", pageData.statusConfig.iconClass)}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ReceiptText className="h-4 w-4" />
            Related Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pageData.transactions.length === 0 ? (
            <EmptyState
              variant="inline"
              icon={ReceiptText}
              title="No transactions found for this budget yet."
              description="Transactions in this category will appear here when they are recorded."
            />
          ) : (
            <div className="space-y-3">
              {pageData.transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={cn("shrink-0 rounded-lg p-2.5", pageData.statusConfig.iconClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium">{transaction.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category} · {formatDate(transaction.date)} · {transaction.account}
                      </p>
                    </div>
                  </div>
                  <p className="text-base font-semibold text-destructive sm:text-right">
                    -{formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className={cn("border", pageData.statusConfig.panelClass)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4" />
            Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">
            {pageData.recommendation}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-background/60 p-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Keep Daily Spend Under
              </p>
              <p className="mt-1 font-semibold">
                {budget.spent >= budget.budget
                  ? formatCurrency(0)
                  : formatCurrency(
                      (budget.budget - budget.spent) /
                        Math.max(
                          1,
                          pageData.projection.totalDays - pageData.projection.daysElapsed
                        )
                    )}
              </p>
            </div>
            <div className="rounded-lg border bg-background/60 p-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Best Account To Review
              </p>
              <p className="mt-1 font-semibold">
                {pageData.transactions[0]?.account ?? "No account yet"}
              </p>
            </div>
            <div className="rounded-lg border bg-background/60 p-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Spending Pace
              </p>
              <p className="mt-1 font-semibold">
                {pageData.status === "safe"
                  ? "Comfortable"
                  : pageData.status === "warning"
                    ? "Close to limit"
                    : "Needs action"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Bell,
  BellOff,
  Car,
  Gamepad2,
  Heart,
  Home,
  Plane,
  Plus,
  ShoppingBag,
  Target,
  TrendingDown,
  TrendingUp,
  Utensils,
  Wifi,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { BudgetDialog } from "@/components/budgets/budget-dialog";
import { SavingsBuckets } from "@/components/budgets/savings-buckets";
import { CardSkeleton } from "@/components/skeletons";
import { ErrorState, EmptyState } from "@/components/states";

type BudgetItem = {
  id: number;
  category: string;
  spent: number;
  budget: number;
  icon: LucideIcon;
  alerts: boolean;
  type: "weekly" | "monthly" | "yearly" | "custom";
  createdDate?: Date;
  startDate?: Date;
  endDate?: Date;
};

const formatCurrency = (value: number) =>
  `${"\u20a6"}${value.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const budgets: BudgetItem[] = [
  {
    id: 1,
    category: "Food & Dining",
    spent: 680,
    budget: 800,
    icon: Utensils,
    alerts: true,
    type: "monthly",
    createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
  {
    id: 2,
    category: "Transportation",
    spent: 320,
    budget: 400,
    icon: Car,
    alerts: true,
    type: "monthly",
    createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: 3,
    category: "Shopping",
    spent: 450,
    budget: 350,
    icon: ShoppingBag,
    alerts: true,
    type: "weekly",
    createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 4,
    category: "Housing",
    spent: 2200,
    budget: 2200,
    icon: Home,
    alerts: false,
    type: "monthly",
    createdDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
  {
    id: 5,
    category: "Utilities",
    spent: 180,
    budget: 250,
    icon: Wifi,
    alerts: true,
    type: "monthly",
    createdDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
  },
  {
    id: 6,
    category: "Health",
    spent: 120,
    budget: 200,
    icon: Heart,
    alerts: false,
    type: "yearly",
    createdDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
  {
    id: 7,
    category: "Entertainment",
    spent: 180,
    budget: 200,
    icon: Gamepad2,
    alerts: true,
    type: "monthly",
    createdDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
  },
  {
    id: 8,
    category: "Travel",
    spent: 0,
    budget: 500,
    icon: Plane,
    alerts: false,
    type: "custom",
    startDate: new Date(2025, 2, 1),
    endDate: new Date(2025, 2, 15),
  },
];

const budgetTypeLabels: Record<BudgetItem["type"], string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
  custom: "Custom Range",
};

function getBudgetStatus(percentageUsed: number) {
  if (percentageUsed < 75) {
    return {
      label: "Safe",
      color: "#10b981",
      progressClass: "[&>div]:bg-[#10b981]",
      badgeClass: "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20",
      borderClass: "border-emerald-500/20",
    };
  }

  if (percentageUsed <= 95) {
    return {
      label: "Warning",
      color: "#f59e0b",
      progressClass: "[&>div]:bg-[#f59e0b]",
      badgeClass: "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20",
      borderClass: "border-amber-500/30",
    };
  }

  return {
    label: "Danger",
    color: "#f43f5e",
    progressClass: "[&>div]:bg-[#f43f5e]",
    badgeClass: "bg-rose-500/10 text-rose-700 hover:bg-rose-500/20",
    borderClass: "border-rose-500/40",
  };
}

function BudgetCard({
  budget,
  onOpen,
}: {
  budget: BudgetItem;
  onOpen: () => void;
}) {
  const percentageUsed = (budget.spent / budget.budget) * 100;
  const displayPercentage = Math.round(percentageUsed);
  const progressValue = Math.min(percentageUsed, 100);
  const isOverBudget = budget.spent > budget.budget;
  const variance = isOverBudget
    ? budget.spent - budget.budget
    : budget.budget - budget.spent;
  const status = getBudgetStatus(percentageUsed);
  const Icon = budget.icon;

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-shadow cursor-pointer",
        status.borderClass,
        isOverBudget && "border-destructive/50"
      )}
      onClick={onOpen}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="shrink-0 rounded-lg p-2.5"
              style={{
                backgroundColor: `${status.color}1A`,
                color: status.color,
              }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-semibold">{budget.category}</p>
                <Badge variant="secondary" className="text-xs font-normal">
                  {budgetTypeLabels[budget.type]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(budget.spent)} of {formatCurrency(budget.budget)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {budget.alerts ? (
              <Bell className="h-4 w-4 text-primary" />
            ) : (
              <BellOff className="h-4 w-4 text-muted-foreground" />
            )}
            <Badge
              variant={isOverBudget ? "destructive" : "secondary"}
              className={cn("text-xs", !isOverBudget && status.badgeClass)}
            >
              {isOverBudget ? "Over" : status.label}
            </Badge>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-2xl font-bold tracking-tight">
                {formatCurrency(budget.spent)}
              </p>
              <p className="text-xs text-muted-foreground">
                {displayPercentage}% used
              </p>
            </div>
            <p
              className={cn(
                "text-right text-sm font-medium",
                isOverBudget ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {formatCurrency(variance)} {isOverBudget ? "over" : "remaining"}
            </p>
          </div>

          <Progress
            value={progressValue}
            className={cn("h-2", status.progressClass)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function BudgetsPage() {
  const router = useRouter();
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const selectedBudget: BudgetItem | null = null;
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const remainingBudget = totalBudget - totalSpent;
  const overBudgetItems = budgets.filter((b) => b.spent > b.budget);
  const safeBudgetItems = budgets.filter(
    (b) => (b.spent / b.budget) * 100 < 75
  );
  const warningBudgetItems = budgets.filter((b) => {
    const percentageUsed = (b.spent / b.budget) * 100;
    return percentageUsed >= 75 && percentageUsed <= 95;
  });
  const dangerBudgetItems = budgets.filter(
    (b) => (b.spent / b.budget) * 100 > 95
  );
  const tightestBudget = budgets.reduce((highest, budget) => {
    const highestPercentage = highest.spent / highest.budget;
    const budgetPercentage = budget.spent / budget.budget;

    return budgetPercentage > highestPercentage ? budget : highest;
  }, budgets[0]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-8 w-36 rounded-md bg-muted" />
            <div className="mt-2 h-4 w-72 rounded-md bg-muted" />
          </div>
          <div className="h-10 w-36 rounded-md bg-muted" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton count={4} variant="stat" />
        </div>

        <div className="h-10 w-56 rounded-md bg-muted" />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 rounded-md bg-muted" />
                        <div className="h-4 w-40 rounded-md bg-muted" />
                      </div>
                    </div>
                    <div className="h-6 w-16 rounded-full bg-muted" />
                  </div>
                  <div className="mt-5 space-y-2">
                    <div className="flex items-end justify-between">
                      <div className="space-y-2">
                        <div className="h-7 w-28 rounded-md bg-muted" />
                        <div className="h-3 w-16 rounded-md bg-muted" />
                      </div>
                      <div className="h-4 w-24 rounded-md bg-muted" />
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="h-fit">
            <CardHeader className="pb-3">
              <div className="h-6 w-36 rounded-md bg-muted" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="rounded-lg border p-3 text-center">
                    <div className="mx-auto h-6 w-8 rounded-md bg-muted" />
                    <div className="mx-auto mt-2 h-3 w-12 rounded-md bg-muted" />
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="h-3 w-24 rounded-md bg-muted" />
                <div className="mt-2 h-4 w-32 rounded-md bg-muted" />
                <div className="mt-2 h-4 w-16 rounded-md bg-muted" />
              </div>
              <div className="rounded-lg border p-3">
                <div className="h-3 w-28 rounded-md bg-muted" />
                <div className="mt-2 h-4 w-full rounded-md bg-muted" />
                <div className="mt-2 h-4 w-3/4 rounded-md bg-muted" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Manage your spending limits and track progress
          </p>
        </div>
        <ErrorState
          title="Failed to load budgets"
          description="We couldn&apos;t load your budgets. Please try again."
          onRetry={() => {
            setHasError(false);
            setIsLoading(true);
          }}
        />
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Manage your spending limits and track progress
          </p>
        </div>
        <EmptyState
          icon={Target}
          title="No budgets yet"
          description="Create your first budget to start tracking your spending and achieving your financial goals."
          action={{
            label: "Create Budget",
            onClick: () => setBudgetDialogOpen(true),
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Manage your spending limits and track progress
          </p>
        </div>
        <Button
          className="w-full gap-2 sm:w-auto"
          onClick={() => setBudgetDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create Budget
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Budget"
          value={formatCurrency(totalBudget)}
          change={`${budgets.length} active budgets`}
          icon={Target}
          iconColor="bg-primary/10 text-primary"
        />
        <StatCard
          title="Total Spent"
          value={formatCurrency(totalSpent)}
          change={`${Math.round((totalSpent / totalBudget) * 100)}% of budget`}
          trend="down"
          icon={TrendingDown}
          iconColor="bg-destructive/10 text-destructive"
        />
        <StatCard
          title={remainingBudget >= 0 ? "Remaining" : "Over Limit"}
          value={formatCurrency(Math.abs(remainingBudget))}
          change={
            remainingBudget >= 0
              ? "Available across budgets"
              : "Total overspend"
          }
          trend={remainingBudget >= 0 ? "up" : "down"}
          icon={TrendingUp}
          iconColor={
            remainingBudget >= 0
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          }
        />
        <StatCard
          title="Over Budget"
          value={overBudgetItems.length}
          change={
            overBudgetItems.length === 1
              ? "1 category over"
              : `${overBudgetItems.length} categories over`
          }
          trend={overBudgetItems.length > 0 ? "down" : "neutral"}
          icon={AlertTriangle}
          iconColor="bg-destructive/10 text-destructive"
        />
      </div>

      <Tabs defaultValue="budgets" className="space-y-6">
        <TabsList>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="savings">Savings Buckets</TabsTrigger>
        </TabsList>

        <TabsContent value="budgets" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {budgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  onOpen={() => router.push(`/budgets/${budget.id}`)}
                />
              ))}
            </div>

            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Budget Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-lg font-bold text-emerald-600">
                      {safeBudgetItems.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Safe</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-lg font-bold text-amber-600">
                      {warningBudgetItems.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Warning</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-lg font-bold text-rose-600">
                      {dangerBudgetItems.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Danger</p>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Tightest Budget
                  </p>
                  <p className="mt-1 font-semibold">{tightestBudget.category}</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round((tightestBudget.spent / tightestBudget.budget) * 100)}
                    % used
                  </p>
                </div>

                {overBudgetItems.length > 0 ? (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <p className="text-xs font-medium text-destructive">
                      Needs attention
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {overBudgetItems.length} budget
                      {overBudgetItems.length === 1 ? " is" : "s are"} over the
                      limit.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <p className="text-xs font-medium text-emerald-700">
                      No overages
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      All budgets are currently within their limits.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="savings">
          <SavingsBuckets />
        </TabsContent>
      </Tabs>

      <BudgetDialog
        open={budgetDialogOpen}
        onOpenChange={setBudgetDialogOpen}
        budget={selectedBudget}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CardSkeleton } from "@/components/skeletons";
import { ErrorState } from "@/components/states";
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CheckCircle,
  Lightbulb,
  Target,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number) =>
  `${"\u20a6"}${value.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const summaryCards = [
  {
    title: "Savings Rate",
    value: "18%",
    change: "2% below target",
    trend: "down" as const,
    icon: TrendingUp,
    iconColor: "bg-success/10 text-success",
  },
  {
    title: "Budget Risk",
    value: "Medium",
    change: "2 categories need attention",
    trend: "neutral" as const,
    icon: AlertCircle,
    iconColor: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Spending Stability",
    value: "Irregular",
    change: "Week to week variance",
    trend: "down" as const,
    icon: BarChart3,
    iconColor: "bg-chart-2/10 text-chart-2",
  },
  {
    title: "Spender Type",
    value: "Moderate",
    change: "Balanced overall",
    trend: "neutral" as const,
    icon: Target,
    iconColor: "bg-primary/10 text-primary",
  },
];

const spendingPatterns = [
  {
    title: "Food is the largest category",
    description: "Food & Dining is 38% of total expenses this month.",
    metric: "38%",
  },
  {
    title: "Transport is rising",
    description: "Transport spending increased by 25% compared to last month.",
    metric: "+25%",
  },
  {
    title: "Spending clusters early in the week",
    description: `Monday to Wednesday averages ${formatCurrency(8420)} in daily spend.`,
    metric: "Mon-Wed",
  },
  {
    title: "Subscriptions are above normal",
    description: "Data and cloud subscriptions are higher than your usual monthly pace.",
    metric: "High",
  },
];

const budgetRisks = [
  {
    category: "Food & Dining",
    status: "watch",
    message: "May be exceeded in 5 days at current pace.",
    spent: 680,
    budget: 800,
  },
  {
    category: "Transport",
    status: "safe",
    message: "Safe based on current spending pace.",
    spent: 320,
    budget: 400,
  },
  {
    category: "Data Subscription",
    status: "exceeded",
    message: `Already exceeded the budget by ${formatCurrency(500)}.`,
    spent: 1500,
    budget: 1000,
  },
];

const recommendations = [
  "Set aside transport money at the start of each week to avoid overspending.",
  "Your food spending is close to the limit. Try reducing snacks or eating out.",
  "Use weekly budgets for irregular income instead of relying only on monthly limits.",
  "Move part of your allowance into savings immediately after receiving it.",
  "Split allowance deposits into weekly portions to smooth out spending spikes.",
];

const incomeData = {
  regularity: "Irregular",
  mainSource: "Allowance & Scholarship",
  frequency: "Monthly, sometimes delayed",
  suggestion:
    "Your income appears irregular. Weekly budgeting may help you avoid running out of money before the end of the month.",
};

const spenderProfile = {
  type: "Moderate Spender",
  description:
    "Your expenses are below income, but food and transport budgets are close enough to their limits to deserve attention.",
};

function getRiskBadge(status: string) {
  if (status === "safe") {
    return {
      label: "Safe",
      variant: "secondary" as const,
      className: "bg-success/10 text-success hover:bg-success/20",
    };
  }

  if (status === "watch") {
    return {
      label: "Watch",
      variant: "secondary" as const,
      className: "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20",
    };
  }

  return {
    label: "Exceeded",
    variant: "destructive" as const,
    className: "",
  };
}

export default function InsightsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div>
          <div className="h-8 w-36 rounded-md bg-muted" />
          <div className="mt-2 h-4 w-80 rounded-md bg-muted" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <CardSkeleton count={4} variant="stat" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="h-6 w-56 rounded-md bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-48 rounded-md bg-muted" />
                        <div className="h-4 w-full rounded-md bg-muted" />
                      </div>
                      <div className="h-6 w-16 rounded-full bg-muted" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="h-6 w-56 rounded-md bg-muted" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="h-4 w-36 rounded-md bg-muted" />
                        <div className="h-4 w-64 rounded-md bg-muted" />
                      </div>
                      <div className="h-6 w-20 rounded-full bg-muted" />
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="h-3 w-20 rounded-md bg-muted" />
                        <div className="h-3 w-20 rounded-md bg-muted" />
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="h-6 w-40 rounded-md bg-muted" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-muted/40 p-4">
                    <div className="h-3 w-24 rounded-md bg-muted" />
                    <div className="mt-2 h-5 w-36 rounded-md bg-muted" />
                    <div className="mt-3 h-4 w-full rounded-md bg-muted" />
                    <div className="mt-2 h-4 w-3/4 rounded-md bg-muted" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 rounded-lg border bg-muted/30" />
                    <div className="h-16 rounded-lg border bg-muted/30" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="h-6 w-44 rounded-md bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-3 rounded-lg border p-3">
                  <div className="h-4 w-4 rounded-full bg-muted" />
                  <div className="h-4 flex-1 rounded-md bg-muted" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
          <p className="text-muted-foreground">
            Understand your spending habits and financial health
          </p>
        </div>
        <ErrorState
          title="Failed to load insights"
          description="We couldn't load your insights. Please try again."
          onRetry={() => {
            setHasError(false);
            setIsLoading(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground">
          Understand your spending habits and financial health
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {summaryCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            change={card.change}
            trend={card.trend}
            icon={card.icon}
            iconColor={card.iconColor}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Spending Pattern Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {spendingPatterns.map((pattern) => (
                  <div
                    key={pattern.title}
                    className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{pattern.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {pattern.description}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {pattern.metric}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Budget Risk & Predictions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {budgetRisks.map((risk) => {
                const badge = getRiskBadge(risk.status);
                const progress = Math.min((risk.spent / risk.budget) * 100, 100);

                return (
                  <div key={risk.category} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{risk.category}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {risk.message}
                        </p>
                      </div>
                      <Badge
                        variant={badge.variant}
                        className={cn("shrink-0", badge.className)}
                      >
                        {badge.label}
                      </Badge>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatCurrency(risk.spent)} spent</span>
                        <span>{formatCurrency(risk.budget)} budget</span>
                      </div>
                      <Progress
                        value={progress}
                        className={cn(
                          "h-2",
                          risk.status === "exceeded" && "[&>div]:bg-destructive",
                          risk.status === "watch" && "[&>div]:bg-amber-500"
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Spending Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/40 p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Current Profile
                </p>
                <p className="mt-1 text-lg font-bold text-primary">
                  {spenderProfile.type}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {spenderProfile.description}
                </p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Savings Rate</p>
                  <p className="mt-1 font-semibold">18%</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Risk Level</p>
                  <p className="mt-1 font-semibold">Medium</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarClock className="h-5 w-5" />
                Income Pattern
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Regularity
                  </span>
                  <span className="text-sm font-medium">
                    {incomeData.regularity}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Main Source
                  </span>
                  <span className="text-sm font-medium text-right">
                    {incomeData.mainSource}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Frequency
                  </span>
                  <span className="text-sm font-medium text-right">
                    {incomeData.frequency}
                  </span>
                </div>
              </div>
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="text-sm text-muted-foreground">
                  {incomeData.suggestion}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.map((recommendation) => (
              <div
                key={recommendation}
                className="flex gap-3 rounded-lg border p-3 text-sm"
              >
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span className="text-muted-foreground">{recommendation}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

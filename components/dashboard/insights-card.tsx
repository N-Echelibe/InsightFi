"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Lightbulb, Clock, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type InsightCategory = {
  label: string;
  value: string;
  percentage: number;
};

export type DashboardInsightMetrics = {
  totalSpending: number;
  monthlyIncome: number;
  remainingBalance: number;
  spendingRate: number;
  classification: string;
  classificationColor: string;
  daysUntilRunout: number | null;
};

export type DashboardInsights = {
  categories: InsightCategory[];
  metrics: DashboardInsightMetrics;
  recommendations: string[];
};

const emptyStateClass =
  "flex min-h-24 items-center rounded-lg border border-dashed p-4 text-sm text-muted-foreground";

export function FinancialProfileCard({
  metrics,
}: {
  metrics: DashboardInsightMetrics;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <TrendingUp className="h-4 w-4" />
          Financial Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg bg-muted/40 p-3">
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Spending Classification
          </p>
          <p className={cn("text-lg font-bold", metrics.classificationColor)}>
            {metrics.classification}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {metrics.monthlyIncome > 0
              ? `${metrics.spendingRate.toFixed(1)}% of income`
              : "Add income to calculate spending rate"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SpendingBreakdownCard({
  categories,
}: {
  categories: InsightCategory[];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <BarChart3 className="h-4 w-4" />
          Spending Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className={emptyStateClass}>
            No expense categories for this month yet.
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.label} className="rounded-lg p-3 hover:bg-muted/50">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium">
                    {category.label}
                  </span>
                  <div className="flex shrink-0 items-center gap-2 tabular-nums">
                    <span className="text-xs font-medium text-muted-foreground">
                      {category.percentage}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {category.value}
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(category.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CashRunwayAlertCard({
  metrics,
}: {
  metrics: DashboardInsightMetrics;
}) {
  if (metrics.daysUntilRunout === null || metrics.daysUntilRunout >= 90) {
    return null;
  }

  return (
    <Card
      className={cn(
        "border-2",
        metrics.daysUntilRunout < 30
          ? "border-destructive bg-destructive/5"
          : "border-amber-500/50 bg-amber-500/5",
      )}
    >
      <CardContent className="pt-0">
        <div className="flex gap-3">
          <Clock
            className={cn(
              "h-5 w-5 flex-shrink-0",
              metrics.daysUntilRunout < 30
                ? "text-destructive"
                : "text-amber-600",
            )}
          />
          <div>
            <p
              className={cn(
                "text-sm font-semibold",
                metrics.daysUntilRunout < 30
                  ? "text-destructive"
                  : "text-amber-700",
              )}
            >
              Cash Runway Alert
            </p>
            <p
              className={cn(
                "mt-1 text-xs",
                metrics.daysUntilRunout < 30
                  ? "text-destructive/80"
                  : "text-amber-600/80",
              )}
            >
              At your current spending rate, you may run out of funds in{" "}
              <span className="font-semibold">
                {metrics.daysUntilRunout} days
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SmartRecommendationsCard({
  recommendations,
}: {
  recommendations: string[];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Lightbulb className="h-4 w-4" />
          Smart Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className={emptyStateClass}>
            Add more transactions and budgets to unlock recommendations.
          </div>
        ) : (
          <ul className="space-y-2">
            {recommendations.slice(0, 3).map((recommendation, index) => (
              <li key={recommendation} className="flex gap-3 rounded-lg p-3 text-sm hover:bg-muted/50">
                <span className="shrink-0 font-bold text-primary">
                  {index + 1}.
                </span>
                <span className="text-muted-foreground">{recommendation}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function InsightsCard() {
  return null;
}

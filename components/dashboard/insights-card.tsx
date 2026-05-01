"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Lightbulb,
  Clock,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightData {
  label: string;
  value: string;
  percentage: number;
  icon?: React.ReactNode;
}

interface InsightsData {
  categorySpending: InsightData[];
  totalSpending: number;
  monthlyIncome: number;
  remainingBalance: number;
  spendingRate: number;
  classification: string;
  classificationColor: string;
  daysUntilRunout: number;
}

function useInsightsData(): InsightsData {
  const categorySpending: InsightData[] = [
    { label: "Food & Dining", value: "₦6,832", percentage: 45 },
    { label: "Transportation", value: "₦2,070", percentage: 15 },
    { label: "Shopping", value: "₦2,950", percentage: 20 },
    { label: "Housing", value: "₦2,200", percentage: 15 },
    { label: "Other", value: "₦735", percentage: 5 },
  ];

  const totalSpending = 15230.45;
  const monthlyIncome = 8450;
  const remainingBalance = 144798.57;
  const dailySpending = totalSpending / 30;
  const daysUntilRunout = Math.ceil(remainingBalance / dailySpending);

  const spendingRate = (totalSpending / monthlyIncome) * 100;
  let classification = "Moderate Spender";
  let classificationColor = "text-blue-600";

  if (spendingRate > 70) {
    classification = "High Spender";
    classificationColor = "text-red-600";
  } else if (spendingRate < 40) {
    classification = "Cautious Spender";
    classificationColor = "text-green-600";
  }

  return {
    categorySpending,
    totalSpending,
    monthlyIncome,
    remainingBalance,
    spendingRate,
    classification,
    classificationColor,
    daysUntilRunout,
  };
}

export function FinancialProfileCard() {
  const data = useInsightsData();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Financial Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 bg-muted/40 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">
            Spending Classification
          </p>
          <p className={cn("text-lg font-bold", data.classificationColor)}>
            {data.classification}
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">
            {data.spendingRate.toFixed(1)}% of income
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function KeyMetricsCard() {
  const data = useInsightsData();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Key Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-muted/40 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-0.5">
              Monthly Expenses
            </p>
            <p className="text-base font-bold text-destructive">
              ₦{data.totalSpending.toLocaleString("en-NG", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
          <div className="p-3 bg-muted/40 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-0.5">
              Savings Rate
            </p>
            <p className="text-base font-bold text-success">
              {(100 - data.spendingRate).toFixed(0)}%
            </p>
          </div>
          <div className="p-3 bg-muted/40 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-0.5">
              Funds Runway
            </p>
            <p className="text-base font-bold">
              {data.daysUntilRunout}d
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SpendingBreakdownCard() {
  const data = useInsightsData();

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Spending Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.categorySpending.map((category) => (
            <div key={category.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{category.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    {category.percentage}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {category.value}
                  </span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CashRunwayAlertCard() {
  const data = useInsightsData();

  if (data.daysUntilRunout >= 90) {
    return null;
  }

  return (
    <Card
      className={cn(
        "border-2",
        data.daysUntilRunout < 30
          ? "border-destructive bg-destructive/5"
          : "border-amber-500/50 bg-amber-500/5"
      )}
    >
      <CardContent className="pt-4">
        <div className="flex gap-3">
          <Clock
            className={cn(
              "h-5 w-5 flex-shrink-0",
              data.daysUntilRunout < 30 ? "text-destructive" : "text-amber-600"
            )}
          />
          <div>
            <p
              className={cn(
                "font-semibold text-sm",
                data.daysUntilRunout < 30 ? "text-destructive" : "text-amber-700"
              )}
            >
              Cash Runway Alert
            </p>
            <p
              className={cn(
                "text-xs mt-1",
                data.daysUntilRunout < 30
                  ? "text-destructive/80"
                  : "text-amber-600/80"
              )}
            >
              At your current spending rate, you may run out of funds in{" "}
              <span className="font-semibold">{data.daysUntilRunout} days</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SmartRecommendationsCard() {
  const data = useInsightsData();

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Smart Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2.5">
          <li className="flex gap-3 text-sm">
            <span className="text-primary font-bold flex-shrink-0">1.</span>
            <span className="text-muted-foreground">
              {data.spendingRate > 70
                ? "Consider reducing discretionary spending, especially on Food & Dining (45% of budget)"
                : "Great job maintaining balanced spending!"}
            </span>
          </li>
          <li className="flex gap-3 text-sm">
            <span className="text-primary font-bold flex-shrink-0">2.</span>
            <span className="text-muted-foreground">
              {data.categorySpending[0].percentage > 40
                ? "Your Food & Dining expenses are high. Consider meal planning to reduce costs"
                : "Continue monitoring your spending across all categories"}
            </span>
          </li>
          <li className="flex gap-3 text-sm">
            <span className="text-primary font-bold flex-shrink-0">3.</span>
            <span className="text-muted-foreground">
              Set up automatic transfers to savings to ensure you reach your 38% savings rate goal
            </span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}

export function InsightsCard() {
  return null;
}

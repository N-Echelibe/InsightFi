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

export function InsightsCard() {
  // Sample data based on transactions
  const categorySpending: InsightData[] = [
    { label: "Food & Dining", value: "₦6,832", percentage: 45 },
    { label: "Transportation", value: "₦2,070", percentage: 15 },
    { label: "Shopping", value: "₦2,950", percentage: 20 },
    { label: "Housing", value: "₦2,200", percentage: 15 },
    { label: "Other", value: "₦735", percentage: 5 },
  ];

  // Calculate total spending
  const totalSpending = 15230.45;
  const monthlyIncome = 8450;
  const remainingBalance = 144798.57;
  const dailySpending = totalSpending / 30;
  const daysUntilRunout = Math.ceil(remainingBalance / dailySpending);

  // Determine spending classification
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

  return (
    <div className="space-y-4">
      {/* Spending Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Spending Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categorySpending.map((category) => (
              <div key={category.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{category.label}</span>
                  <span className="text-sm text-muted-foreground">
                    {category.percentage}%
                  </span>
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

      {/* Classification & Key Insights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Financial Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">
              Spending Classification
            </p>
            <p className={cn("text-xl font-bold", classificationColor)}>
              {classification}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              You&apos;re spending {spendingRate.toFixed(1)}% of your income
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">
                Monthly Expenses
              </p>
              <p className="text-lg font-bold text-destructive">
                ₦{totalSpending.toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">
                Savings Rate
              </p>
              <p className="text-lg font-bold text-success">
                {(100 - spendingRate).toFixed(0)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Runway Warning */}
      {daysUntilRunout < 90 && (
        <Card className={cn(
          "border-2",
          daysUntilRunout < 30 ? "border-destructive bg-destructive/5" : "border-amber-500/50 bg-amber-500/5"
        )}>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Clock className={cn(
                "h-5 w-5 flex-shrink-0 mt-0.5",
                daysUntilRunout < 30 ? "text-destructive" : "text-amber-600"
              )} />
              <div>
                <p className={cn(
                  "font-semibold text-sm",
                  daysUntilRunout < 30 ? "text-destructive" : "text-amber-700"
                )}>
                  Cash Runway Alert
                </p>
                <p className={cn(
                  "text-sm mt-1",
                  daysUntilRunout < 30 ? "text-destructive/80" : "text-amber-600/80"
                )}>
                  At your current spending rate, you may run out of funds in{" "}
                  <span className="font-semibold">{daysUntilRunout} days</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex gap-3 text-sm">
              <span className="text-primary font-bold">1.</span>
              <span>
                {spendingRate > 70
                  ? "Consider reducing discretionary spending, especially on Food & Dining (45% of budget)"
                  : "Great job maintaining balanced spending!"}
              </span>
            </li>
            <li className="flex gap-3 text-sm">
              <span className="text-primary font-bold">2.</span>
              <span>
                {categorySpending[0].percentage > 40
                  ? "Your Food & Dining expenses are high. Consider meal planning to reduce costs"
                  : "Continue monitoring your spending across all categories"}
              </span>
            </li>
            <li className="flex gap-3 text-sm">
              <span className="text-primary font-bold">3.</span>
              <span>
                Set up automatic transfers to savings to ensure you reach your 38% savings rate goal
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

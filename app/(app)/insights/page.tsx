"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartSkeleton, CardSkeleton } from "@/components/skeletons";
import { ErrorState, EmptyState } from "@/components/states";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  AlertCircle,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function InsightsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Summary data
  const summaryCards = [
    {
      title: "Savings Rate",
      value: "18%",
      description: "Of monthly income",
      icon: TrendingUp,
      color: "text-emerald-500",
    },
    {
      title: "Budget Risk Level",
      value: "Medium",
      description: "Watch 2 categories",
      icon: AlertCircle,
      color: "text-amber-500",
    },
    {
      title: "Spending Stability",
      value: "Irregular",
      description: "Varies week to week",
      icon: TrendingDown,
      color: "text-orange-500",
    },
    {
      title: "Spender Type",
      value: "Moderate",
      description: "Balanced spending",
      icon: Target,
      color: "text-blue-500",
    },
  ];

  // Spending pattern insights
  const spendingPatterns = [
    "Food is your highest spending category this month at 38% of total expenses.",
    "Transport spending increased by 25% compared to last month.",
    "Most spending happens between Monday and Wednesday (₦8,420 average).",
    "Data subscription expenses are higher than usual this month.",
  ];

  // Budget risk items
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
      message: "Already exceeded the budget by ₦500.",
      spent: 1500,
      budget: 1000,
    },
  ];

  // Recommendations
  const recommendations = [
    "Set aside transport money at the start of each week to avoid overspending.",
    "Your food spending is close to the limit. Try reducing snacks or eating out.",
    "Since your income is irregular, use weekly budgets instead of only monthly budgets.",
    "Move part of your allowance into savings immediately after receiving it.",
    "Your spending is highest after allowance deposits. Consider splitting your allowance into weekly portions.",
  ];

  // Income analysis
  const incomeData = {
    regularity: "Irregular",
    mainSource: "Allowance & Scholarship",
    frequency: "Monthly (sometimes delayed)",
    suggestion: "Your income appears irregular. Weekly budgeting may help you avoid running out of money before the end of the month.",
  };

  // Spender profile
  const spenderProfile = {
    type: "Moderate Spender",
    description:
      "You are classified as a Moderate Spender because your expenses are below income, but your food and transport budgets are close to their limits.",
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-8 w-1/4 rounded-md bg-muted" />
          <div className="mt-2 h-4 w-1/3 rounded-md bg-muted" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <CardSkeleton count={4} variant="stat" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 space-y-6 lg:space-y-0">
          <CardSkeleton count={2} variant="content" />
        </div>
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground">
          Understand your spending habits and financial health
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {card.description}
                    </p>
                  </div>
                  <Icon className={cn("h-5 w-5", card.color)} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Spending Pattern Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Spending Pattern Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {spendingPatterns.map((pattern, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-2" />
                <p className="text-sm text-muted-foreground">{pattern}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget Risk & Prediction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Budget Risk & Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetRisks.map((risk, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{risk.category}</p>
                  <Badge
                    variant={
                      risk.status === "safe"
                        ? "secondary"
                        : risk.status === "watch"
                          ? "outline"
                          : "destructive"
                    }
                    className={cn(
                      risk.status === "watch" && "bg-amber-500/10 text-amber-700 border-amber-200",
                      risk.status === "safe" && "bg-emerald-500/10 text-emerald-700 border-emerald-200"
                    )}
                  >
                    {risk.status === "safe"
                      ? "Safe"
                      : risk.status === "watch"
                        ? "Watch"
                        : "Exceeded"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{risk.message}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>₦{risk.spent.toLocaleString()}</span>
                    <span className="text-muted-foreground">₦{risk.budget.toLocaleString()}</span>
                  </div>
                  <Progress
                    value={Math.min((risk.spent / risk.budget) * 100, 100)}
                    className={cn(
                      risk.status === "exceeded" && "[&>div]:bg-destructive",
                      risk.status === "watch" && "[&>div]:bg-amber-500"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout for Recommendations and Income */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex gap-3">
                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Income Pattern Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Income Pattern Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Income Regularity
              </p>
              <p className="text-sm font-semibold">{incomeData.regularity}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Main Source
              </p>
              <p className="text-sm font-semibold">{incomeData.mainSource}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Frequency
              </p>
              <p className="text-sm font-semibold">{incomeData.frequency}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 border border-border">
              <p className="text-sm text-muted-foreground">
                {incomeData.suggestion}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Spending Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Spending Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-lg font-semibold text-blue-600">
              {spenderProfile.type}
            </p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {spenderProfile.description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const predictions = [
  {
    category: "Food & Dining",
    currentBudget: 800,
    predictedSpend: 920,
    suggestedBudget: 850,
    trend: "up",
    confidence: 92,
    reason: "Holiday season spending patterns detected",
  },
  {
    category: "Transportation",
    currentBudget: 400,
    predictedSpend: 350,
    suggestedBudget: 380,
    trend: "down",
    confidence: 88,
    reason: "Remote work reducing commute costs",
  },
  {
    category: "Utilities",
    currentBudget: 250,
    predictedSpend: 310,
    suggestedBudget: 300,
    trend: "up",
    confidence: 95,
    reason: "Winter heating costs expected to increase",
  },
  {
    category: "Entertainment",
    currentBudget: 200,
    predictedSpend: 180,
    suggestedBudget: 200,
    trend: "neutral",
    confidence: 85,
    reason: "Spending consistent with historical patterns",
  },
];

const insights = [
  {
    type: "saving",
    title: "Potential Savings Found",
    description:
      "You could save $150/month by reducing subscription services you rarely use.",
    action: "Review Subscriptions",
  },
  {
    type: "alert",
    title: "Unusual Spending Pattern",
    description:
      "Shopping expenses are 40% higher than usual this month. Consider reviewing recent purchases.",
    action: "View Transactions",
  },
  {
    type: "tip",
    title: "Budget Optimization",
    description:
      "Based on your spending patterns, reallocating $100 from Travel to Savings would improve your financial health.",
    action: "Adjust Budget",
  },
];

export function AIPredictions() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">AI Budget Predictions</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Our AI analyzes your spending patterns to predict future expenses
                and suggest optimal budget allocations.
              </p>
              <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                <RefreshCw className="h-4 w-4" />
                Refresh Predictions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Predictions */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold">Next Month Predictions</h3>
          {predictions.map((prediction) => (
            <Card key={prediction.category}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{prediction.category}</span>
                    <Badge variant="secondary" className="text-xs">
                      {prediction.confidence}% confidence
                    </Badge>
                  </div>
                  {prediction.trend === "up" && (
                    <TrendingUp className="h-4 w-4 text-warning" />
                  )}
                  {prediction.trend === "down" && (
                    <TrendingDown className="h-4 w-4 text-success" />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Current Budget
                    </p>
                    <p className="font-semibold">${prediction.currentBudget}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Predicted Spend
                    </p>
                    <p
                      className={cn(
                        "font-semibold",
                        prediction.predictedSpend > prediction.currentBudget &&
                          "text-warning"
                      )}
                    >
                      ${prediction.predictedSpend}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Suggested Budget
                    </p>
                    <p className="font-semibold text-primary">
                      ${prediction.suggestedBudget}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {prediction.reason}
                  </p>
                  <Button size="sm" variant="ghost" className="gap-1">
                    Apply
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Insights */}
        <div className="space-y-4">
          <h3 className="font-semibold">AI Insights</h3>
          {insights.map((insight, index) => (
            <Card
              key={index}
              className={cn(
                insight.type === "alert" && "border-warning/50",
                insight.type === "saving" && "border-success/50"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      insight.type === "saving" && "bg-success/10 text-success",
                      insight.type === "alert" && "bg-warning/10 text-warning",
                      insight.type === "tip" && "bg-primary/10 text-primary"
                    )}
                  >
                    {insight.type === "saving" && (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {insight.type === "alert" && (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    {insight.type === "tip" && <Lightbulb className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1">{insight.title}</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {insight.description}
                    </p>
                    <Button size="sm" variant="link" className="h-auto p-0 text-xs">
                      {insight.action}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

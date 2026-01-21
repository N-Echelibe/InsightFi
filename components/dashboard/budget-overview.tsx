"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const budgets = [
  {
    category: "Food & Dining",
    spent: 680,
    budget: 800,
    color: "bg-chart-1",
  },
  {
    category: "Transportation",
    spent: 320,
    budget: 400,
    color: "bg-chart-2",
  },
  {
    category: "Entertainment",
    spent: 180,
    budget: 200,
    color: "bg-chart-3",
  },
  {
    category: "Shopping",
    spent: 450,
    budget: 350,
    color: "bg-chart-5",
  },
];

export function BudgetOverview() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Budget Overview</CardTitle>
        <Button variant="ghost" size="sm" className="h-8 gap-1" asChild>
          <Link href="/budgets">
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.map((budget) => {
          const percentage = Math.round((budget.spent / budget.budget) * 100);
          const isOverBudget = percentage > 100;

          return (
            <div key={budget.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{budget.category}</span>
                <span
                  className={cn(
                    "text-sm",
                    isOverBudget ? "text-destructive font-semibold" : "text-muted-foreground"
                  )}
                >
                  ${budget.spent} / ${budget.budget}
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={Math.min(percentage, 100)}
                  className={cn(
                    "h-2",
                    isOverBudget && "[&>div]:bg-destructive"
                  )}
                />
              </div>
              {isOverBudget && (
                <p className="text-xs text-destructive">
                  Over budget by ${budget.spent - budget.budget}
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

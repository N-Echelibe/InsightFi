"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number) =>
  `${"\u20a6"}${value.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const emptyStateClass =
  "flex min-h-24 items-center rounded-lg border border-dashed p-4 text-sm text-muted-foreground";

export function BudgetOverview({
  budgets = [],
}: {
  budgets?: Array<{
    category: string;
    spent: number;
    budget: number;
    color?: string;
  }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-semibold">Budget Overview</CardTitle>
        <Button variant="ghost" size="sm" className="h-8 gap-1" asChild>
          <Link href="/budgets">
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.length === 0 ? (
          <div className={emptyStateClass}>
            No active budgets yet.
          </div>
        ) : (
          budgets.map((budget) => {
            const percentage =
              budget.budget > 0
                ? Math.round((budget.spent / budget.budget) * 100)
                : 0;
            const isOverBudget = percentage > 100;

            return (
              <div key={budget.category} className="rounded-lg p-3 hover:bg-muted/50">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium">
                    {budget.category}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-sm tabular-nums",
                      isOverBudget
                        ? "font-semibold text-destructive"
                        : "text-muted-foreground",
                    )}
                  >
                    {formatCurrency(budget.spent)} /{" "}
                    {formatCurrency(budget.budget)}
                  </span>
                </div>
                <Progress
                  value={Math.min(percentage, 100)}
                  className={cn("h-2", isOverBudget && "[&>div]:bg-destructive")}
                />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {Math.min(percentage, 100)}% used
                  </span>
                  {isOverBudget && (
                    <span className="font-medium text-destructive">
                      {formatCurrency(budget.spent - budget.budget)} over
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Shield, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number) =>
  `${"\u20a6"}${value.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const emptyStateClass =
  "flex min-h-24 items-center rounded-lg border border-dashed p-4 text-sm text-muted-foreground";

export function SavingsGoals({
  goals = [],
}: {
  goals?: Array<{
    id: string | number;
    name: string;
    current: number;
    target: number;
    icon?: LucideIcon;
    color?: string;
    autoSave?: boolean;
  }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-semibold">Savings Goals</CardTitle>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5" asChild>
          <Link href="/goals">
            <Plus className="h-4 w-4" />
            Add
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.length === 0 ? (
          <div className={emptyStateClass}>
            No savings goals yet.
          </div>
        ) : (
          goals.map((goal) => {
            const Icon = goal.icon ?? Shield;
            const percentage =
              goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;

            return (
              <Link
                href="/goals"
                key={goal.id}
                className="block rounded-lg p-3 transition-colors hover:bg-muted/50"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={cn(
                        "shrink-0 rounded-lg p-2",
                        goal.color ?? "bg-primary/10 text-primary",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{goal.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(goal.current)} of{" "}
                        {formatCurrency(goal.target)}
                      </p>
                    </div>
                  </div>
                  {goal.autoSave && (
                    <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      <Sparkles className="h-3 w-3" />
                      Auto
                    </div>
                  )}
                </div>
                <Progress value={Math.min(percentage, 100)} className="h-2" />
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{Math.min(percentage, 100)}% complete</span>
                  <span className="tabular-nums">
                    {formatCurrency(Math.max(goal.target - goal.current, 0))} left
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

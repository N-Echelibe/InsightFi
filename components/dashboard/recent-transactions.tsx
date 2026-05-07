"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Coffee } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number) =>
  `${"\u20a6"}${value.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const emptyStateClass =
  "flex min-h-24 items-center rounded-lg border border-dashed p-4 text-sm text-muted-foreground";

export function RecentTransactions({
  transactions = [],
}: {
  transactions?: Array<{
    id: string | number;
    name: string;
    category: string;
    amount: number;
    date: string;
    icon?: LucideIcon;
    color?: string;
  }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-semibold">
          Recent Transactions
        </CardTitle>
        <Button variant="ghost" size="sm" className="h-8 gap-1" asChild>
          <Link href="/transactions">
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className={emptyStateClass}>
            No recent transactions yet.
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map((transaction) => {
              const Icon = transaction.icon ?? Coffee;

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={cn(
                        "shrink-0 rounded-lg p-2",
                        transaction.color ?? "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {transaction.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.category}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        transaction.amount > 0
                          ? "text-success"
                          : "text-foreground",
                      )}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.date}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Building2, CreditCard, Landmark, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number) =>
  `${"\u20a6"}${value.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const accountTypeConfig = {
  cash: {
    icon: Wallet,
    color: "bg-primary/10 text-primary",
  },
  savings: {
    icon: Landmark,
    color: "bg-success/10 text-success",
  },
  current: {
    icon: Building2,
    color: "bg-chart-2/10 text-chart-2",
  },
  checking: {
    icon: Building2,
    color: "bg-chart-2/10 text-chart-2",
  },
  credit: {
    icon: CreditCard,
    color: "bg-destructive/10 text-destructive",
  },
  investment: {
    icon: Wallet,
    color: "bg-chart-4/10 text-chart-4",
  },
};

const emptyStateClass =
  "flex min-h-24 items-center rounded-lg border border-dashed p-4 text-sm text-muted-foreground";

export function AccountsCard({
  accounts = [],
}: {
  accounts?: Array<{
    name: string;
    bank?: string;
    balance: number;
    type: string;
    icon?: typeof Building2;
    color?: string;
  }>;
}) {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-semibold">Accounts</CardTitle>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5" asChild>
          <Link href="/settings">
            <Plus className="h-4 w-4" />
            Add
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Total Balance
          </p>
          <p className="text-2xl font-bold">
            {formatCurrency(totalBalance)}
          </p>
        </div>

        {accounts.length === 0 ? (
          <div className={emptyStateClass}>
            No accounts yet. Add one from settings to start tracking balances.
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => {
              const config =
                accountTypeConfig[
                  account.type as keyof typeof accountTypeConfig
                ] ?? accountTypeConfig.current;
              const Icon = account.icon ?? config.icon;

              return (
                <Link
                  href="/settings"
                  key={account.name}
                  className="flex items-center justify-between gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={cn(
                        "shrink-0 rounded-lg p-2",
                        account.color ?? config.color,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {account.name}
                      </p>
                      <p className="truncate text-xs capitalize text-muted-foreground">
                        {account.bank ?? account.type}
                      </p>
                    </div>
                  </div>
                  <p
                    className={cn(
                      "shrink-0 text-sm font-semibold tabular-nums",
                      account.balance < 0 && "text-destructive",
                    )}
                  >
                    {account.balance < 0 ? "-" : ""}
                    {formatCurrency(Math.abs(account.balance))}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

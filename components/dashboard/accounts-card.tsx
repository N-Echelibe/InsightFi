"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2, CreditCard, Landmark, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const defaultAccounts = [
  {
    name: "Main Checking",
    bank: "Chase Bank",
    balance: 12458.32,
    type: "checking",
    icon: Building2,
    color: "bg-chart-1/10 text-chart-1",
  },
  {
    name: "Savings Account",
    bank: "Ally Bank",
    balance: 45230.0,
    type: "savings",
    icon: Landmark,
    color: "bg-chart-2/10 text-chart-2",
  },
  {
    name: "Credit Card",
    bank: "Amex Platinum",
    balance: -2340.5,
    type: "credit",
    icon: CreditCard,
    color: "bg-chart-3/10 text-chart-3",
  },
  {
    name: "Investment",
    bank: "Fidelity",
    balance: 89450.75,
    type: "investment",
    icon: Wallet,
    color: "bg-chart-4/10 text-chart-4",
  },
];

export function AccountsCard({
  accounts = defaultAccounts,
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
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Accounts</CardTitle>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Total Balance
          </p>
          <p className="text-2xl font-bold">
            ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="space-y-3">
          {accounts.map((account) => {
            const Icon = account.icon ?? Building2;

            return (
              <div
                key={account.name}
                className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className={cn("shrink-0 p-2 rounded-lg", account.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{account.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {account.bank ?? account.type}
                    </p>
                  </div>
                </div>
                <p
                  className={cn(
                    "shrink-0 text-sm font-semibold",
                    account.balance < 0 && "text-destructive"
                  )}
                >
                  {account.balance < 0 ? "-" : ""}$
                  {Math.abs(account.balance).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

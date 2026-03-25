"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Coffee,
  ShoppingBag,
  Car,
  Wifi,
  ArrowDownLeft,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const transactions = [
  {
    id: 1,
    name: "Starbucks",
    category: "Food & Dining",
    amount: -5.75,
    date: "Today",
    icon: Coffee,
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    id: 2,
    name: "Salary Deposit",
    category: "Income",
    amount: 4500.0,
    date: "Yesterday",
    icon: ArrowDownLeft,
    color: "bg-success/10 text-success",
  },
  {
    id: 3,
    name: "Amazon",
    category: "Shopping",
    amount: -89.99,
    date: "Jan 18",
    icon: ShoppingBag,
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    id: 4,
    name: "Uber",
    category: "Transportation",
    amount: -24.5,
    date: "Jan 17",
    icon: Car,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    id: 5,
    name: "Netflix",
    category: "Subscriptions",
    amount: -15.99,
    date: "Jan 16",
    icon: Wifi,
    color: "bg-red-500/10 text-red-500",
  },
];

export function RecentTransactions() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
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
        <div className="space-y-1">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", transaction.color)}>
                  <transaction.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{transaction.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.category}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    transaction.amount > 0 ? "text-success" : "text-foreground"
                  )}
                >
                  {transaction.amount > 0 ? "+" : ""}
                  ₦{Math.abs(transaction.amount).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {transaction.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

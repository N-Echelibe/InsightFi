"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Edit, Trash2, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { BudgetDialog } from "@/components/budgets/budget-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Mock transaction data - in real app would come from database
const allTransactions = [
  {
    id: "txn-001",
    description: "Lunch at restaurant",
    amount: 5200,
    date: "2026-04-28",
    categories: {
      icon: "utensils",
      name: "Food & Dining",
      color: "bg-orange-100 text-orange-700",
    },
  },
  {
    id: "txn-002",
    description: "Grocery shopping",
    amount: 12500,
    date: "2026-04-27",
    categories: {
      icon: "shopping-bag",
      name: "Food & Dining",
      color: "bg-orange-100 text-orange-700",
    },
  },
  {
    id: "txn-003",
    description: "Coffee break",
    amount: 1500,
    date: "2026-04-26",
    categories: {
      icon: "coffee",
      name: "Food & Dining",
      color: "bg-orange-100 text-orange-700",
    },
  },
  {
    id: "txn-004",
    description: "Restaurant dinner",
    amount: 8400,
    date: "2026-04-25",
    categories: {
      icon: "utensils",
      name: "Food & Dining",
      color: "bg-orange-100 text-orange-700",
    },
  },
  {
    id: "txn-005",
    description: "Fast food",
    amount: 3200,
    date: "2026-04-24",
    categories: {
      icon: "utensils",
      name: "Food & Dining",
      color: "bg-orange-100 text-orange-700",
    },
  },
];

// Mock budget data - in real app would come from database
const allBudgets = [
  {
    id: 1,
    category: "Food & Dining",
    spent: 680,
    budget: 800,
    type: "monthly",
    createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    color: "#22c55e",
  },
  {
    id: 2,
    category: "Transportation",
    spent: 320,
    budget: 400,
    type: "monthly",
    createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    color: "#3b82f6",
  },
  {
    id: 3,
    category: "Shopping",
    spent: 450,
    budget: 350,
    type: "weekly",
    createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    color: "#f97316",
  },
  {
    id: 4,
    category: "Housing",
    spent: 2200,
    budget: 2200,
    type: "monthly",
    createdDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    color: "#8b5cf6",
  },
  {
    id: 5,
    category: "Utilities",
    spent: 180,
    budget: 250,
    type: "monthly",
    createdDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    color: "#06b6d4",
  },
  {
    id: 6,
    category: "Health",
    spent: 120,
    budget: 200,
    type: "yearly",
    createdDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    color: "#ec4899",
  },
  {
    id: 7,
    category: "Entertainment",
    spent: 180,
    budget: 200,
    type: "monthly",
    createdDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    color: "#eab308",
  },
  {
    id: 8,
    category: "Travel",
    spent: 0,
    budget: 500,
    type: "custom",
    startDate: new Date(2025, 2, 1),
    endDate: new Date(2025, 2, 15),
    color: "#14b8a6",
  },
];

function calculateProjectedSpending(budget: any): {
  projected: number;
  status: "on-track" | "warning" | "over";
  daysElapsed?: number;
  totalDays?: number;
} {
  const today = new Date();

  if ((budget.type === "onetime" || budget.type === "custom") && budget.startDate && budget.endDate) {
    const totalDays = Math.ceil(
      (budget.endDate.getTime() - budget.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysElapsed = Math.ceil(
      (today.getTime() - budget.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysElapsed <= 0) {
      return { projected: budget.spent, status: "on-track", daysElapsed: 0, totalDays };
    }

    const dailyRate = budget.spent / Math.max(1, daysElapsed);
    const projected = dailyRate * totalDays;

    if (projected > budget.budget * 1.1) {
      return { projected, status: "over", daysElapsed, totalDays };
    } else if (projected > budget.budget * 0.9) {
      return { projected, status: "warning", daysElapsed, totalDays };
    }
    return { projected, status: "on-track", daysElapsed, totalDays };
  }

  if (budget.createdDate) {
    const daysElapsed = Math.ceil(
      (today.getTime() - budget.createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let totalDays: number;
    switch (budget.type) {
      case "weekly":
        totalDays = 7;
        break;
      case "yearly":
        totalDays = 365;
        break;
      case "monthly":
      default:
        totalDays = 30;
        break;
    }

    if (daysElapsed <= 0) {
      return { projected: budget.spent, status: "on-track", daysElapsed: 0, totalDays };
    }

    const dailyRate = budget.spent / Math.max(1, daysElapsed);
    const projected = dailyRate * totalDays;

    if (projected > budget.budget * 1.1) {
      return { projected, status: "over", daysElapsed, totalDays };
    } else if (projected > budget.budget * 0.9) {
      return { projected, status: "warning", daysElapsed, totalDays };
    }
    return { projected, status: "on-track", daysElapsed, totalDays };
  }

  return { projected: budget.spent, status: "on-track" };
}

function generateTrendData(budget: any) {
  const data = [];
  const startDay = Math.max(1, (budget.daysElapsed || 7) - 6);

  for (let i = startDay; i <= (budget.daysElapsed || 7); i++) {
    data.push({
      day: `Day ${i}`,
      actual: Math.floor((budget.spent / (budget.daysElapsed || 1)) * i),
      projected: Math.floor((budget.projected / (budget.totalDays || 30)) * i),
    });
  }

  return data;
}

function resolveIcon(iconName?: string) {
  if (!iconName) {
    return LucideIcons.Tag;
  }

  const normalized = iconName
    .trim()
    .replace(/[-_ ]+/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");

  const icons = LucideIcons as unknown as Record<string, LucideIcon>;

  return icons[normalized] || LucideIcons.Tag;
}

export default function BudgetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const budgetId = parseInt(params.id as string);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [budgets, setBudgets] = useState(allBudgets);

  const budget = budgets.find((b) => b.id === budgetId);

  if (!budget) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Budget not found</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const percentage = Math.round((budget.spent / budget.budget) * 100);
  const projectionData = calculateProjectedSpending(budget);
  const remaining = budget.budget - budget.spent;
  const dailyAverage = budget.daysElapsed
    ? budget.spent / budget.daysElapsed
    : budget.spent / 1;

  const statusConfig = {
    "on-track": { label: "On Track", color: "bg-success/10 text-success" },
    warning: { label: "Warning", color: "bg-amber-500/10 text-amber-700" },
    over: { label: "Over Budget", color: "bg-destructive/10 text-destructive" },
  };

  const typeLabels = {
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
    onetime: "One-Time",
    custom: "Custom Range",
  };

  const trendData = generateTrendData({
    ...projectionData,
    daysElapsed: projectionData.daysElapsed || 7,
    totalDays: projectionData.totalDays || 30,
  });

  const handleDeleteBudget = () => {
    setBudgets(budgets.filter((b) => b.id !== budgetId));
    router.push("/budgets");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{budget.category}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {typeLabels[budget.type as keyof typeof typeLabels]}
              </Badge>
              <Badge className={cn("text-xs", statusConfig[projectionData.status].color)}>
                {statusConfig[projectionData.status].label}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Budget</p>
            <p className="text-2xl font-bold">₦{budget.budget.toLocaleString("en-NG")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Spent</p>
            <p className="text-2xl font-bold text-destructive">₦{budget.spent.toLocaleString("en-NG")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Remaining</p>
            <p className={cn("text-2xl font-bold", remaining < 0 ? "text-destructive" : "text-success")}>
              ₦{remaining.toLocaleString("en-NG")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Projected Total</p>
            <p className={cn(
              "text-2xl font-bold",
              projectionData.projected > budget.budget ? "text-destructive" : "text-success"
            )}>
              ₦{projectionData.projected.toLocaleString("en-NG", { maximumFractionDigits: 0 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2 text-sm">
              <span>Amount Spent</span>
              <span className="font-medium">{percentage}%</span>
            </div>
            <Progress value={Math.min(percentage, 100)} className="h-3" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 text-sm">
            <div>
              <p className="text-muted-foreground">Spent</p>
              <p className="text-lg font-semibold">₦{budget.spent.toLocaleString("en-NG")}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Remaining</p>
              <p className="text-lg font-semibold">₦{remaining.toLocaleString("en-NG")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Chart */}
      {trendData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => `₦${value.toLocaleString("en-NG")}`}
                />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#22c55e" name="Actual Spending" />
                <Line type="monotone" dataKey="projected" stroke="#f97316" name="Projected" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Daily Average Spending</p>
              <p className="text-2xl font-bold">₦{dailyAverage.toLocaleString("en-NG", { maximumFractionDigits: 0 })}</p>
            </div>
            {projectionData.daysElapsed !== undefined && projectionData.totalDays !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">Days Elapsed</p>
                <p className="text-lg font-semibold">{projectionData.daysElapsed} of {projectionData.totalDays} days</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budget.spent === 0 ? (
                <p className="text-sm text-muted-foreground">No spending data yet</p>
              ) : (projectionData.daysElapsed || 0) < 2 ? (
                <p className="text-sm text-muted-foreground">Insufficient data for accurate projections</p>
              ) : projectionData.status === "over" ? (
                <div className="flex gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Over Budget</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You&apos;ve exceeded your budget by ₦{(projectionData.projected - budget.budget).toLocaleString("en-NG", { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              ) : projectionData.status === "warning" ? (
                <div className="flex gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-700">Warning: Likely to Exceed</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      At your current spending rate, you may exceed this budget
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <TrendingUp className="h-4 w-4 flex-shrink-0 text-success mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-success">On Track</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You&apos;re within budget and on track
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Related Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Related Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {allTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet for this budget</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTransactions.slice(0, 5).map((transaction) => {
                    const Icon = resolveIcon(transaction.categories?.icon);
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg", transaction.categories?.color)}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-sm">{transaction.description}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-destructive">
                          -₦{transaction.amount.toLocaleString("en-NG")}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(transaction.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {allTransactions.length > 5 && (
                <Button variant="ghost" className="w-full mt-4">
                  View All Transactions
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {percentage >= 100 ? (
            <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
              <p className="font-medium text-destructive mb-1">Budget Exceeded</p>
              <p className="text-sm text-muted-foreground">
                You&apos;ve exceeded your {budget.category} budget. Consider reducing discretionary spending or reviewing recent transactions to find areas to cut back.
              </p>
            </div>
          ) : percentage >= 80 ? (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="font-medium text-amber-700 mb-1">Approaching Limit</p>
              <p className="text-sm text-muted-foreground">
                You&apos;re using {percentage}% of your budget. Be mindful of your spending for the rest of the period.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-success/5 rounded-lg border border-success/20">
              <p className="font-medium text-success mb-1">On Track</p>
              <p className="text-sm text-muted-foreground">
                You&apos;re managing your {budget.category} budget well. Keep up the good spending habits!
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm font-medium">Actionable Tips:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Review your last 5 transactions to identify spending patterns</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Set up alerts when you reach 75% of your budget limit</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Compare this period&apos;s spending with previous periods</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Edit Budget Dialog */}
      <BudgetDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        budget={budget}
      />

      {/* Delete Budget Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Budget</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the &quot;{budget?.category}&quot; budget? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteBudget}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

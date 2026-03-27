"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Edit,
  Bell,
  BellOff,
  Utensils,
  Car,
  ShoppingBag,
  Home,
  Wifi,
  Heart,
  Gamepad2,
  Plane,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BudgetDialog } from "@/components/budgets/budget-dialog";
import { SavingsBuckets } from "@/components/budgets/savings-buckets";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const budgets = [
  {
    id: 1,
    category: "Food & Dining",
    spent: 680,
    budget: 800,
    icon: Utensils,
    color: "#22c55e",
    bgColor: "bg-emerald-500/10 text-emerald-500",
    alerts: true,
    type: "monthly" as const,
    createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
  },
  {
    id: 2,
    category: "Transportation",
    spent: 320,
    budget: 400,
    icon: Car,
    color: "#3b82f6",
    bgColor: "bg-blue-500/10 text-blue-500",
    alerts: true,
    type: "monthly" as const,
    createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: 3,
    category: "Shopping",
    spent: 450,
    budget: 350,
    icon: ShoppingBag,
    color: "#f97316",
    bgColor: "bg-orange-500/10 text-orange-500",
    alerts: true,
    type: "weekly" as const,
    createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 4,
    category: "Housing",
    spent: 2200,
    budget: 2200,
    icon: Home,
    color: "#8b5cf6",
    bgColor: "bg-violet-500/10 text-violet-500",
    alerts: false,
    type: "monthly" as const,
    createdDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
  {
    id: 5,
    category: "Utilities",
    spent: 180,
    budget: 250,
    icon: Wifi,
    color: "#06b6d4",
    bgColor: "bg-cyan-500/10 text-cyan-500",
    alerts: true,
    type: "monthly" as const,
    createdDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
  },
  {
    id: 6,
    category: "Health",
    spent: 120,
    budget: 200,
    icon: Heart,
    color: "#ec4899",
    bgColor: "bg-pink-500/10 text-pink-500",
    alerts: false,
    type: "yearly" as const,
    createdDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
  {
    id: 7,
    category: "Entertainment",
    spent: 180,
    budget: 200,
    icon: Gamepad2,
    color: "#eab308",
    bgColor: "bg-yellow-500/10 text-yellow-500",
    alerts: true,
    type: "monthly" as const,
    createdDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
  },
  {
    id: 8,
    category: "Travel",
    spent: 0,
    budget: 500,
    icon: Plane,
    color: "#14b8a6",
    bgColor: "bg-teal-500/10 text-teal-500",
    alerts: false,
    type: "custom" as const,
    startDate: new Date(2025, 2, 1),
    endDate: new Date(2025, 2, 15),
  },
];

const chartData = budgets.map((b) => ({
  name: b.category,
  value: b.spent,
  color: b.color,
}));

function calculateProjectedSpending(budget: (typeof budgets)[0]): {
  projected: number;
  status: "on-track" | "warning" | "over";
  daysElapsed?: number;
  totalDays?: number;
  typeLabel: string;
} {
  const today = new Date();
  
  // For onetime/custom range budgets
  if ((budget.type === "onetime" || budget.type === "custom") && budget.startDate && budget.endDate) {
    const totalDays = Math.ceil(
      (budget.endDate.getTime() - budget.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysElapsed = Math.ceil(
      (today.getTime() - budget.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysElapsed <= 0) {
      return {
        projected: budget.spent,
        status: "on-track",
        daysElapsed: 0,
        totalDays,
        typeLabel: `${budget.type === "onetime" ? "One-Time" : "Custom Range"}`,
      };
    }

    const dailyRate = budget.spent / Math.max(1, daysElapsed);
    const projected = dailyRate * totalDays;

    if (projected > budget.budget * 1.1) {
      return { projected, status: "over", daysElapsed, totalDays, typeLabel: "Custom Range" };
    } else if (projected > budget.budget * 0.9) {
      return { projected, status: "warning", daysElapsed, totalDays, typeLabel: "Custom Range" };
    }
    return { projected, status: "on-track", daysElapsed, totalDays, typeLabel: "Custom Range" };
  }

  // For recurring budgets
  if (budget.createdDate) {
    const daysElapsed = Math.ceil(
      (today.getTime() - budget.createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let totalDays: number;
    let typeLabel: string;

    switch (budget.type) {
      case "weekly":
        totalDays = 7;
        typeLabel = "Weekly";
        break;
      case "yearly":
        totalDays = 365;
        typeLabel = "Yearly";
        break;
      case "monthly":
      default:
        totalDays = 30;
        typeLabel = "Monthly";
        break;
    }

    if (daysElapsed <= 0) {
      return { projected: budget.spent, status: "on-track", daysElapsed: 0, totalDays, typeLabel };
    }

    const dailyRate = budget.spent / Math.max(1, daysElapsed);
    const projected = dailyRate * totalDays;

    if (projected > budget.budget * 1.1) {
      return { projected, status: "over", daysElapsed, totalDays, typeLabel };
    } else if (projected > budget.budget * 0.9) {
      return { projected, status: "warning", daysElapsed, totalDays, typeLabel };
    }
    return { projected, status: "on-track", daysElapsed, totalDays, typeLabel };
  }

  return { projected: budget.spent, status: "on-track", typeLabel: "Monthly" };
}

export default function BudgetsPage() {
  const router = useRouter();
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<(typeof budgets)[0] | null>(
    null
  );

  const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overBudgetItems = budgets.filter((b) => b.spent > b.budget);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Manage your spending limits and track progress
          </p>
        </div>
        <Button className="gap-2" onClick={() => setBudgetDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Budget
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Budget
                </p>
                <p className="text-2xl font-bold">₦{totalBudget.toLocaleString("en-NG", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <Target className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Spent
                </p>
                <p className="text-2xl font-bold">₦{totalSpent.toLocaleString("en-NG", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-chart-2/10 text-chart-2">
                <TrendingDown className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Remaining
                </p>
                <p className="text-2xl font-bold text-success">
                  ₦{(totalBudget - totalSpent).toLocaleString("en-NG", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-success/10 text-success">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Over Budget
                </p>
                <p className="text-2xl font-bold text-destructive">
                  {overBudgetItems.length}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="budgets" className="space-y-6">
        <TabsList>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="savings">Savings Buckets</TabsTrigger>
        </TabsList>

        <TabsContent value="budgets" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Budget Categories */}
            <div className="lg:col-span-2 space-y-4">
              {budgets.map((budget) => {
                const percentage = Math.round((budget.spent / budget.budget) * 100);
                const projectionData = calculateProjectedSpending(budget);
                const isOverBudget = projectionData.status === "over";
                const isWarning = projectionData.status === "warning";

                return (
                  <Card
                    key={budget.id}
                    className={cn(
                      "hover:shadow-md transition-shadow cursor-pointer",
                      isOverBudget && "border-destructive/50",
                      isWarning && "border-amber-500/30"
                    )}
                    onClick={() => router.push(`/budgets/${budget.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", budget.bgColor)}>
                            <budget.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{budget.category}</p>
                              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                                {projectionData.typeLabel}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              ₦{budget.spent.toLocaleString()} of ₦{budget.budget.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {budget.alerts ? (
                            <Bell className="h-4 w-4 text-primary" />
                          ) : (
                            <BellOff className="h-4 w-4 text-muted-foreground" />
                          )}
                          {isOverBudget && (
                            <Badge variant="destructive" className="text-xs">
                              Over
                            </Badge>
                          )}
                          {isWarning && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-amber-500/10 text-amber-700"
                            >
                              Warning
                            </Badge>
                          )}
                        </div>
                      </div>

                      {(projectionData.daysElapsed !== undefined && projectionData.totalDays !== undefined) && (
                        <div className="mb-3 p-2 bg-muted/50 rounded text-xs">
                          <p className="text-muted-foreground">
                            Projected: ₦{projectionData.projected.toLocaleString("en-NG", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })} ({projectionData.daysElapsed} of {projectionData.totalDays} days)
                          </p>
                        </div>
                      )}

                      <div className="space-y-1">
                        <Progress
                          value={Math.min(percentage, 100)}
                          className={cn(
                            "h-2",
                            isOverBudget && "[&>div]:bg-destructive",
                            isWarning && "[&>div]:bg-amber-500"
                          )}
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{percentage}% used</span>
                          <span>
                            ₦{(budget.budget - budget.spent).toLocaleString()}{" "}
                            {isOverBudget ? "over" : "left"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Spending Distribution */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Spending Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`₦${value.toLocaleString("en-NG")}`, ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {chartData.slice(0, 6).map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-muted-foreground truncate">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="savings">
          <SavingsBuckets />
        </TabsContent>
      </Tabs>

      <BudgetDialog
        open={budgetDialogOpen}
        onOpenChange={setBudgetDialogOpen}
        budget={selectedBudget}
      />
    </div>
  );
}

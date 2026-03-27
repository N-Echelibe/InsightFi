"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Printer,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

const monthlyData = [
  { month: "Jan", income: 6500, expenses: 4200, savings: 2300 },
  { month: "Feb", income: 6800, expenses: 3900, savings: 2900 },
  { month: "Mar", income: 7200, expenses: 4800, savings: 2400 },
  { month: "Apr", income: 6900, expenses: 4100, savings: 2800 },
  { month: "May", income: 7500, expenses: 4500, savings: 3000 },
  { month: "Jun", income: 8200, expenses: 5200, savings: 3000 },
  { month: "Jul", income: 7800, expenses: 4800, savings: 3000 },
  { month: "Aug", income: 8500, expenses: 5100, savings: 3400 },
  { month: "Sep", income: 7900, expenses: 4700, savings: 3200 },
  { month: "Oct", income: 8100, expenses: 5000, savings: 3100 },
  { month: "Nov", income: 8800, expenses: 5500, savings: 3300 },
  { month: "Dec", income: 9200, expenses: 6100, savings: 3100 },
];

const categoryBreakdown = [
  { name: "Housing", value: 2200, color: "#8b5cf6" },
  { name: "Food", value: 800, color: "#22c55e" },
  { name: "Transportation", value: 400, color: "#3b82f6" },
  { name: "Utilities", value: 250, color: "#06b6d4" },
  { name: "Entertainment", value: 200, color: "#eab308" },
  { name: "Shopping", value: 350, color: "#f97316" },
  { name: "Health", value: 200, color: "#ec4899" },
  { name: "Other", value: 300, color: "#6b7280" },
];

const budgetAdherenceTrendData = [
  { month: "Jan", adherence: 85 },
  { month: "Feb", adherence: 88 },
  { month: "Mar", adherence: 82 },
  { month: "Apr", adherence: 90 },
  { month: "May", adherence: 87 },
  { month: "Jun", adherence: 84 },
  { month: "Jul", adherence: 91 },
  { month: "Aug", adherence: 86 },
  { month: "Sep", adherence: 89 },
  { month: "Oct", adherence: 85 },
  { month: "Nov", adherence: 88 },
  { month: "Dec", adherence: 87 },
];

const categoryDominanceData = [
  { name: "Housing", value: 2200, percentage: 44 },
  { name: "Food & Dining", value: 680, percentage: 14 },
  { name: "Shopping", value: 450, percentage: 9 },
  { name: "Transportation", value: 320, percentage: 6 },
  { name: "Entertainment", value: 180, percentage: 4 },
  { name: "Utilities", value: 180, percentage: 4 },
  { name: "Health", value: 120, percentage: 2 },
  { name: "Other", value: 270, percentage: 5 },
];

const spendingTrendData = [
  { month: "Jan", spending: 4400 },
  { month: "Feb", spending: 4200 },
  { month: "Mar", spending: 5100 },
  { month: "Apr", spending: 4500 },
  { month: "May", spending: 4800 },
  { month: "Jun", spending: 5500 },
  { month: "Jul", spending: 5000 },
  { month: "Aug", spending: 5300 },
  { month: "Sep", spending: 4900 },
  { month: "Oct", spending: 5200 },
  { month: "Nov", spending: 5700 },
  { month: "Dec", spending: 6200 },
];

const budgetRiskAlerts = [
  { category: "Shopping", risk: "high", percentage: 128, message: "Exceeding by ₦100" },
  { category: "Food & Dining", risk: "moderate", percentage: 85, message: "On track" },
  { category: "Transportation", risk: "low", percentage: 80, message: "Well managed" },
  { category: "Entertainment", risk: "low", percentage: 90, message: "On track" },
  { category: "Housing", risk: "low", percentage: 100, message: "On target" },
  { category: "Utilities", risk: "low", percentage: 72, message: "Well managed" },
];

const reportTypes = [
  {
    id: "spending",
    name: "Spending Report",
    description: "Detailed breakdown of your expenses by category",
    icon: PieChartIcon,
  },
  {
    id: "income",
    name: "Income Report",
    description: "Analysis of your income sources and trends",
    icon: TrendingUp,
  },
  {
    id: "budget-performance",
    name: "Budget Performance Report",
    description: "Track how well you stay within your budgets",
    icon: BarChart3,
  },
  {
    id: "insights",
    name: "Insight Report",
    description: "Key insights and recommendations for better financial health",
    icon: FileText,
  },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState("spending");

  return (
    <main className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-2">
          Analyze your financial performance and get insights
        </p>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((report) => (
          <Card
            key={report.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              reportType === report.id && "ring-2 ring-primary"
            )}
            onClick={() => setReportType(report.id)}
          >
            <CardContent className="p-5">
              <div className="flex flex-col gap-3">
                <div className={cn("p-2 rounded-lg w-fit", 
                  reportType === report.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  <report.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">{report.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {report.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reports Content */}
      <div className="space-y-6">
        {/* Budget Performance Report */}
        {reportType === "budget-performance" && (
          <div className="space-y-6">
            {/* Main Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Budget Adherence Trend</CardTitle>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={budgetAdherenceTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        className="text-muted-foreground"
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                        tickLine={false}
                        axisLine={false}
                        className="text-muted-foreground"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value: number) => [`${value}%`, "Adherence"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="adherence"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", r: 5 }}
                        activeDot={{ r: 7 }}
                        name="Budget Adherence"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Budget Performance Summary */}
                <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Budget adherence: 87%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You stayed within budget in 5 out of 6 categories within the last 12 months
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Insight Report */}
        {reportType === "insights" && (
          <div className="space-y-6">
            {/* Category Dominance */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Category Dominance</CardTitle>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryDominanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value: number) => `${value}%`}
                      />
                      <Bar dataKey="percentage" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Housing</span> dominates your spending at 44% of total expenses, followed by Food & Dining at 14%.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Spending Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Spending Trends</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={spendingTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value: number) => `₦${value.toLocaleString()}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="spending"
                        stroke="#f97316"
                        strokeWidth={3}
                        dot={{ fill: "#f97316", r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    Your spending shows an <span className="font-semibold text-foreground">upward trend</span>, increasing from ₦4,400 in January to ₦6,200 in December, a 41% increase.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Budget Risk Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Risk Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {budgetRiskAlerts.map((alert) => (
                    <div key={alert.category} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-start gap-3 flex-1">
                        {alert.risk === "high" ? (
                          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        ) : alert.risk === "moderate" ? (
                          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{alert.category}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-semibold">{alert.percentage}%</span>
                        <Badge 
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            alert.risk === "high" && "bg-destructive/10 text-destructive",
                            alert.risk === "moderate" && "bg-amber-500/10 text-amber-700",
                            alert.risk === "low" && "bg-success/10 text-success"
                          )}
                        >
                          {alert.risk === "high" ? "High Risk" : alert.risk === "moderate" ? "Moderate" : "Low Risk"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Spending Behavior & Risk Level */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Spending Behavior Classification */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Spending Behavior Classification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 bg-muted/50 rounded-lg border border-muted">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">Pattern</p>
                          <p className="text-xs text-muted-foreground mt-1">Steady with seasonal spikes</p>
                        </div>
                        <Badge variant="secondary">Identified</Badge>
                      </div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg border border-muted">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">Frequency</p>
                          <p className="text-xs text-muted-foreground mt-1">Regular monthly with variation</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg border border-muted">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">Average Spend</p>
                          <p className="text-lg font-bold mt-1">₦5,075</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Level Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Overall Risk Level</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                    <div>
                      <p className="font-semibold text-amber-900">Moderate Risk</p>
                      <p className="text-xs text-amber-700 mt-1">1 category exceeds budget</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-700">83%</p>
                      <p className="text-xs text-amber-700">Overall Health</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Risk Categories</span>
                      <span className="font-medium">1 High, 1 Moderate, 4 Low</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Recommendations</span>
                      <span className="font-medium">Focus on Shopping budget</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Standard Reports (Spending & Income) */}
        {(reportType === "spending" || reportType === "income") && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">
                  {reportType === "spending"
                    ? "Monthly Income vs Expenses"
                    : "Income Trends"}
                </CardTitle>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => `₦${value.toLocaleString()}`}
                      />
                      <Legend />
                      <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Income" />
                      <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Expense Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => `₦${value.toLocaleString()}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4 max-h-[200px] overflow-y-auto">
                  {categoryBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium">₦{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}

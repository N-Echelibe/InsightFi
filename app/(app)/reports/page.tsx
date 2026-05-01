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
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  FileSpreadsheet,
  Printer,
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
  AreaChart,
  Area,
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

const netWorthHistory = [
  { month: "Jan", assets: 120000, liabilities: 45000, netWorth: 75000 },
  { month: "Feb", assets: 125000, liabilities: 44000, netWorth: 81000 },
  { month: "Mar", assets: 128000, liabilities: 43500, netWorth: 84500 },
  { month: "Apr", assets: 132000, liabilities: 43000, netWorth: 89000 },
  { month: "May", assets: 138000, liabilities: 42000, netWorth: 96000 },
  { month: "Jun", assets: 142000, liabilities: 41500, netWorth: 100500 },
  { month: "Jul", assets: 148000, liabilities: 41000, netWorth: 107000 },
  { month: "Aug", assets: 152000, liabilities: 40000, netWorth: 112000 },
  { month: "Sep", assets: 158000, liabilities: 39500, netWorth: 118500 },
  { month: "Oct", assets: 162000, liabilities: 39000, netWorth: 123000 },
  { month: "Nov", assets: 168000, liabilities: 38000, netWorth: 130000 },
  { month: "Dec", assets: 175000, liabilities: 37500, netWorth: 137500 },
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
    id: "networth",
    name: "Net Worth Report",
    description: "Track your assets, liabilities, and net worth over time",
    icon: BarChart3,
  },
  {
    id: "tax",
    name: "Tax Summary",
    description: "Year-end summary for tax preparation",
    icon: FileText,
  },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("12m");
  const [reportType, setReportType] = useState("spending");

  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
  const totalSavings = totalIncome - totalExpenses;
  const savingsRate = Math.round((totalSavings / totalIncome) * 100);

  const handleExport = (format: "pdf" | "csv") => {
    // In real implementation, generate and download the report
    console.log(`Exporting report as ${format}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Analyze your financial data with detailed reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="12m">Last 12 Months</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 bg-transparent" onClick={() => handleExport("csv")}>
            <FileSpreadsheet className="h-4 w-4" />
            CSV
          </Button>
          <Button className="gap-2" onClick={() => handleExport("pdf")}>
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Income
                </p>
                <p className="text-2xl font-bold">
                  ${totalIncome.toLocaleString()}
                </p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% vs last year
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-success/10 text-success">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Expenses
                </p>
                <p className="text-2xl font-bold">
                  ${totalExpenses.toLocaleString()}
                </p>
                <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +8% vs last year
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive">
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
                  Total Savings
                </p>
                <p className="text-2xl font-bold">
                  ${totalSavings.toLocaleString()}
                </p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +18% vs last year
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
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
                  Savings Rate
                </p>
                <p className="text-2xl font-bold">{savingsRate}%</p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +3% vs last year
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-chart-4/10 text-chart-4">
                <PieChartIcon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((report) => (
          <Card
            key={report.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              reportType === report.id && "border-primary ring-1 ring-primary"
            )}
            onClick={() => setReportType(report.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    reportType === report.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">
              {reportType === "spending"
                ? "Monthly Income vs Expenses"
                : reportType === "income"
                  ? "Income Trends"
                  : reportType === "networth"
                    ? "Net Worth Over Time"
                    : "Tax Summary"}
            </CardTitle>
            <Button variant="ghost" size="sm" className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                {reportType === "networth" ? (
                  <AreaChart data={netWorthHistory}>
                    <defs>
                      <linearGradient id="assetsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="liabilitiesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="assets"
                      stroke="#22c55e"
                      fill="url(#assetsGradient)"
                      name="Assets"
                    />
                    <Area
                      type="monotone"
                      dataKey="liabilities"
                      stroke="#ef4444"
                      fill="url(#liabilitiesGradient)"
                      name="Liabilities"
                    />
                    <Line
                      type="monotone"
                      dataKey="netWorth"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      name="Net Worth"
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                    />
                    <Legend />
                    <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Income" />
                    <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                  </BarChart>
                )}
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
                    formatter={(value: number) => [`$${value}`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {categoryBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">${item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Monthly Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Month
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Income
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Expenses
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Savings
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Savings Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month) => {
                  const rate = Math.round((month.savings / month.income) * 100);
                  return (
                    <tr
                      key={month.month}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">{month.month} 2024</td>
                      <td className="py-3 px-4 text-right text-success">
                        +${month.income.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-destructive">
                        -${month.expenses.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        ${month.savings.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge
                          variant="secondary"
                          className={cn(
                            rate >= 30
                              ? "bg-success/10 text-success"
                              : rate >= 20
                                ? "bg-warning/10 text-warning"
                                : "bg-destructive/10 text-destructive"
                          )}
                        >
                          {rate}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

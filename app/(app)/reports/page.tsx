"use client";

import { useState, useEffect } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/skeletons";
import { ErrorState } from "@/components/states";

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
import api, { getSupabaseAccessToken } from "@/lib/api";
import axios from "axios";
import {
  calculatePercentChange,
  formatPercentChange,
  getComparisonRange,
  getTrendFromChange,
  summarizeTransactions,
  type ComparisonRange,
  type TransactionLike,
} from "@/lib/period-comparison";

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

const formatCurrency = (value: number) =>
  `${"\u20a6"}${Math.round(value).toLocaleString("en-NG")}`;

const formatCompactCurrency = (value: number) =>
  `${"\u20a6"}${(value / 1000).toFixed(0)}k`;

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
  // {
  //   id: "networth",
  //   name: "Net Worth Report",
  //   description: "Track your assets, liabilities, and net worth over time",
  //   icon: BarChart3,
  // },
  // {
  //   id: "tax",
  //   name: "Tax Summary",
  //   description: "Year-end summary for tax preparation",
  //   icon: FileText,
  // },
];

const reportRangeToComparisonRange: Record<string, ComparisonRange> = {
  "1m": "last-30-days",
  "3m": "last-3-months",
  "6m": "last-6-months",
  "12m": "last-12-months",
  ytd: "year-to-date",
};

type TrendComparison = {
  incomeChange: number | null;
  expensesChange: number | null;
  savingsChange: number | null;
  savingsRateChange: number | null;
  label: string;
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("12m");
  const [reportType, setReportType] = useState("spending");
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalSavings: 0,
    savingsRate: 0,
  });
  const [monthlyBreakdown, setMonthlyBreakdown] = useState(monthlyData);
  const [categories, setCategories] = useState(categoryBreakdown);
  const [trendComparison, setTrendComparison] = useState<TrendComparison>({
    incomeChange: null,
    expensesChange: null,
    savingsChange: null,
    savingsRateChange: null,
    label: "vs previous period",
  });

  useEffect(() => {
    const loadReports = async () => {
      try {
        setHasError(false);
        setIsLoading(true);
        const comparisonRange = getComparisonRange(
          reportRangeToComparisonRange[dateRange] ?? "last-12-months"
        );

        const [
          response,
          currentTransactionsResponse,
          previousTransactionsResponse,
        ] = await Promise.all([
          api.get<any>("/reports", {
            query: { range: dateRange, type: reportType },
          }),
          api.get<{ transactions: TransactionLike[] }>("/transactions", {
            query: {
              limit: 1000,
              startDate: comparisonRange.start.toISOString(),
              endDate: comparisonRange.end.toISOString(),
            },
          }),
          api.get<{ transactions: TransactionLike[] }>("/transactions", {
            query: {
              limit: 1000,
              startDate: comparisonRange.previousStart.toISOString(),
              endDate: comparisonRange.previousEnd.toISOString(),
            },
          }),
        ]);
        const currentPeriod = summarizeTransactions(
          currentTransactionsResponse.transactions ?? []
        );
        const previousPeriod = summarizeTransactions(
          previousTransactionsResponse.transactions ?? []
        );

        setSummary(response.summary);
        setTrendComparison({
          incomeChange: calculatePercentChange(
            currentPeriod.income,
            previousPeriod.income
          ),
          expensesChange: calculatePercentChange(
            currentPeriod.expenses,
            previousPeriod.expenses
          ),
          savingsChange: calculatePercentChange(
            currentPeriod.savings,
            previousPeriod.savings
          ),
          savingsRateChange: calculatePercentChange(
            currentPeriod.savingsRate,
            previousPeriod.savingsRate
          ),
          label: comparisonRange.label,
        });
        setMonthlyBreakdown(
          (response.monthlyBreakdown ?? []).map((item: any) => ({
            month: item.label ?? item.month,
            income: Number(item.income ?? 0),
            expenses: Number(item.expenses ?? 0),
            savings: Number(item.savings ?? 0),
          })),
        );
        setCategories(
          (response.categoryBreakdown ?? []).map((item: any, index: number) => ({
            name: item.name,
            value: Number(item.value ?? 0),
            color: item.color?.startsWith("#")
              ? item.color
              : categoryBreakdown[index % categoryBreakdown.length]?.color ?? "#6b7280",
          })),
        );
        setHasLoadedOnce(true);
      } catch (error) {
        console.error(error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, [dateRange, reloadTick, reportType]);

  const totalIncome = summary.totalIncome;
  const totalExpenses = summary.totalExpenses;
  const totalSavings = summary.totalSavings;
  const savingsRate = summary.savingsRate;

  const handleExport = async (format: "pdf" | "csv") => {
    if (format === "pdf") {
      // window.print();
      return;
    }

    const accessToken = await getSupabaseAccessToken();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API}/reports/export`,
      { format: "csv", range: dateRange, type: reportType },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: "blob",
      },
    );
    const blob = response.data;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "financial-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading && !hasLoadedOnce) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-8 w-36 rounded-md bg-muted" />
            <div className="mt-2 h-4 w-80 rounded-md bg-muted" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-[140px] rounded-md bg-muted" />
            <div className="h-10 w-20 rounded-md bg-muted" />
            <div className="h-10 w-20 rounded-md bg-muted" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <CardSkeleton count={4} variant="stat" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-28 rounded-md bg-muted" />
                    <div className="h-3 w-full rounded-md bg-muted" />
                    <div className="h-3 w-3/4 rounded-md bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="h-6 w-52 rounded-md bg-muted" />
              <div className="h-9 w-20 rounded-md bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-[350px] rounded-md bg-muted" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-6 w-40 rounded-md bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-[200px] rounded-md bg-muted" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-muted" />
                      <div className="h-4 w-24 rounded-md bg-muted" />
                    </div>
                    <div className="h-4 w-12 rounded-md bg-muted" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="h-6 w-40 rounded-md bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-10 rounded-md bg-muted" />
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-12 rounded-md bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Analyze your financial data with detailed reports
          </p>
        </div>
        <ErrorState
          title="Failed to load reports"
          description="We couldn&apos;t load your reports. Please try again."
          onRetry={() => {
            setHasError(false);
            setIsLoading(true);
            setReloadTick((value) => value + 1);
          }}
        />
      </div>
    );
  }

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
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-[140px]">
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
          <Button
            variant="outline"
            className="min-w-0 flex-1 gap-2 bg-transparent sm:flex-none"
            onClick={() => handleExport("csv")}
          >
            <FileSpreadsheet className="h-4 w-4" />
            CSV
          </Button>
          {/* <Button
            className="min-w-0 flex-1 gap-2 sm:flex-none"
            onClick={() => handleExport("pdf")}
          >
            <Download className="h-4 w-4" />
            PDF
          </Button> */}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Income"
          value={formatCurrency(totalIncome)}
          change={formatPercentChange(
            trendComparison.incomeChange,
            trendComparison.label
          )}
          trend={getTrendFromChange(trendComparison.incomeChange)}
          icon={DollarSign}
          iconColor="bg-success/10 text-success"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          change={formatPercentChange(
            trendComparison.expensesChange,
            trendComparison.label
          )}
          trend={getTrendFromChange(trendComparison.expensesChange, true)}
          icon={TrendingDown}
          iconColor="bg-destructive/10 text-destructive"
        />
        <StatCard
          title="Total Savings"
          value={formatCurrency(totalSavings)}
          change={formatPercentChange(
            trendComparison.savingsChange,
            trendComparison.label
          )}
          trend={getTrendFromChange(trendComparison.savingsChange)}
          icon={TrendingUp}
          iconColor="bg-primary/10 text-primary"
        />
        <StatCard
          title="Savings Rate"
          value={`${savingsRate}%`}
          change={formatPercentChange(
            trendComparison.savingsRateChange,
            trendComparison.label
          )}
          trend={getTrendFromChange(trendComparison.savingsRateChange)}
          icon={PieChartIcon}
          iconColor="bg-chart-4/10 text-chart-4"
        />
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      tickFormatter={formatCompactCurrency}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [formatCurrency(value), ""]}
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
                  <BarChart data={monthlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={formatCompactCurrency}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [formatCurrency(value), ""]}
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
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [formatCurrency(value), ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {categories.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
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
                {monthlyBreakdown.map((month) => {
                  const rate = Math.round((month.savings / month.income) * 100);
                  return (
                    <tr
                      key={month.month}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">{month.month} 2024</td>
                      <td className="py-3 px-4 text-right text-success">
                        +{formatCurrency(month.income)}
                      </td>
                      <td className="py-3 px-4 text-right text-destructive">
                        -{formatCurrency(month.expenses)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(month.savings)}
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

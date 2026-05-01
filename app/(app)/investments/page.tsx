"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Plus,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { cn } from "@/lib/utils";

const portfolioHistory = [
  { date: "Jan", value: 78500 },
  { date: "Feb", value: 82300 },
  { date: "Mar", value: 79800 },
  { date: "Apr", value: 85200 },
  { date: "May", value: 88100 },
  { date: "Jun", value: 84500 },
  { date: "Jul", value: 91200 },
  { date: "Aug", value: 89450 },
  { date: "Sep", value: 93100 },
  { date: "Oct", value: 96800 },
  { date: "Nov", value: 98200 },
  { date: "Dec", value: 102450 },
];

const holdings = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    shares: 50,
    price: 185.92,
    value: 9296.0,
    change: 2.34,
    changePercent: 1.28,
    color: "#22c55e",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    shares: 25,
    price: 141.8,
    value: 3545.0,
    change: -1.56,
    changePercent: -1.09,
    color: "#ef4444",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    shares: 30,
    price: 378.91,
    value: 11367.3,
    change: 4.21,
    changePercent: 1.12,
    color: "#22c55e",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    shares: 40,
    price: 155.34,
    value: 6213.6,
    change: 2.87,
    changePercent: 1.88,
    color: "#22c55e",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    shares: 20,
    price: 495.22,
    value: 9904.4,
    change: 12.45,
    changePercent: 2.58,
    color: "#22c55e",
  },
  {
    symbol: "VTI",
    name: "Vanguard Total Stock",
    shares: 100,
    price: 245.67,
    value: 24567.0,
    change: 1.23,
    changePercent: 0.5,
    color: "#22c55e",
  },
  {
    symbol: "BND",
    name: "Vanguard Total Bond",
    shares: 200,
    price: 72.34,
    value: 14468.0,
    change: -0.12,
    changePercent: -0.17,
    color: "#ef4444",
  },
];

const allocation = [
  { name: "US Stocks", value: 45, color: "#22c55e" },
  { name: "International", value: 20, color: "#3b82f6" },
  { name: "Bonds", value: 20, color: "#8b5cf6" },
  { name: "Real Estate", value: 10, color: "#f97316" },
  { name: "Cash", value: 5, color: "#6b7280" },
];

export default function InvestmentsPage() {
  const [timeRange, setTimeRange] = useState("1y");

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalChange = holdings.reduce((sum, h) => sum + h.change * h.shares, 0);
  const totalChangePercent = (totalChange / (totalValue - totalChange)) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Investments</h1>
          <p className="text-muted-foreground">
            Track your portfolio performance and holdings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <RefreshCw className="h-4 w-4" />
            Sync
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Investment
          </Button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Value
                </p>
                <p className="text-2xl font-bold">
                  ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
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
                  {"Today's Change"}
                </p>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    totalChange >= 0 ? "text-success" : "text-destructive"
                  )}
                >
                  {totalChange >= 0 ? "+" : ""}$
                  {totalChange.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div
                className={cn(
                  "p-2.5 rounded-lg",
                  totalChange >= 0
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {totalChange >= 0 ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Gain/Loss
                </p>
                <p className="text-2xl font-bold text-success">+$23,950.00</p>
                <p className="text-xs text-success">+30.5% all time</p>
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
                  Holdings
                </p>
                <p className="text-2xl font-bold">{holdings.length}</p>
                <p className="text-xs text-muted-foreground">Across 3 accounts</p>
              </div>
              <div className="p-2.5 rounded-lg bg-chart-4/10 text-chart-4">
                <PieChartIcon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">
              Portfolio Performance
            </CardTitle>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">1 Month</SelectItem>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioHistory}>
                  <defs>
                    <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [
                      `$${value.toLocaleString()}`,
                      "Value",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#portfolioGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Asset Allocation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {allocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {allocation.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Symbol
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Shares
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Price
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Value
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Change
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground" />
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => (
                  <tr
                    key={holding.symbol}
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-semibold">{holding.symbol}</span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {holding.name}
                    </td>
                    <td className="py-3 px-4 text-right">{holding.shares}</td>
                    <td className="py-3 px-4 text-right">
                      ${holding.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      ${holding.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div
                        className={cn(
                          "flex items-center justify-end gap-1",
                          holding.change >= 0 ? "text-success" : "text-destructive"
                        )}
                      >
                        {holding.change >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span>
                          {holding.change >= 0 ? "+" : ""}
                          {holding.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

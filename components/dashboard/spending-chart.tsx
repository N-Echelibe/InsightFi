"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

const defaultData = [
  { name: "Jan", income: 6500, expenses: 4200 },
  { name: "Feb", income: 6800, expenses: 3900 },
  { name: "Mar", income: 7200, expenses: 4800 },
  { name: "Apr", income: 6900, expenses: 4100 },
  { name: "May", income: 7500, expenses: 4500 },
  { name: "Jun", income: 8200, expenses: 5200 },
  { name: "Jul", income: 7800, expenses: 4800 },
  { name: "Aug", income: 8500, expenses: 5100 },
  { name: "Sep", income: 7900, expenses: 4700 },
  { name: "Oct", income: 8100, expenses: 5000 },
  { name: "Nov", income: 8800, expenses: 5500 },
  { name: "Dec", income: 9200, expenses: 6100 },
];

export function SpendingChart({
  data = defaultData,
}: {
  data?: Array<{ name: string; income: number; expenses: number }>;
}) {
  const [period, setPeriod] = useState("12m");

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">
          Income vs Expenses
        </CardTitle>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">3 months</SelectItem>
            <SelectItem value="6m">6 months</SelectItem>
            <SelectItem value="12m">12 months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₦${value / 1000}k`}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`₦${value.toLocaleString("en-NG")}`, ""]}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#incomeGradient)"
                name="Income"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#expenseGradient)"
                name="Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
            <span className="text-sm text-muted-foreground">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
            <span className="text-sm text-muted-foreground">Expenses</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

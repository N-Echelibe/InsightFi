"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { AccountsCard } from "@/components/dashboard/accounts-card";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { BudgetOverview } from "@/components/dashboard/budget-overview";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SavingsGoals } from "@/components/dashboard/savings-goals";
import {
  FinancialProfileCard,
  SpendingBreakdownCard,
  CashRunwayAlertCard,
  SmartRecommendationsCard,
} from "@/components/dashboard/insights-card";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Good morning, John
          </h1>
          <p className="text-muted-foreground mt-1">
            {"Here's your financial overview for today"}
          </p>
        </div>
        <Button className="gap-2">
          <ArrowUpRight className="h-4 w-4" />
          Quick Transfer
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Balance"
          value={144798.57}
          change="+2.5% from last month"
          trend="up"
          icon={Wallet}
          iconColor="bg-primary/10 text-primary"
          isCurrency={true}
        />
        <StatCard
          title="Monthly Income"
          value={8450.0}
          change="+12.3% from last month"
          trend="up"
          icon={TrendingUp}
          iconColor="bg-success/10 text-success"
          isCurrency={true}
        />
        <StatCard
          title="Monthly Expenses"
          value={5230.45}
          change="+5.2% from last month"
          trend="down"
          icon={TrendingDown}
          iconColor="bg-destructive/10 text-destructive"
          isCurrency={true}
        />
        <StatCard
          title="Savings Rate"
          value="38%"
          change="+3% from last month"
          trend="up"
          icon={PiggyBank}
          iconColor="bg-chart-4/10 text-chart-4"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Charts & Spending Breakdown */}
        <div className="lg:col-span-2 space-y-8">
          <SpendingChart />
          <RecentTransactions />
          <SpendingBreakdownCard />
          <SmartRecommendationsCard />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-8">
          <FinancialProfileCard />
          <AccountsCard />
          <BudgetOverview />
          <SavingsGoals />
          <CashRunwayAlertCard />
        </div>
      </div>
    </div>
  );
}

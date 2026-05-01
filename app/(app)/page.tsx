"use client";

import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardSkeleton } from "@/components/skeletons";
import { ErrorState } from "@/components/states";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-9 w-64 rounded-md bg-muted" />
            <div className="mt-2 h-4 w-72 rounded-md bg-muted" />
          </div>
          <div className="h-10 w-36 rounded-md bg-muted" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton count={4} variant="stat" />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="h-6 w-40 rounded-md bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-80 rounded-md bg-muted" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-6 w-44 rounded-md bg-muted" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-40 rounded-md bg-muted" />
                      <div className="h-3 w-28 rounded-md bg-muted" />
                    </div>
                    <div className="h-4 w-24 rounded-md bg-muted" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-6 w-44 rounded-md bg-muted" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-32 rounded-md bg-muted" />
                      <div className="h-4 w-20 rounded-md bg-muted" />
                    </div>
                    <div className="h-2 rounded-full bg-muted" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-6 w-48 rounded-md bg-muted" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="h-5 w-5 rounded-full bg-muted" />
                    <div className="h-4 flex-1 rounded-md bg-muted" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <div className="h-5 w-36 rounded-md bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-muted/40 p-3">
                  <div className="h-3 w-32 rounded-md bg-muted" />
                  <div className="mt-2 h-6 w-40 rounded-md bg-muted" />
                  <div className="mt-2 h-3 w-20 rounded-md bg-muted" />
                </div>
              </CardContent>
            </Card>

            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="h-5 w-36 rounded-md bg-muted" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {Array.from({ length: 3 }).map((__, rowIndex) => (
                    <div key={rowIndex} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-28 rounded-md bg-muted" />
                        <div className="h-3 w-20 rounded-md bg-muted" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}

            <Card>
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <div className="h-5 w-5 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-36 rounded-md bg-muted" />
                    <div className="h-3 w-full rounded-md bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        description="We couldn't load your financial overview. Please try again."
        onRetry={() => {
          setHasError(false);
          setIsLoading(true);
        }}
      />
    );
  }

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
        <Button className="w-full gap-2 sm:w-auto">
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

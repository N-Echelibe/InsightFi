"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardSkeleton } from "@/components/skeletons";
import { EmptyState, ErrorState } from "@/components/states";
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CheckCircle,
  CircleDollarSign,
  Lightbulb,
  Target,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import {
  calculatePercentChange,
  type ComparisonRange,
  formatPercentChange,
  getComparisonRange,
  getTrendFromChange,
  summarizeTransactions,
  type TransactionLike,
} from "@/lib/period-comparison";
import {
  emptyFinancialHealthProfile,
  getFinancialHealthProfile,
  getFinancialHealthRecommendations,
  type FinancialHealthProfile,
} from "@/lib/financial-profile";

const formatCurrency = (value: number) =>
  `${"\u20a6"}${value.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

type SummaryCard = {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: typeof TrendingUp;
  iconColor: string;
};

type SpendingPattern = {
  title: string;
  description: string;
  metric?: string | number;
  percentage?: number;
};

type BudgetRisk = {
  budget_id?: string;
  category: string;
  status: string;
  message: string;
  spent: number;
  budget: number;
};

type InsightsRange = ComparisonRange;

type InsightProfile = FinancialHealthProfile;

type IncomePattern = {
  regularity: string;
  mainSource: string;
  frequency: string;
  suggestion: string;
  totalIncome?: number;
  totalExpenses?: number;
};

type SavingsBucketResponse = {
  current?: number | string;
  current_amount?: number | string;
  target?: number | string;
  target_amount?: number | string;
};

function getRiskBadge(status: string) {
  if (status === "safe") {
    return {
      label: "Safe",
      variant: "secondary" as const,
      className: "bg-success/10 text-success hover:bg-success/20",
    };
  }

  if (status === "watch") {
    return {
      label: "Watch",
      variant: "secondary" as const,
      className: "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20",
    };
  }

  return {
    label: "Exceeded",
    variant: "destructive" as const,
    className: "",
  };
}

function getBudgetRiskLevel(risks: BudgetRisk[]) {
  if (risks.some((risk) => risk.status === "exceeded")) {
    return "high" as const;
  }

  if (risks.some((risk) => risk.status === "watch")) {
    return "medium" as const;
  }

  return risks.length > 0 ? "low" as const : "none" as const;
}

function getAverageGoalProgress(buckets: SavingsBucketResponse[]) {
  const activeBuckets = buckets.filter(
    (bucket) => Number(bucket.target ?? bucket.target_amount ?? 0) > 0
  );

  if (activeBuckets.length === 0) return null;

  const totalProgress = activeBuckets.reduce((sum, bucket) => {
    const current = Number(bucket.current ?? bucket.current_amount ?? 0);
    const target = Number(bucket.target ?? bucket.target_amount ?? 0);

    return sum + Math.min((current / target) * 100, 100);
  }, 0);

  return Math.round(totalProgress / activeBuckets.length);
}

const rangeLabels: Record<InsightsRange, string> = {
  "this-month": "This Month",
  "last-30-days": "Last 30 Days",
  "last-3-months": "Last 3 Months",
  "last-6-months": "Last 6 Months",
  "last-12-months": "Last 12 Months",
  "year-to-date": "Year to Date",
};

export default function InsightsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasEnoughData, setHasEnoughData] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);
  const [dateRange, setDateRange] = useState<InsightsRange>("this-month");
  const [summary, setSummary] = useState<SummaryCard[]>([]);
  const [patterns, setPatterns] = useState<SpendingPattern[]>([]);
  const [risks, setRisks] = useState<BudgetRisk[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [profile, setProfile] = useState<InsightProfile>({
    ...emptyFinancialHealthProfile,
  });
  const [incomePattern, setIncomePattern] = useState<IncomePattern>({
    regularity: "Not enough data",
    mainSource: "No income yet",
    frequency: "No pattern yet",
    suggestion: "Add income and expense transactions to generate income insights.",
  });

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setHasError(false);
        setIsLoading(true);
        const comparisonRange = getComparisonRange(dateRange);

        const [
          response,
          currentTransactionsResponse,
          previousTransactionsResponse,
          savingsBucketsResponse,
        ] = await Promise.all([
          api.get<any>("/insights", {
            query: {
              range: dateRange,
              startDate: comparisonRange.start.toISOString(),
              endDate: comparisonRange.end.toISOString(),
            },
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
          api.get<{ buckets: SavingsBucketResponse[] }>("/savings-buckets"),
        ]);
        const currentPeriod = summarizeTransactions(
          currentTransactionsResponse.transactions ?? []
        );
        const previousPeriod = summarizeTransactions(
          previousTransactionsResponse.transactions ?? []
        );
        const responseSummary = response.summary ?? {};
        const responseIncomePattern = response.incomePattern ?? {};
        const responsePatterns: SpendingPattern[] = Array.isArray(response.spendingPatterns)
          ? response.spendingPatterns
          : [];
        const responseRisks: BudgetRisk[] = Array.isArray(response.budgetRisks)
          ? response.budgetRisks
          : [];
        const responseRecommendations: string[] = Array.isArray(response.recommendations)
          ? response.recommendations
          : [];
        const goalProgressRate = getAverageGoalProgress(
          savingsBucketsResponse.buckets ?? []
        );
        const totalIncome = Number(responseIncomePattern.totalIncome ?? 0);
        const totalExpenses = Number(responseIncomePattern.totalExpenses ?? 0);
        const hasActivity =
          (currentTransactionsResponse.transactions?.length ?? 0) > 0 ||
          totalIncome > 0 ||
          totalExpenses > 0;
        const responseSavingsRate = Number(
          responseSummary.savingsRate ?? currentPeriod.savingsRate
        );
        const dailyExpenses = totalExpenses / 30;
        const cashRunwayDays =
          dailyExpenses > 0 && currentPeriod.savings > 0
            ? Math.ceil(currentPeriod.savings / dailyExpenses)
            : null;
        const incomeChange = calculatePercentChange(
          currentPeriod.income,
          previousPeriod.income
        );
        const expensesChange = calculatePercentChange(
          currentPeriod.expenses,
          previousPeriod.expenses
        );
        const budgetRiskLevel = getBudgetRiskLevel(responseRisks);
        const budgetRiskCount = responseRisks.filter(
          (risk) => risk.status !== "safe"
        ).length;
        const profileSource = getFinancialHealthProfile(responseSavingsRate, {
          income: totalIncome,
          expenses: totalExpenses,
          hasActivity,
          budgetRiskLevel,
          budgetRiskCount,
          cashRunwayDays,
          goalProgressRate,
          isVolatile:
            Math.abs(incomeChange ?? 0) >= 40 ||
            Math.abs(expensesChange ?? 0) >= 40,
        });
        const enoughData =
          response.hasEnoughData === false ||
          response.notEnoughData ||
          response.insufficientData
            ? false
            : profileSource.status !== "no-data" ||
              responsePatterns.length > 0 ||
              responseRecommendations.length > 0 ||
              hasActivity;
        const savingsRateChange = calculatePercentChange(
          currentPeriod.savingsRate,
          previousPeriod.savingsRate
        );

        setHasEnoughData(enoughData);
        setSummary([
          {
            title: "Savings Rate",
            value:
              responseSummary.savingsRate !== undefined
                ? `${responseSummary.savingsRate}%`
                : "No data",
            change: formatPercentChange(savingsRateChange, comparisonRange.label),
            trend: getTrendFromChange(savingsRateChange),
            icon: TrendingUp,
            iconColor: "bg-success/10 text-success",
          },
          {
            title: "Budget Risk",
            value: responseSummary.budgetRisk ?? "No data",
            change: "Based on active budgets",
            trend: "neutral" as const,
            icon: AlertCircle,
            iconColor: "bg-amber-500/10 text-amber-600",
          },
          {
            title: "Spending Stability",
            value: responseSummary.spendingStability ?? "No data",
            change: "Transaction activity",
            trend: "neutral" as const,
            icon: BarChart3,
            iconColor: "bg-chart-2/10 text-chart-2",
          },
          {
            title: "Budget Survival",
            value: profileSource?.type ?? "No data",
            change:
              profileSource.score === null
                ? profileSource.benchmark
                : `${profileSource.score}/100 survival score`,
            trend: "neutral" as const,
            icon: Target,
            iconColor: "bg-primary/10 text-primary",
          },
        ]);
        setPatterns(responsePatterns);
        setRisks(responseRisks);
        const topPattern = responsePatterns[0];
        const generatedRecommendations = getFinancialHealthRecommendations(
          profileSource,
          {
            income: totalIncome,
            expenses: totalExpenses,
            topCategory: topPattern
              ? {
                  label: topPattern.title.replace(" is a top category", ""),
                  percentage:
                    topPattern.percentage ??
                    (totalExpenses > 0 && topPattern.metric !== undefined
                      ? Math.round((Number(topPattern.metric) / totalExpenses) * 100)
                      : undefined),
                  value: topPattern.metric,
                }
              : null,
            budgetRisks: responseRisks,
            incomeChange,
            expensesChange,
            savingsRateChange,
            cashRunwayDays,
            goalProgressRate,
            hasGoals: goalProgressRate !== null,
          }
        );
        setTips(
          Array.from(
            new Set([...generatedRecommendations, ...responseRecommendations])
          ).slice(0, 6)
        );
        setProfile(
          enoughData
            ? profileSource
            : emptyFinancialHealthProfile
        );
        setIncomePattern({
          regularity: responseIncomePattern.regularity ?? "Not enough data",
          mainSource: responseIncomePattern.mainSource ?? "Transactions",
          frequency: responseIncomePattern.frequency ?? "Current selected period",
          suggestion:
            totalIncome > totalExpenses
              ? "Your income is currently ahead of expenses."
              : totalIncome > 0 || totalExpenses > 0
                ? "Your expenses are close to or above income. Review flexible categories."
                : "Add income and expense transactions to generate income insights.",
          totalIncome,
          totalExpenses,
        });
        setHasLoadedOnce(true);
      } catch (error) {
        console.error(error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadInsights();
  }, [dateRange, reloadTick]);

  const rangeSelector = (
    <Select
      value={dateRange}
      onValueChange={(value) => setDateRange(value as InsightsRange)}
    >
      <SelectTrigger className="w-full sm:w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(rangeLabels).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  if (isLoading && !hasLoadedOnce) {
    return (
      <div className="space-y-6 animate-pulse">
        <div>
          <div className="h-8 w-36 rounded-md bg-muted" />
          <div className="mt-2 h-4 w-80 rounded-md bg-muted" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <CardSkeleton count={4} variant="stat" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="h-6 w-56 rounded-md bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-48 rounded-md bg-muted" />
                        <div className="h-4 w-full rounded-md bg-muted" />
                      </div>
                      <div className="h-6 w-16 rounded-full bg-muted" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="h-6 w-56 rounded-md bg-muted" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="h-4 w-36 rounded-md bg-muted" />
                        <div className="h-4 w-64 rounded-md bg-muted" />
                      </div>
                      <div className="h-6 w-20 rounded-full bg-muted" />
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="h-3 w-20 rounded-md bg-muted" />
                        <div className="h-3 w-20 rounded-md bg-muted" />
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="h-6 w-40 rounded-md bg-muted" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-muted/40 p-4">
                    <div className="h-3 w-24 rounded-md bg-muted" />
                    <div className="mt-2 h-5 w-36 rounded-md bg-muted" />
                    <div className="mt-3 h-4 w-full rounded-md bg-muted" />
                    <div className="mt-2 h-4 w-3/4 rounded-md bg-muted" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 rounded-lg border bg-muted/30" />
                    <div className="h-16 rounded-lg border bg-muted/30" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="h-6 w-44 rounded-md bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-3 rounded-lg border p-3">
                  <div className="h-4 w-4 rounded-full bg-muted" />
                  <div className="h-4 flex-1 rounded-md bg-muted" />
                </div>
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
            <p className="text-muted-foreground">
              Understand your spending habits and financial health
            </p>
          </div>
          {rangeSelector}
        </div>
        <ErrorState
          title="Failed to load insights"
          description="We couldn't load your insights. Please try again."
          onRetry={() => {
            setHasError(false);
            setIsLoading(true);
            setReloadTick((value) => value + 1);
          }}
        />
      </div>
    );
  }

  if (!hasEnoughData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
            <p className="text-muted-foreground">
              Understand your spending habits and financial health
            </p>
          </div>
          {rangeSelector}
        </div>

        <EmptyState
          icon={CircleDollarSign}
          title="Not enough data yet"
          description="Add a few income and expense transactions, then create budgets or savings goals so InsightFi can find useful patterns."
        />
      </div>
    );
  }

  const savingsRateCard = summary.find((card) => card.title === "Savings Rate");
  const budgetRiskCard = summary.find((card) => card.title === "Budget Risk");
  const incomeTotal = Number(incomePattern.totalIncome ?? 0);
  const expenseTotal = Number(incomePattern.totalExpenses ?? 0);
  const netFlow = incomeTotal - expenseTotal;
  const expenseCoverageRate =
    incomeTotal > 0 ? Math.min((expenseTotal / incomeTotal) * 100, 100) : 0;
  const incomePatternStatus =
    incomeTotal <= 0
      ? {
          label: "No Income",
          className: "bg-muted text-muted-foreground hover:bg-muted",
          message: "Add allowance or side-hustle income so InsightFi can judge whether spending is sustainable.",
        }
      : netFlow < 0
        ? {
            label: "Overspending",
            className: "bg-destructive/10 text-destructive hover:bg-destructive/20",
            message: `${formatCurrency(Math.abs(netFlow))} more has gone out than came in during this period.`,
          }
        : expenseCoverageRate >= 80
          ? {
              label: "Tight",
              className: "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20",
              message: "Most of your allowance is already committed. Keep flexible spending low.",
            }
          : {
              label: "Covered",
              className: "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20",
              message: "Your income is still covering expenses in this period.",
            };
  const displayProfile: InsightProfile = {
    ...emptyFinancialHealthProfile,
    ...profile,
    reasons: profile.reasons ?? emptyFinancialHealthProfile.reasons,
    nextAction: profile.nextAction ?? emptyFinancialHealthProfile.nextAction,
    factors: {
      ...emptyFinancialHealthProfile.factors,
      ...(profile.factors ?? {}),
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
          <p className="text-muted-foreground">
            Understand your spending habits and financial health
          </p>
        </div>
        {rangeSelector}
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{displayProfile.benchmark}</Badge>
                {displayProfile.score !== null && (
                  <Badge variant="outline">{displayProfile.score}/100 survival score</Badge>
                )}
              </div>
              <p className={cn("text-2xl font-bold", displayProfile.color)}>
                {displayProfile.type}
              </p>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {displayProfile.description}
              </p>
              <div className="mt-4 rounded-lg border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Next best action
                </p>
                <p className="mt-1 text-sm font-medium">{displayProfile.nextAction}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Why this profile</p>
              {displayProfile.reasons.slice(0, 4).map((reason) => (
                <div key={reason} className="flex gap-2 rounded-lg border p-3 text-sm">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span className="text-muted-foreground">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {summary.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            change={card.change}
            trend={card.trend}
            icon={card.icon}
            iconColor={card.iconColor}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Spending Pattern Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patterns.length === 0 ? (
                <EmptyState
                  variant="inline"
                  icon={BarChart3}
                  title="No spending patterns yet"
                  description="More categorized transactions are needed before patterns can be detected."
                />
              ) : (
                <div className="divide-y">
                  {patterns.map((pattern) => (
                    <div
                      key={pattern.title}
                      className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{pattern.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {pattern.description}
                        </p>
                      </div>
                      {pattern.metric !== undefined && (
                        <Badge variant="secondary" className="shrink-0">
                          {typeof pattern.metric === "number"
                            ? formatCurrency(pattern.metric)
                            : pattern.metric}
                          {pattern.percentage !== undefined
                            ? ` (${pattern.percentage}%)`
                            : ""}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Budget Risk & Predictions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {risks.length === 0 ? (
                <EmptyState
                  variant="inline"
                  icon={AlertTriangle}
                  title="No budget risks yet"
                  description="Create budgets and record spending to get risk predictions."
                />
              ) : (
                risks.map((risk) => {
                  const badge = getRiskBadge(risk.status);
                  const progress =
                    risk.budget > 0
                      ? Math.min((risk.spent / risk.budget) * 100, 100)
                      : 0;

                  return (
                    <div key={risk.budget_id ?? risk.category} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{risk.category}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {risk.message}
                          </p>
                        </div>
                        <Badge
                          variant={badge.variant}
                          className={cn("shrink-0", badge.className)}
                        >
                          {badge.label}
                        </Badge>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatCurrency(risk.spent)} spent</span>
                          <span>{formatCurrency(risk.budget)} budget</span>
                        </div>
                        <Progress
                          value={progress}
                          className={cn(
                            "h-2",
                            risk.status === "exceeded" && "[&>div]:bg-destructive",
                            risk.status === "watch" && "[&>div]:bg-amber-500"
                          )}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Budget Survival
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/40 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Budget Survival Score
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {displayProfile.benchmark}
                  </span>
                </div>
                <p className={cn("text-lg font-bold mb-1", displayProfile.color)}>
                  {displayProfile.type}
                </p>
                <p className="text-sm text-muted-foreground">
                  {displayProfile.description}
                </p>
                {displayProfile.score !== null && (
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Survival Score</span>
                    <span className={cn("font-medium", displayProfile.color)}>
                      {displayProfile.score}/100
                    </span>
                  </div>
                )}
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Savings Rate</p>
                  <p className="mt-1 font-semibold">
                    {savingsRateCard?.value ?? "No data"}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Risk Level</p>
                  <p className="mt-1 font-semibold">
                    {budgetRiskCard?.value ?? "No data"}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Expense Ratio</p>
                  <p className="mt-1 font-semibold">
                    {displayProfile.factors.expenseToIncomeRate === null
                      ? "No data"
                      : `${Math.round(displayProfile.factors.expenseToIncomeRate)}%`}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Goal Progress</p>
                  <p className="mt-1 font-semibold">
                    {displayProfile.factors.goalProgressRate === null
                      ? "No goals"
                      : `${Math.round(displayProfile.factors.goalProgressRate)}%`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <WalletCards className="h-5 w-5" />
                  Income Pattern
                </CardTitle>
                <Badge variant="secondary" className={incomePatternStatus.className}>
                  {incomePatternStatus.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Net income flow
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-2xl font-bold tracking-tight",
                        netFlow < 0 ? "text-destructive" : "text-success",
                      )}
                    >
                      {netFlow < 0 ? "-" : ""}
                      {formatCurrency(Math.abs(netFlow))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Expenses used</p>
                    <p className="mt-1 text-sm font-semibold">
                      {incomeTotal > 0 ? `${Math.round(expenseCoverageRate)}%` : "No data"}
                    </p>
                  </div>
                </div>
                <Progress
                  value={expenseCoverageRate}
                  className={cn(
                    "mt-3 h-2",
                    netFlow < 0
                      ? "[&>div]:bg-destructive"
                      : expenseCoverageRate >= 80
                        ? "[&>div]:bg-amber-500"
                        : "[&>div]:bg-emerald-500",
                  )}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {incomePatternStatus.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Income</p>
                  <p className="mt-1 font-semibold">{formatCurrency(incomeTotal)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Expenses</p>
                  <p className="mt-1 font-semibold">{formatCurrency(expenseTotal)}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Regularity</span>
                  <span className="font-medium text-right">{incomePattern.regularity}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Main Source</span>
                  <span className="font-medium text-right">{incomePattern.mainSource}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Activity</span>
                  <span className="font-medium text-right">{incomePattern.frequency}</span>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="text-sm text-muted-foreground">
                  {incomePattern.suggestion}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tips.length === 0 ? (
            <EmptyState
              variant="inline"
              icon={Lightbulb}
              title="No recommendations yet"
              description="InsightFi needs more transaction and budget activity before it can suggest next steps."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tips.map((recommendation) => (
                <div
                  key={recommendation}
                  className="flex gap-3 rounded-lg border p-3 text-sm"
                >
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span className="text-muted-foreground">{recommendation}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

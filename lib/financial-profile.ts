export type FinancialHealthProfileStatus =
  | "no-data"
  | "high-risk"
  | "budget-strained"
  | "inconsistent"
  | "strong-saver"
  | "stable-builder"
  | "moderate"
  | "needs-improvement";

export type FinancialHealthProfile = {
  type: string;
  description: string;
  color: string;
  benchmark: string;
  status: FinancialHealthProfileStatus;
  score: number | null;
  reasons: string[];
  nextAction: string;
  factors: {
    savingsRate: number;
    expenseToIncomeRate: number | null;
    budgetRiskLevel: "none" | "low" | "medium" | "high";
    cashRunwayDays: number | null;
    goalProgressRate: number | null;
  };
};

export type FinancialHealthProfileInput = {
  income?: number;
  expenses?: number;
  hasActivity?: boolean;
  budgetRiskLevel?: "none" | "low" | "medium" | "high";
  budgetRiskCount?: number;
  cashRunwayDays?: number | null;
  goalProgressRate?: number | null;
  isVolatile?: boolean;
};

export type FinancialRecommendationContext = {
  income?: number;
  expenses?: number;
  topCategory?: {
    label: string;
    percentage?: number;
    value?: string | number;
  } | null;
  budgetRisks?: Array<{
    category: string;
    status: string;
    spent?: number;
    budget?: number;
    percentUsed?: number;
  }>;
  incomeChange?: number | null;
  expensesChange?: number | null;
  savingsRateChange?: number | null;
  cashRunwayDays?: number | null;
  goalProgressRate?: number | null;
  hasGoals?: boolean;
};

export const emptyFinancialHealthProfile: FinancialHealthProfile = {
  type: "Not enough data",
  description: "Add allowance, expense, budget, and savings activity to build a reliable survival score.",
  color: "text-muted-foreground",
  benchmark: "No data yet",
  status: "no-data",
  score: null,
  reasons: [
    "InsightFi needs recent income and expense activity before it can classify your budget survival position.",
  ],
  nextAction: "Add a few allowance and expense transactions, then create at least one budget or goal.",
  factors: {
    savingsRate: 0,
    expenseToIncomeRate: null,
    budgetRiskLevel: "none",
    cashRunwayDays: null,
    goalProgressRate: null,
  },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const round = (value: number) => Math.round(value);

const formatPercent = (value: number) => `${round(value)}%`;

const formatCurrency = (value: number) =>
  `\u20a6${Math.round(value).toLocaleString("en-NG")}`;

const getSavingsScore = (savingsRate: number) => {
  if (savingsRate >= 30) return 30;
  if (savingsRate >= 20) return 22;
  if (savingsRate >= 10) return 12;
  if (savingsRate >= 0) return 0;
  return -30;
};

const getExpenseScore = (expenseToIncomeRate: number | null) => {
  if (expenseToIncomeRate === null) return 0;
  if (expenseToIncomeRate <= 60) return 12;
  if (expenseToIncomeRate <= 80) return 4;
  if (expenseToIncomeRate <= 100) return -8;
  return -25;
};

const getBudgetScore = (riskLevel: FinancialHealthProfileInput["budgetRiskLevel"]) => {
  if (riskLevel === "high") return -20;
  if (riskLevel === "medium") return -10;
  if (riskLevel === "low") return 5;
  return 8;
};

const getRunwayScore = (cashRunwayDays?: number | null) => {
  if (cashRunwayDays === undefined || cashRunwayDays === null) return 0;
  if (cashRunwayDays < 30) return -20;
  if (cashRunwayDays < 60) return -10;
  if (cashRunwayDays >= 90) return 10;
  return 2;
};

const getGoalScore = (goalProgressRate?: number | null) => {
  if (goalProgressRate === undefined || goalProgressRate === null) return 0;
  if (goalProgressRate >= 75) return 8;
  if (goalProgressRate >= 25) return 4;
  return 0;
};

export function getFinancialHealthProfile(
  savingsRate: number,
  input: FinancialHealthProfileInput = {},
): FinancialHealthProfile {
  const income = Number(input.income ?? 0);
  const expenses = Number(input.expenses ?? 0);
  const normalizedSavingsRate = Number.isFinite(savingsRate) ? savingsRate : 0;
  const expenseToIncomeRate = income > 0 ? (expenses / income) * 100 : null;
  const budgetRiskLevel = input.budgetRiskLevel ?? "none";
  const budgetRiskCount = Number(input.budgetRiskCount ?? 0);
  const cashRunwayDays = input.cashRunwayDays ?? null;
  const goalProgressRate = input.goalProgressRate ?? null;
  const hasActivity =
    input.hasActivity ??
    (income > 0 || expenses > 0 || Number.isFinite(savingsRate));

  if (!hasActivity) {
    return emptyFinancialHealthProfile;
  }

  const rawScore =
    50 +
    getSavingsScore(normalizedSavingsRate) +
    getExpenseScore(expenseToIncomeRate) +
    getBudgetScore(budgetRiskLevel) +
    getRunwayScore(cashRunwayDays) +
    getGoalScore(goalProgressRate) -
    (input.isVolatile ? 8 : 0);
  const score = clamp(round(rawScore), 0, 100);
  const reasons: string[] = [];

  if (income > 0) {
    reasons.push(`Savings rate is ${formatPercent(normalizedSavingsRate)} for this period.`);
    reasons.push(`Expenses used ${formatPercent(expenseToIncomeRate ?? 0)} of income.`);
  } else if (expenses > 0) {
    reasons.push("Expenses were recorded, but no income was detected for this period.");
  }

  if (budgetRiskLevel === "high") {
    reasons.push(`${budgetRiskCount || "At least one"} budget exceeded its limit.`);
  } else if (budgetRiskLevel === "medium") {
    reasons.push(`${budgetRiskCount || "At least one"} budget is close to its limit.`);
  } else {
    reasons.push("No severe budget pressure is showing right now.");
  }

  if (cashRunwayDays !== null) {
    reasons.push(`Cash runway is about ${cashRunwayDays} days at the current pace.`);
  }

  if (goalProgressRate !== null) {
    reasons.push(`Savings goals are ${formatPercent(goalProgressRate)} funded on average.`);
  }

  if (input.isVolatile) {
    reasons.push("Recent income or spending changed sharply versus the previous period.");
  }

  const highRisk =
    expenses > income ||
    normalizedSavingsRate < 0 ||
    (cashRunwayDays !== null && cashRunwayDays < 30);

  if (highRisk) {
    return {
      type: "High Risk",
      description: "Expenses, cash runway, or negative savings are putting pressure on your finances.",
      color: "text-destructive",
      benchmark: "Needs immediate attention",
      status: "high-risk",
      score,
      reasons,
      nextAction: "Review non-essential spending and move the next available income toward essentials first.",
      factors: {
        savingsRate: normalizedSavingsRate,
        expenseToIncomeRate,
        budgetRiskLevel,
        cashRunwayDays,
        goalProgressRate,
      },
    };
  }

  if (budgetRiskLevel === "high" || (budgetRiskLevel === "medium" && normalizedSavingsRate < 20)) {
    return {
      type: "Budget Strained",
      description: "Your income may cover spending, but one or more budgets are under pressure.",
      color: "text-amber-600",
      benchmark: "Watch closely",
      status: "budget-strained",
      score,
      reasons,
      nextAction: "Tighten the categories closest to their limits before adding new discretionary spending.",
      factors: {
        savingsRate: normalizedSavingsRate,
        expenseToIncomeRate,
        budgetRiskLevel,
        cashRunwayDays,
        goalProgressRate,
      },
    };
  }

  if (input.isVolatile && normalizedSavingsRate < 20) {
    return {
      type: "Inconsistent",
      description: "Your finances are positive, but recent changes make the pattern less predictable.",
      color: "text-blue-600",
      benchmark: "Variable pattern",
      status: "inconsistent",
      score,
      reasons,
      nextAction: "Set a smaller fixed savings amount until income and spending become more predictable.",
      factors: {
        savingsRate: normalizedSavingsRate,
        expenseToIncomeRate,
        budgetRiskLevel,
        cashRunwayDays,
        goalProgressRate,
      },
    };
  }

  if (score >= 85 || normalizedSavingsRate >= 30) {
    return {
      type: "Strong Saver",
      description: "You are preserving a strong share of income while keeping major risks controlled.",
      color: "text-success",
      benchmark: "Top tier",
      status: "strong-saver",
      score,
      reasons,
      nextAction: "Increase goal funding or invest part of the surplus once essentials are covered.",
      factors: {
        savingsRate: normalizedSavingsRate,
        expenseToIncomeRate,
        budgetRiskLevel,
        cashRunwayDays,
        goalProgressRate,
      },
    };
  }

  if (score >= 70 || normalizedSavingsRate >= 20) {
    return {
      type: "Stable Builder",
      description: "You are saving consistently and keeping spending within a manageable range.",
      color: "text-success",
      benchmark: "Healthy range",
      status: "stable-builder",
      score,
      reasons,
      nextAction: "Keep the rhythm and route a fixed amount into your highest-priority goal.",
      factors: {
        savingsRate: normalizedSavingsRate,
        expenseToIncomeRate,
        budgetRiskLevel,
        cashRunwayDays,
        goalProgressRate,
      },
    };
  }

  if (score >= 55 || normalizedSavingsRate >= 10) {
    return {
      type: "Moderate Saver",
      description: "You are making progress, but there is still room to improve savings consistency.",
      color: "text-blue-600",
      benchmark: "Average range",
      status: "moderate",
      score,
      reasons,
      nextAction: "Push savings above 20% by trimming one flexible category this period.",
      factors: {
        savingsRate: normalizedSavingsRate,
        expenseToIncomeRate,
        budgetRiskLevel,
        cashRunwayDays,
        goalProgressRate,
      },
    };
  }

  return {
    type: "Needs Improvement",
    description: "Your spending is under income, but savings are still too thin for comfort.",
    color: "text-amber-600",
    benchmark: "Below healthy range",
    status: "needs-improvement",
    score,
    reasons,
    nextAction: "Aim for a 10% savings rate first, then raise it once the habit is stable.",
    factors: {
      savingsRate: normalizedSavingsRate,
      expenseToIncomeRate,
      budgetRiskLevel,
      cashRunwayDays,
      goalProgressRate,
    },
  };
}

const addUnique = (items: string[], item: string) => {
  if (!items.includes(item)) {
    items.push(item);
  }
};

export function getFinancialHealthRecommendations(
  profile: FinancialHealthProfile,
  context: FinancialRecommendationContext = {},
) {
  const income = Number(context.income ?? 0);
  const expenses = Number(context.expenses ?? 0);
  const recommendations: string[] = [];
  const budgetRisks = context.budgetRisks ?? [];
  const exceededBudgets = budgetRisks.filter((risk) => risk.status === "exceeded");
  const watchedBudgets = budgetRisks.filter((risk) => risk.status === "watch");
  const topCategory = context.topCategory ?? null;
  const savingsGapToTenPercent =
    income > 0 ? Math.max(income * 0.1 - Math.max(income - expenses, 0), 0) : 0;
  const savingsGapToTwentyPercent =
    income > 0 ? Math.max(income * 0.2 - Math.max(income - expenses, 0), 0) : 0;

  if (profile.status === "no-data") {
    return [
      "Add at least one income transaction and a few expense transactions so InsightFi can compare money in versus money out.",
      "Create one budget for your largest recurring expense and one savings goal so future insights can judge risk and progress.",
    ];
  }

  if (profile.status === "high-risk") {
    addUnique(
      recommendations,
      expenses > income && income > 0
        ? `Expenses are ${formatCurrency(expenses - income)} above income this period. Pause discretionary spending until the gap is closed.`
        : "Your current pattern is risky. Prioritize essentials, debt obligations, and upcoming bills before funding wants.",
    );
  }

  if (profile.status === "budget-strained" && (exceededBudgets[0] || watchedBudgets[0])) {
    const risk = exceededBudgets[0] ?? watchedBudgets[0];
    const overage =
      Number(risk.spent ?? 0) > Number(risk.budget ?? 0)
        ? Number(risk.spent ?? 0) - Number(risk.budget ?? 0)
        : 0;
    addUnique(
      recommendations,
      overage > 0
        ? `${risk.category} is ${formatCurrency(overage)} over budget. Move flexible purchases out of this category for the rest of the period.`
        : `${risk.category} is close to its limit. Set a smaller cap before it becomes an overrun.`,
    );
  }

  if (profile.status === "inconsistent") {
    addUnique(
      recommendations,
      "Income or spending changed sharply versus the previous period. Use a smaller fixed savings amount until the pattern stabilizes.",
    );
  }

  if (savingsGapToTenPercent > 0) {
    addUnique(
      recommendations,
      `Free up ${formatCurrency(savingsGapToTenPercent)} more this period to reach a 10% savings rate.`,
    );
  } else if (savingsGapToTwentyPercent > 0) {
    addUnique(
      recommendations,
      `You are past the first savings milestone. Free up ${formatCurrency(savingsGapToTwentyPercent)} more to reach a 20% savings rate.`,
    );
  } else if (profile.status === "strong-saver" || profile.status === "stable-builder") {
    addUnique(
      recommendations,
      "Your savings rate is healthy. Increase auto-save on your highest-priority goal before expanding discretionary spending.",
    );
  }

  if (topCategory && Number(topCategory.percentage ?? 0) >= 35) {
    addUnique(
      recommendations,
      `${topCategory.label} is ${topCategory.percentage}% of spending. A small reduction here will have the biggest impact.`,
    );
  }

  if (context.expensesChange !== null && context.expensesChange !== undefined && context.expensesChange >= 25) {
    addUnique(
      recommendations,
      `Expenses rose ${formatPercent(context.expensesChange)} versus the previous period. Check whether this was a one-off spike or a new habit.`,
    );
  }

  if (
    context.savingsRateChange !== null &&
    context.savingsRateChange !== undefined &&
    context.savingsRateChange <= -10
  ) {
    addUnique(
      recommendations,
      `Savings rate fell ${formatPercent(Math.abs(context.savingsRateChange))}. Compare this period's largest purchases with last period before setting next month's budget.`,
    );
  }

  if (context.incomeChange !== null && context.incomeChange !== undefined && context.incomeChange <= -20) {
    addUnique(
      recommendations,
      `Income fell ${formatPercent(Math.abs(context.incomeChange))}. Recalculate budgets using the lower income level until it recovers.`,
    );
  }

  if (context.cashRunwayDays !== null && context.cashRunwayDays !== undefined) {
    if (context.cashRunwayDays < 30) {
      addUnique(
        recommendations,
        `Cash runway is under 30 days. Keep enough balance for essentials before moving more into long-term goals.`,
      );
    } else if (context.cashRunwayDays >= 90) {
      addUnique(
        recommendations,
        "Cash runway looks comfortable. Consider moving part of idle balance into a goal or investment account.",
      );
    }
  }

  if (context.hasGoals === false) {
    addUnique(
      recommendations,
      "Create a savings goal for your next concrete priority so surplus money has a job.",
    );
  } else if (
    context.goalProgressRate !== null &&
    context.goalProgressRate !== undefined &&
    context.goalProgressRate < 25 &&
    income > expenses
  ) {
    addUnique(
      recommendations,
      "Your goals are still early. Route part of this period's surplus into the goal with the nearest deadline.",
    );
  }

  addUnique(recommendations, profile.nextAction);

  return recommendations.slice(0, 5);
}

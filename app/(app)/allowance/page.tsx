"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  CalendarClock,
  CalendarIcon,
  Edit,
  Plus,
  ShieldAlert,
  Target,
  Trash2,
  Utensils,
  Bus,
  Smartphone,
  WalletCards,
  RotateCcw,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { EmptyState, ErrorState } from "@/components/states";
import { CardSkeleton } from "@/components/skeletons";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

type AllowancePlan = {
  id: string;
  name: string;
  amount: number;
  spent: number;
  amount_left: number;
  received_date: string;
  expected_end_date: string;
  notes?: string | null;
  safe_daily_limit: number;
  safe_daily_remaining: number;
  average_daily_expense: number;
  daily_overspend: number;
  days_passed: number;
  days_remaining: number;
  duration_days: number;
  planned_spend_to_date: number;
  spending_pace: "too_fast" | "under_pace" | "on_track";
  estimated_days_left: number | null;
  estimated_runout_date: string | null;
  status: "safe" | "moderate" | "warning" | "critical";
  status_message: string;
  affordability_split: {
    food: number;
    transport: number;
    data_misc: number;
  };
};

type AllowanceFormState = {
  id?: string;
  name: string;
  amount: string;
  receivedDate: Date | null;
  expectedEndDate: Date | null;
  notes: string;
};

type AffordabilityCategory = {
  id: string;
  label: string;
  rate: number;
  enabled: boolean;
};

const emptyForm: AllowanceFormState = {
  name: "Allowance Plan",
  amount: "",
  receivedDate: new Date(),
  expectedEndDate: null,
  notes: "",
};

const defaultAffordabilityCategories: AffordabilityCategory[] = [
  { id: "food", label: "Food", rate: 60, enabled: true },
  { id: "transport", label: "Transport", rate: 25, enabled: true },
  { id: "data_misc", label: "Data/Misc.", rate: 15, enabled: true },
  { id: "school_materials", label: "School Materials", rate: 0, enabled: false },
  { id: "emergency", label: "Emergency", rate: 0, enabled: false },
];

const formatCurrency = (value: number) =>
  `${"\u20a6"}${Math.max(Math.round(value), 0).toLocaleString("en-NG")}`;

const formatDate = (value?: string | null) => {
  if (!value) return "Not estimated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not estimated";

  return date.toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getStatusStyles = (status: AllowancePlan["status"]) => {
  if (status === "critical") {
    return {
      label: "Critical",
      badge: "bg-destructive/10 text-destructive hover:bg-destructive/20",
      progress: "[&>div]:bg-destructive",
      border: "border-destructive/40",
    };
  }

  if (status === "warning") {
    return {
      label: "Warning",
      badge: "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20",
      progress: "[&>div]:bg-amber-500",
      border: "border-amber-500/40",
    };
  }

  if (status === "moderate") {
    return {
      label: "Moderate",
      badge: "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20",
      progress: "[&>div]:bg-blue-500",
      border: "border-blue-500/30",
    };
  }

  return {
    label: "Safe",
    badge: "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20",
    progress: "[&>div]:bg-emerald-500",
    border: "border-emerald-500/30",
  };
};

const getPrimaryPlan = (plans: AllowancePlan[]) =>
  [...plans].sort((a, b) => {
    const aActive = new Date(a.expected_end_date).getTime() >= Date.now();
    const bActive = new Date(b.expected_end_date).getTime() >= Date.now();
    if (aActive !== bActive) return aActive ? -1 : 1;
    return new Date(b.received_date).getTime() - new Date(a.received_date).getTime();
  })[0] ?? null;

const getCategoryIcon = (categoryId: string) => {
  if (categoryId === "food") return Utensils;
  if (categoryId === "transport") return Bus;
  return Smartphone;
};

function DatePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : "Select date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={(date) => onChange(date ?? null)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function PlanDialog({
  open,
  form,
  isSaving,
  onOpenChange,
  onFormChange,
  onSubmit,
}: {
  open: boolean;
  form: AllowanceFormState;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onFormChange: (form: AllowanceFormState) => void;
  onSubmit: () => void;
}) {
  const isValid =
    Number(form.amount) > 0 &&
    Boolean(form.receivedDate) &&
    Boolean(form.expectedEndDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>{form.id ? "Edit Allowance Plan" : "Create Allowance Plan"}</DialogTitle>
          <DialogDescription>
            Plan how long an allowance should last and track whether spending is too fast.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="allowanceName">Plan Name</Label>
            <Input
              id="allowanceName"
              placeholder="e.g., May allowance"
              value={form.name}
              onChange={(event) => onFormChange({ ...form, name: event.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="allowanceAmount">Allowance Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {"\u20a6"}
              </span>
              <Input
                id="allowanceAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="50000"
                className="pl-7"
                value={form.amount}
                onChange={(event) => onFormChange({ ...form, amount: event.target.value })}
              />
            </div>
          </div>

          <DatePicker
            label="Date Received"
            value={form.receivedDate}
            onChange={(date) => onFormChange({ ...form, receivedDate: date })}
          />

          <DatePicker
            label="Expected To Last Until"
            value={form.expectedEndDate}
            onChange={(date) => onFormChange({ ...form, expectedEndDate: date })}
          />

          <div className="grid gap-2">
            <Label htmlFor="allowanceNotes">Notes</Label>
            <Input
              id="allowanceNotes"
              placeholder="e.g., From parents, includes feeding and transport"
              value={form.notes}
              onChange={(event) => onFormChange({ ...form, notes: event.target.value })}
            />
          </div>
        </div>

        <DialogFooter className="sm:[&>button]:w-auto [&>button]:w-full">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!isValid || isSaving}>
            {isSaving ? "Saving..." : form.id ? "Update Plan" : "Create Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AllowancePlanCard({
  plan,
  onEdit,
  onDelete,
}: {
  plan: AllowancePlan;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const status = getStatusStyles(plan.status);
  const progress = plan.amount > 0 ? Math.min((plan.spent / plan.amount) * 100, 100) : 0;

  return (
    <Card className={cn("transition-shadow hover:shadow-md", status.border)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-semibold">{plan.name}</p>
              <Badge variant="secondary" className={status.badge}>
                {status.label}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDate(plan.received_date)} to {formatDate(plan.expected_end_date)}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Open allowance actions">
                <WalletCards className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-2xl font-bold tracking-tight">
                {formatCurrency(plan.amount_left)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(plan.spent)} spent of {formatCurrency(plan.amount)}
              </p>
            </div>
            <p className="text-right text-sm font-medium text-muted-foreground">
              {plan.estimated_days_left === null
                ? "No runout estimate yet"
                : `${plan.estimated_days_left} days left`}
            </p>
          </div>
          <Progress value={progress} className={cn("h-2", status.progress)} />
        </div>

        <div className="mt-4 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
          {plan.status_message}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AllowancePage() {
  const [plans, setPlans] = useState<AllowancePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<AllowanceFormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [reloadTick, setReloadTick] = useState(0);
  const [affordabilityCategories, setAffordabilityCategories] = useState<
    AffordabilityCategory[]
  >(defaultAffordabilityCategories);

  useEffect(() => {
    let active = true;

    const loadPlans = async () => {
      try {
        setHasError(false);
        setIsLoading(true);
        const response = await api.get<{ plans: AllowancePlan[]; data?: AllowancePlan[] }>(
          "/allowance-plans",
        );

        if (!active) return;

        setPlans(response.plans ?? response.data ?? []);
        setHasLoadedOnce(true);
      } catch (error) {
        if (!active) return;
        console.error(error);
        setHasError(true);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadPlans();

    return () => {
      active = false;
    };
  }, [reloadTick]);

  const primaryPlan = getPrimaryPlan(plans);

  const openCreateDialog = () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 29);
    setForm({ ...emptyForm, expectedEndDate: endDate });
    setDialogOpen(true);
  };

  const openEditDialog = (plan: AllowancePlan) => {
    setForm({
      id: plan.id,
      name: plan.name,
      amount: String(plan.amount),
      receivedDate: new Date(plan.received_date),
      expectedEndDate: new Date(plan.expected_end_date),
      notes: plan.notes ?? "",
    });
    setDialogOpen(true);
  };

  const savePlan = async () => {
    if (!form.receivedDate || !form.expectedEndDate || Number(form.amount) <= 0) return;

    try {
      setIsSaving(true);
      const payload = {
        name: form.name.trim() || "Allowance Plan",
        amount: Number(form.amount),
        received_date: form.receivedDate.toISOString(),
        expected_end_date: form.expectedEndDate.toISOString(),
        notes: form.notes.trim() || null,
      };

      if (form.id) {
        await api.patch(`/allowance-plans/${form.id}`, payload);
      } else {
        await api.post("/allowance-plans", payload);
      }

      setDialogOpen(false);
      setForm(emptyForm);
      setReloadTick((value) => value + 1);
    } finally {
      setIsSaving(false);
    }
  };

  const deletePlan = async (plan: AllowancePlan) => {
    if (!window.confirm(`Delete ${plan.name}? This cannot be undone.`)) return;

    await api.delete(`/allowance-plans/${plan.id}`);
    setPlans((items) => items.filter((item) => item.id !== plan.id));
  };

  if (isLoading && !hasLoadedOnce) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-8 w-44 rounded-md bg-muted" />
            <div className="mt-2 h-4 w-80 rounded-md bg-muted" />
          </div>
          <div className="h-10 w-40 rounded-md bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton count={4} variant="stat" />
        </div>
        <CardSkeleton count={2} />
      </div>
    );
  }

  if (hasError) {
    return (
      <ErrorState
        title="Failed to load allowance plans"
        description="We couldn't load your allowance plans. Please try again."
        onRetry={() => {
          setHasError(false);
          setReloadTick((value) => value + 1);
        }}
      />
    );
  }

  if (!primaryPlan) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Allowance Plan</h1>
          <p className="text-muted-foreground">
            Plan student allowance spending and estimate whether your money will last.
          </p>
        </div>
        <EmptyState
          icon={WalletCards}
          title="No allowance plan yet"
          description="Create a plan such as ₦50,000 for 30 days to calculate safe daily spending and runout risk."
          action={{ label: "Create Allowance Plan", onClick: openCreateDialog }}
        />
        <PlanDialog
          open={dialogOpen}
          form={form}
          isSaving={isSaving}
          onOpenChange={setDialogOpen}
          onFormChange={setForm}
          onSubmit={savePlan}
        />
      </div>
    );
  }

  const status = getStatusStyles(primaryPlan.status);
  const spentPercent =
    primaryPlan.amount > 0 ? Math.min(Math.round((primaryPlan.spent / primaryPlan.amount) * 100), 100) : 0;
  const enabledAffordabilityCategories = affordabilityCategories.filter(
    (category) => category.enabled,
  );
  const totalAllocationRate = enabledAffordabilityCategories.reduce(
    (sum, category) => sum + category.rate,
    0,
  );
  const hasAllocationGap = Math.round(totalAllocationRate) !== 100;
  const allocationProgress = Math.min(totalAllocationRate, 100);

  const updateAffordabilityCategory = (
    id: string,
    updates: Partial<AffordabilityCategory>,
  ) => {
    setAffordabilityCategories((items) =>
      items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Allowance Plan</h1>
          <p className="text-muted-foreground">
            Track whether your student allowance can survive until the next expected support.
          </p>
        </div>
        <Button className="w-full gap-2 sm:w-auto" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          New Plan
        </Button>
      </div>

      <Card className={status.border}>
        <CardContent className="p-5">
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className={status.badge}>
                  {status.label}
                </Badge>
                <Badge variant="outline">{primaryPlan.duration_days} day plan</Badge>
              </div>
              <p className="text-2xl font-bold tracking-tight">{primaryPlan.name}</p>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {primaryPlan.status_message}
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{spentPercent}% used</span>
                  <span>{formatCurrency(primaryPlan.amount_left)} left</span>
                </div>
                <Progress value={spentPercent} className={cn("h-2", status.progress)} />
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                At your current spending rate
              </p>
              <p className="mt-2 text-xl font-bold">
                {primaryPlan.estimated_days_left === null
                  ? "No runout estimate yet"
                  : `${primaryPlan.estimated_days_left} days left`}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Estimated runout date: {formatDate(primaryPlan.estimated_runout_date)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Safe Daily Limit"
          value={primaryPlan.safe_daily_limit}
          change="Original allowance pace"
          icon={Target}
          iconColor="bg-primary/10 text-primary"
          isCurrency
        />
        <StatCard
          title="Spend Per Day Now"
          value={primaryPlan.average_daily_expense}
          change={
            primaryPlan.daily_overspend > 0
              ? `${formatCurrency(primaryPlan.daily_overspend)} over safe pace`
              : "Within safe pace"
          }
          trend={primaryPlan.daily_overspend > 0 ? "down" : "up"}
          icon={ShieldAlert}
          iconColor="bg-amber-500/10 text-amber-600"
          isCurrency
        />
        <StatCard
          title="Amount Left"
          value={primaryPlan.amount_left}
          change={`${primaryPlan.days_remaining} days remaining`}
          trend={primaryPlan.amount_left > 0 ? "up" : "down"}
          icon={WalletCards}
          iconColor="bg-success/10 text-success"
          isCurrency
        />
        <StatCard
          title="Daily From Balance"
          value={primaryPlan.safe_daily_remaining}
          change="What you can still spend per day"
          icon={CalendarClock}
          iconColor="bg-blue-500/10 text-blue-700"
          isCurrency
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Allowance History</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {plans.map((plan) => (
              <AllowancePlanCard
                key={plan.id}
                plan={plan}
                onEdit={() => openEditDialog(plan)}
                onDelete={() => deletePlan(plan)}
              />
            ))}
          </div>
        </div>

        <Card className="h-fit overflow-hidden">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg">What Can I Still Afford?</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Adjust your daily split for the remaining allowance.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                aria-label="Reset affordability allocation"
                onClick={() => setAffordabilityCategories(defaultAffordabilityCategories)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Daily spending guide
              </p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <p className="text-2xl font-bold tracking-tight">
                  {formatCurrency(primaryPlan.safe_daily_remaining)}
                </p>
                <Badge
                  variant="secondary"
                  className={cn(
                    hasAllocationGap
                      ? "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20",
                  )}
                >
                  {Math.round(totalAllocationRate)}% allocated
                </Badge>
              </div>
              <Progress
                value={allocationProgress}
                className={cn(
                  "mt-3 h-2",
                  hasAllocationGap ? "[&>div]:bg-amber-500" : "[&>div]:bg-emerald-500",
                )}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {hasAllocationGap
                  ? "Enable categories and adjust rates until the total is 100%."
                  : "Your enabled categories fully split today’s safe amount."}
              </p>
            </div>

            <div className="space-y-2">
              {affordabilityCategories.map((category) => {
                const Icon = getCategoryIcon(category.id);
                const amount =
                  category.enabled && totalAllocationRate > 0
                    ? primaryPlan.safe_daily_remaining * (category.rate / 100)
                    : 0;

                return (
                  <div
                    key={category.id}
                    className={cn(
                      "rounded-lg border p-3 transition-colors",
                      category.enabled ? "bg-background" : "bg-muted/25 text-muted-foreground",
                    )}
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Checkbox
                          checked={category.enabled}
                          onCheckedChange={(checked) =>
                            updateAffordabilityCategory(category.id, {
                              enabled: checked === true,
                            })
                          }
                          aria-label={`Include ${category.label}`}
                        />
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                            category.enabled
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="truncate text-sm font-medium">
                              {category.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {category.enabled ? formatCurrency(amount) : "Excluded"} per day
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={category.rate}
                          disabled={!category.enabled}
                          onChange={(event) =>
                            updateAffordabilityCategory(category.id, {
                              rate: Math.max(
                                0,
                                Math.min(Number(event.target.value || 0), 100),
                              ),
                            })
                          }
                          className="h-8 w-16 text-right"
                          aria-label={`${category.label} allocation percentage`}
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <PlanDialog
        open={dialogOpen}
        form={form}
        isSaving={isSaving}
        onOpenChange={setDialogOpen}
        onFormChange={setForm}
        onSubmit={savePlan}
      />
    </div>
  );
}

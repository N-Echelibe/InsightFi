"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Plus,
  Plane,
  Home,
  GraduationCap,
  Car,
  Gift,
  Shield,
  Sparkles,
  Bell,
  ArrowRightLeft,
  CalendarIcon,
  Edit,
  MoreHorizontal,
  Trash2,
  HandCoins,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { LucideIcon } from "lucide-react";
import { format } from "date-fns";

type SavingsBucket = {
  id: string | number;
  name: string;
  current: number;
  target: number;
  deadline: string;
  icon: LucideIcon;
  color: string;
  autoSave: {
    enabled: boolean;
    amount: number;
    frequency: string;
    accountId?: string | null;
    lastRunAt?: string | null;
  };
  alerts: boolean;
};

type Account = {
  id: string;
  name: string;
  type?: string;
  currency?: string;
  balance: number;
};

type AutoSaveFrequency = "daily" | "weekly" | "monthly";

const formatCurrency = (value: number) =>
  `${"\u20a6"}${value.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const parseTargetDate = (value: string) => {
  if (!value || value === "Ongoing") return null;
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return null;

  return parsed;
};

const normalizeAutoSave = (
  bucket: any,
  fallback: {
    enabled: boolean;
    amount: number;
    frequency: string;
    accountId?: string | null;
  } = { enabled: false, amount: 0, frequency: "monthly", accountId: null }
) => ({
  enabled: Boolean(
    bucket.autoSave?.enabled ??
      bucket.auto_save_enabled ??
      bucket.autosave_enabled ??
      fallback.enabled
  ),
  amount: Number(
    bucket.autoSave?.amount ??
      bucket.auto_save_amount ??
      bucket.autosave_amount ??
      fallback.amount
  ),
  frequency: String(
    bucket.autoSave?.frequency ??
      bucket.auto_save_frequency ??
      bucket.autosave_frequency ??
      fallback.frequency
  ),
  lastRunAt:
    bucket.autoSave?.lastRunAt ??
    bucket.last_auto_save_at ??
    bucket.lastAutoSaveAt ??
    null,
  accountId:
    bucket.autoSave?.accountId ??
    bucket.auto_save_account_id ??
    bucket.autoSaveAccountId ??
    fallback.accountId ??
    null,
});

const getMonthlyAutoSaveAmount = (bucket: SavingsBucket) => {
  if (!bucket.autoSave.enabled) return 0;
  if (bucket.autoSave.frequency === "daily") {
    return bucket.autoSave.amount * 30;
  }

  if (bucket.autoSave.frequency === "weekly") {
    return bucket.autoSave.amount * 4;
  }

  return bucket.autoSave.amount;
};

const getAutoSaveFrequencyLabel = (frequency: string) => {
  if (frequency === "daily") return "day";
  if (frequency === "weekly") return "week";
  if (frequency === "yearly") return "year";
  return "month";
};

const calculateAutoSavePlan = ({
  targetAmount,
  currentAmount,
  targetDate,
  frequency,
}: {
  targetAmount: number;
  currentAmount: number;
  targetDate: Date | null;
  frequency: AutoSaveFrequency;
}) => {
  const remainingAmount = Math.max(targetAmount - currentAmount, 0);

  if (!targetDate || targetAmount <= 0) {
    return {
      amount: 0,
      periods: 0,
      remainingAmount,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const normalizedTargetDate = new Date(targetDate);
  normalizedTargetDate.setHours(0, 0, 0, 0);

  const dayMs = 24 * 60 * 60 * 1000;
  const daysRemaining = Math.max(
    0,
    Math.ceil((normalizedTargetDate.getTime() - today.getTime()) / dayMs)
  );
  const periods =
    frequency === "daily"
      ? Math.max(1, daysRemaining)
      : frequency === "weekly"
      ? Math.max(1, Math.ceil(daysRemaining / 7))
      : Math.max(1, Math.ceil(daysRemaining / 30));

  return {
    amount: Math.ceil(remainingAmount / periods),
    periods,
    remainingAmount,
  };
};

function SavingsBucketsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-5">
              <div className="h-4 w-28 rounded-md bg-muted" />
              <div className="mt-3 h-8 w-32 rounded-md bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="h-10 w-full rounded-md bg-muted sm:w-28" />
        <div className="h-10 w-full rounded-md bg-muted sm:w-28" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted" />
                  <div>
                    <div className="h-4 w-32 rounded-md bg-muted" />
                    <div className="mt-2 h-4 w-24 rounded-md bg-muted" />
                  </div>
                </div>
                <div className="h-8 w-8 rounded-md bg-muted" />
              </div>
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="h-8 w-28 rounded-md bg-muted" />
                  <div className="h-4 w-24 rounded-md bg-muted" />
                </div>
                <div className="h-2 w-full rounded-full bg-muted" />
                <div className="ml-auto h-3 w-20 rounded-md bg-muted" />
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <div className="h-6 w-28 rounded-full bg-muted" />
                <div className="h-4 w-4 rounded-full bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function SavingsBuckets() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<SavingsBucket | null>(null);
  const [savingsBuckets, setSavingsBuckets] = useState<SavingsBucket[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newBucketName, setNewBucketName] = useState("");
  const [newBucketTarget, setNewBucketTarget] = useState("");
  const [newBucketDate, setNewBucketDate] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [autoSaveFrequency, setAutoSaveFrequency] =
    useState<AutoSaveFrequency>("monthly");
  const [autoSaveAccountId, setAutoSaveAccountId] = useState("");
  const [transferFrom, setTransferFrom] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [allocationBucketId, setAllocationBucketId] = useState("");
  const [allocationAccountId, setAllocationAccountId] = useState("");
  const [allocationAmount, setAllocationAmount] = useState("");

  const resetBucketForm = () => {
    setSelectedBucket(null);
    setNewBucketName("");
    setNewBucketTarget("");
    setNewBucketDate(null);
    setAutoSaveEnabled(false);
    setAutoSaveFrequency("monthly");
    setAutoSaveAccountId("");
  };

  useEffect(() => {
    const iconMap = {
      car: Car,
      gift: Gift,
      graduation: GraduationCap,
      home: Home,
      plane: Plane,
      shield: Shield,
      target: Shield,
    };

    Promise.all([
      api.get<{ buckets: any[] }>("/savings-buckets"),
      api.get<{ accounts: Account[]; data?: Account[] }>("/accounts"),
    ])
      .then(([bucketResponse, accountResponse]) => {
        setSavingsBuckets(
          bucketResponse.buckets.map((bucket) => ({
            id: bucket.id,
            name: bucket.name,
            current: Number(bucket.current ?? bucket.current_amount ?? 0),
            target: Number(bucket.target ?? bucket.target_amount ?? 0),
            deadline: bucket.deadline ?? bucket.target_date ?? "Ongoing",
            icon: iconMap[bucket.icon as keyof typeof iconMap] ?? Shield,
            color: bucket.color ?? "bg-primary/10 text-primary",
            autoSave: normalizeAutoSave(bucket),
            alerts: Boolean(bucket.alerts),
          })),
        );
        setAccounts(
          (accountResponse.accounts ?? accountResponse.data ?? []).map((account) => ({
            ...account,
            balance: Number(account.balance ?? 0),
          })),
        );
      })
      .catch((error) => console.error(error))
      .finally(() => setIsLoading(false));
  }, []);

  const openCreateDialog = () => {
    resetBucketForm();
    setDialogOpen(true);
  };

  const openEditDialog = (bucket: SavingsBucket) => {
    setSelectedBucket(bucket);
    setNewBucketName(bucket.name);
    setNewBucketTarget(String(bucket.target));
    setNewBucketDate(parseTargetDate(bucket.deadline));
    setAutoSaveEnabled(bucket.autoSave.enabled);
    setAutoSaveFrequency(
      bucket.autoSave.frequency === "daily" ||
        bucket.autoSave.frequency === "weekly"
        ? bucket.autoSave.frequency
        : "monthly"
    );
    setAutoSaveAccountId(bucket.autoSave.accountId ?? "");
    setDialogOpen(true);
  };

  const openTransferDialog = (bucket?: SavingsBucket) => {
    setTransferFrom(bucket ? String(bucket.id) : "");
    setTransferTo("");
    setTransferAmount("");
    setTransferDialogOpen(true);
  };

  const openAllocateDialog = (bucket?: SavingsBucket) => {
    setAllocationBucketId(bucket ? String(bucket.id) : "");
    setAllocationAccountId("");
    setAllocationAmount("");
    setAllocateDialogOpen(true);
  };

  const saveBucket = async () => {
    if (!newBucketName.trim() || !newBucketTarget) return;
    if (autoSaveEnabled && (!newBucketDate || !autoSaveAccountId)) return;

    const autoSavePlan = calculateAutoSavePlan({
      targetAmount: Number(newBucketTarget),
      currentAmount: selectedBucket?.current ?? 0,
      targetDate: newBucketDate,
      frequency: autoSaveFrequency,
    });

    const payload = {
      name: newBucketName.trim(),
      target_amount: Number(newBucketTarget),
      target_date: newBucketDate ? newBucketDate.toISOString() : null,
      auto_save_enabled: autoSaveEnabled,
      auto_save_amount: autoSaveEnabled ? autoSavePlan.amount : 0,
      auto_save_frequency: autoSaveFrequency,
      auto_save_account_id: autoSaveEnabled ? autoSaveAccountId : null,
      autoSave: {
        enabled: autoSaveEnabled,
        amount: autoSaveEnabled ? autoSavePlan.amount : 0,
        frequency: autoSaveFrequency,
        accountId: autoSaveEnabled ? autoSaveAccountId : null,
      },
    };

    if (selectedBucket) {
      const response = await api.patch<{ bucket?: any }>(
        `/savings-buckets/${selectedBucket.id}`,
        payload
      );
      const updated = response.bucket;

      setSavingsBuckets((items) =>
        items.map((bucket) =>
          bucket.id === selectedBucket.id
            ? {
                ...bucket,
                name: updated?.name ?? payload.name,
                target: Number(
                  updated?.target ?? updated?.target_amount ?? payload.target_amount
                ),
                deadline:
                  updated?.deadline ??
                  updated?.target_date ??
                  payload.target_date ??
                  "Ongoing",
                autoSave: updated
                  ? normalizeAutoSave(updated, payload.autoSave)
                  : payload.autoSave,
              }
            : bucket
        )
      );
      setDialogOpen(false);
      resetBucketForm();
      return;
    }

    const response = await api.post<{ bucket: any }>("/savings-buckets", payload);

    setSavingsBuckets((items) => [
      {
        id: response.bucket.id,
        name: response.bucket.name,
        current: Number(response.bucket.current ?? response.bucket.current_amount ?? 0),
        target: Number(response.bucket.target ?? response.bucket.target_amount ?? 0),
        deadline: response.bucket.deadline ?? response.bucket.target_date ?? "Ongoing",
        icon: Shield,
        color: response.bucket.color ?? "bg-primary/10 text-primary",
        autoSave: normalizeAutoSave(response.bucket, payload.autoSave),
        alerts: Boolean(response.bucket.alert ?? response.bucket.alerts),
      },
      ...items,
    ]);
    setDialogOpen(false);
    resetBucketForm();
  };

  const transferBetweenBuckets = async () => {
    if (!transferFrom || !transferTo || !transferAmount) return;

    const response = await api.post<{ from: any; to: any }>("/savings-buckets/transfer", {
      from_bucket_id: transferFrom,
      to_bucket_id: transferTo,
      amount: Number(transferAmount),
    });

    setSavingsBuckets((items) =>
      items.map((bucket) => {
        if (bucket.id === response.from.id) {
          return { ...bucket, current: Number(response.from.current) };
        }
        if (bucket.id === response.to.id) {
          return { ...bucket, current: Number(response.to.current) };
        }
        return bucket;
      }),
    );
    setTransferDialogOpen(false);
    setTransferFrom("");
    setTransferTo("");
    setTransferAmount("");
  };

  const allocateFundsToBucket = async () => {
    if (!allocationBucketId || !allocationAccountId || !allocationAmount) return;

    const bucket = savingsBuckets.find(
      (item) => String(item.id) === allocationBucketId
    );
    const account = accounts.find((item) => item.id === allocationAccountId);
    const amount = Number(allocationAmount);

    if (!bucket || !account || !Number.isFinite(amount) || amount <= 0) return;

    if (bucket.current >= bucket.target) return;

    const allocation = Math.min(amount, bucket.target - bucket.current);
    if (account.balance < allocation) return;

    const response = await api.post<{ bucket?: any }>(
      `/savings-buckets/${bucket.id}/allocate`,
      {
        amount,
        account_id: allocationAccountId,
      }
    );
    const updated = response.bucket;
    const updatedAccount = (response as { account?: Account }).account;

    setSavingsBuckets((items) =>
      items.map((item) =>
        item.id === bucket.id
          ? {
              ...item,
              current: Number(
                updated?.current ??
                  updated?.current_amount ??
                  Math.min(bucket.current + amount, bucket.target)
              ),
            }
          : item
      )
    );
    setAccounts((items) =>
      items.map((item) =>
        item.id === allocationAccountId
          ? {
              ...item,
              balance: Number(
                updatedAccount?.balance ?? item.balance - allocation
              ),
            }
          : item
      )
    );
    setAllocateDialogOpen(false);
    setAllocationBucketId("");
    setAllocationAccountId("");
    setAllocationAmount("");
  };

  const toggleBucketAlerts = async (bucket: SavingsBucket) => {
    const nextAlerts = !bucket.alerts;

    setSavingsBuckets((items) =>
      items.map((item) =>
        item.id === bucket.id ? { ...item, alerts: nextAlerts } : item
      )
    );

    try {
      await api.patch(`/savings-buckets/${bucket.id}`, {
        alert: nextAlerts,
        alerts: nextAlerts,
      });
    } catch (error) {
      console.error(error);
      setSavingsBuckets((items) =>
        items.map((item) =>
          item.id === bucket.id ? { ...item, alerts: bucket.alerts } : item
        )
      );
    }
  };

  const deleteBucket = async (bucket: SavingsBucket) => {
    if (!window.confirm(`Delete ${bucket.name}? This cannot be undone.`)) return;

    await api.delete(`/savings-buckets/${bucket.id}`);
    setSavingsBuckets((items) => items.filter((item) => item.id !== bucket.id));
  };

  const totalSaved = savingsBuckets.reduce((sum, b) => sum + b.current, 0);
  const totalTarget = savingsBuckets.reduce((sum, b) => sum + b.target, 0);
  const autoSavePlan = calculateAutoSavePlan({
    targetAmount: Number(newBucketTarget || 0),
    currentAmount: selectedBucket?.current ?? 0,
    targetDate: newBucketDate,
    frequency: autoSaveFrequency,
  });
  const selectedAutoSaveAccount = accounts.find(
    (account) => account.id === autoSaveAccountId
  );
  const selectedAllocationBucket = savingsBuckets.find(
    (item) => String(item.id) === allocationBucketId
  );
  const selectedAllocationAccount = accounts.find(
    (item) => item.id === allocationAccountId
  );
  const allocationInputAmount = Number(allocationAmount || 0);
  const allocationAppliedAmount = selectedAllocationBucket
    ? Math.min(
        Math.max(allocationInputAmount, 0),
        Math.max(selectedAllocationBucket.target - selectedAllocationBucket.current, 0)
      )
    : 0;
  const hasInsufficientAllocationFunds =
    Boolean(selectedAllocationAccount) &&
    allocationAppliedAmount > 0 &&
    Number(selectedAllocationAccount?.balance ?? 0) < allocationAppliedAmount;
  const canAllocateFunds =
    Boolean(selectedAllocationBucket) &&
    Boolean(selectedAllocationAccount) &&
    allocationAppliedAmount > 0 &&
    !hasInsufficientAllocationFunds;
  const canSaveBucket =
    Boolean(newBucketName.trim()) &&
    Boolean(newBucketTarget) &&
    (!autoSaveEnabled || (Boolean(newBucketDate) && Boolean(autoSaveAccountId)));

  if (isLoading) {
    return <SavingsBucketsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">
              Total Saved
            </p>
            <p className="text-2xl font-bold">
              {formatCurrency(totalSaved)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">
              Total Target
            </p>
            <p className="text-2xl font-bold">
              {formatCurrency(totalTarget)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">
              Est. Monthly Auto-Save
            </p>
            <p className="text-2xl font-bold">
              {formatCurrency(
                savingsBuckets
                  .filter((b) => b.autoSave.enabled)
                  .reduce((sum, b) => sum + getMonthlyAutoSaveAmount(b), 0)
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button className="gap-2" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
        <Button
          variant="outline"
          className="gap-2 bg-transparent"
          onClick={() => openAllocateDialog()}
          disabled={savingsBuckets.length === 0 || accounts.length === 0}
        >
          <HandCoins className="h-4 w-4" />
          Add Funds
        </Button>
        <Button
          variant="outline"
          className="gap-2 bg-transparent"
          onClick={() => openTransferDialog()}
        >
          <ArrowRightLeft className="h-4 w-4" />
          Transfer
        </Button>
      </div>

      {/* Buckets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savingsBuckets.map((bucket) => {
          const percentage =
            bucket.target > 0
              ? Math.round((bucket.current / bucket.target) * 100)
              : 0;
          const autoSaveAccount = accounts.find(
            (account) => account.id === bucket.autoSave.accountId
          );

          return (
            <Card key={bucket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2.5 rounded-lg", bucket.color)}>
                      <bucket.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{bucket.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Target: {bucket.deadline}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(bucket)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openAllocateDialog(bucket)}
                        disabled={accounts.length === 0}
                      >
                        <HandCoins className="h-4 w-4 mr-2" />
                        Add Funds
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openTransferDialog(bucket)}>
                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                        Transfer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleBucketAlerts(bucket)}>
                        <Bell className="h-4 w-4 mr-2" />
                        {bucket.alerts ? "Disable Alerts" : "Enable Alerts"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => deleteBucket(bucket)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {formatCurrency(bucket.current)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      of {formatCurrency(bucket.target)}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">
                    {percentage}% complete
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    {bucket.autoSave.enabled ? (
                      <>
                        <Badge
                          variant="secondary"
                          className="gap-1 bg-primary/10 text-primary"
                        >
                          <Sparkles className="h-3 w-3" />
                          Auto-Save
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {`${formatCurrency(bucket.autoSave.amount)}/${
                            getAutoSaveFrequencyLabel(bucket.autoSave.frequency)
                          }`}
                          {autoSaveAccount ? ` from ${autoSaveAccount.name}` : ""}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Manual savings
                      </span>
                    )}
                  </div>
                  {bucket.alerts && (
                    <Bell className="h-4 w-4 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Bucket Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetBucketForm();
        }}
      >
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedBucket ? "Edit Savings Goal" : "Create Savings Goal"}
            </DialogTitle>
            <DialogDescription>
              {selectedBucket
                ? "Update your savings goal details."
                : "Set up a new savings goal with optional auto-save."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Goal Name</Label>
              <Input
                placeholder="e.g., Vacation Fund"
                value={newBucketName}
                onChange={(event) => setNewBucketName(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Target Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {"\u20a6"}
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="pl-7"
                  value={newBucketTarget}
                  onChange={(event) => setNewBucketTarget(event.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Target Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !newBucketDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newBucketDate ? format(newBucketDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newBucketDate || undefined}
                    onSelect={(selected) => setNewBucketDate(selected ?? null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Auto-Save</Label>
                <p className="text-xs text-muted-foreground">
                  {accounts.length > 0
                    ? "Automatically move money from an account into this goal."
                    : "Add an account before enabling auto-save."}
                </p>
              </div>
              <Switch
                checked={autoSaveEnabled}
                onCheckedChange={setAutoSaveEnabled}
                disabled={accounts.length === 0}
              />
            </div>

            {autoSaveEnabled && (
              <div className="space-y-4 rounded-lg border bg-muted/20 p-3">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2 sm:col-span-2">
                    <Label>From Account</Label>
                    <Select
                      value={autoSaveAccountId}
                      onValueChange={setAutoSaveAccountId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} ({formatCurrency(account.balance)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Calculated Save Amount</Label>
                    <div className="flex h-10 items-center rounded-md border bg-background px-3 text-sm font-medium">
                      {autoSavePlan.amount > 0
                        ? formatCurrency(autoSavePlan.amount)
                        : formatCurrency(0)}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Frequency</Label>
                    <Select
                      value={autoSaveFrequency}
                      onValueChange={(value) =>
                        setAutoSaveFrequency(value as AutoSaveFrequency)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-md bg-background p-3 text-sm">
                  <p className="font-medium">Auto-save preview</p>
                  <p className="mt-1 text-muted-foreground">
                    {!newBucketTarget
                      ? "Enter a target amount to calculate your auto-save plan."
                      : !autoSaveAccountId
                        ? "Select the account that will fund this goal."
                      : !newBucketDate
                        ? "Select a target date to calculate your auto-save amount."
                        : autoSavePlan.remainingAmount <= 0
                          ? "This goal is already fully funded."
                          : `${formatCurrency(
                              autoSavePlan.amount
                            )} every ${
                              getAutoSaveFrequencyLabel(autoSaveFrequency)
                            } from ${
                              selectedAutoSaveAccount?.name ?? "the selected account"
                            } for ${autoSavePlan.periods} ${
                              autoSavePlan.periods === 1 ? "period" : "periods"
                            } to cover ${formatCurrency(
                              autoSavePlan.remainingAmount
                            )}.`}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="sm:[&>button]:w-auto [&>button]:w-full">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                resetBucketForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveBucket} disabled={!canSaveBucket}>
              {selectedBucket ? "Update Goal" : "Create Goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Funds Dialog */}
      <Dialog
        open={allocateDialogOpen}
        onOpenChange={(open) => {
          setAllocateDialogOpen(open);
          if (!open) {
            setAllocationBucketId("");
            setAllocationAccountId("");
            setAllocationAmount("");
          }
        }}
      >
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Funds to Goal</DialogTitle>
            <DialogDescription>
              Manually allocate money you have saved toward a specific goal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Goal</Label>
              <Select
                value={allocationBucketId}
                onValueChange={setAllocationBucketId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  {savingsBuckets.map((bucket) => (
                    <SelectItem key={bucket.id} value={String(bucket.id)}>
                      {bucket.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>From Account</Label>
              <Select
                value={allocationAccountId}
                onValueChange={setAllocationAccountId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({formatCurrency(account.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {"\u20a6"}
                </span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-7"
                  value={allocationAmount}
                  onChange={(event) => setAllocationAmount(event.target.value)}
                />
              </div>
            </div>
            {selectedAllocationBucket && (
              <div className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                <p>
                  {selectedAllocationBucket.name} will move from{" "}
                  {formatCurrency(selectedAllocationBucket.current)} to{" "}
                  {formatCurrency(
                    selectedAllocationBucket.current + allocationAppliedAmount
                  )}{" "}
                  of {formatCurrency(selectedAllocationBucket.target)}.
                </p>
                {selectedAllocationAccount && allocationAppliedAmount > 0 && (
                  <p className="mt-1">
                    {selectedAllocationAccount.name} balance after allocation:{" "}
                    {formatCurrency(
                      selectedAllocationAccount.balance - allocationAppliedAmount
                    )}
                  </p>
                )}
                {hasInsufficientAllocationFunds && (
                  <p className="mt-1 text-destructive">
                    This account does not have enough available balance.
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="sm:[&>button]:w-auto [&>button]:w-full">
            <Button
              variant="outline"
              onClick={() => setAllocateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={allocateFundsToBucket} disabled={!canAllocateFunds}>
              Add Funds
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog
        open={transferDialogOpen}
        onOpenChange={(open) => {
          setTransferDialogOpen(open);
          if (!open) {
            setTransferFrom("");
            setTransferTo("");
            setTransferAmount("");
          }
        }}
      >
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transfer Between Goals</DialogTitle>
            <DialogDescription>
              Move funds between your savings goals.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>From</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={transferFrom}
                onChange={(event) => setTransferFrom(event.target.value)}
              >
                <option value="">Select goal</option>
                {savingsBuckets.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({formatCurrency(b.current)})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label>To</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={transferTo}
                onChange={(event) => setTransferTo(event.target.value)}
              >
                <option value="">Select goal</option>
                {savingsBuckets.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {"\u20a6"}
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="pl-7"
                  value={transferAmount}
                  onChange={(event) => setTransferAmount(event.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="sm:[&>button]:w-auto [&>button]:w-full">
            <Button
              variant="outline"
              onClick={() => setTransferDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={transferBetweenBuckets}>
              Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

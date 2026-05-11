"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Bell, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Budget {
  id: number | string;
  category_id?: string;
  category: string;
  spent: number;
  budget: number;
  alerts: boolean;
  type?: "daily" | "weekly" | "monthly" | "yearly" | "semester_1" | "semester_2" | "academic_period" | "onetime" | "custom";
  startDate?: Date;
  endDate?: Date;
  createdDate?: Date;
}

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: Budget | null;
  categories?: Array<{ id: string; name: string; type?: string }>;
  onSubmit?: (budget: {
    id?: number | string;
    category_id: string;
    amount: number;
    period: string;
    start_date?: string;
    end_date?: string;
    recurring: boolean;
    alert: boolean;
    alert_threshold: number;
  }) => Promise<void>;
}

export function BudgetDialog({
  open,
  onOpenChange,
  budget,
  categories = [],
  onSubmit,
}: BudgetDialogProps) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [alertEnabled, setAlertEnabled] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState([80]);
  const [budgetType, setBudgetType] = useState<
    "daily" | "weekly" | "monthly" | "yearly" | "semester_1" | "semester_2" | "academic_period" | "onetime" | "custom"
  >("monthly");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    if (budget) {
      setCategory(budget.category_id ?? budget.category);
      setAmount(budget.budget.toString());
      setAlertEnabled(budget.alerts);
      setBudgetType(budget.type || "monthly");
      setStartDate(budget.startDate || null);
      setEndDate(budget.endDate || null);
    } else {
      setCategory("");
      setAmount("");
      setAlertEnabled(true);
      setAlertThreshold([80]);
      setBudgetType("monthly");
      setStartDate(null);
      setEndDate(null);
    }
  }, [budget]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!category || !amount) return;

    const isCustomRange = ["onetime", "custom", "semester_1", "semester_2", "academic_period"].includes(budgetType);

    if (isCustomRange && (!startDate || !endDate)) return;

    try {
      setIsSaving(true);
      await onSubmit?.({
        id: budget?.id,
        category_id: category,
        amount: Number(amount),
        period: budgetType,
        start_date: isCustomRange && startDate ? startDate.toISOString() : undefined,
        end_date: isCustomRange && endDate ? endDate.toISOString() : undefined,
        recurring: ["daily", "weekly", "monthly", "yearly"].includes(budgetType),
        alert: alertEnabled,
        alert_threshold: alertThreshold[0],
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{budget ? "Edit Budget" : "Create Budget"}</DialogTitle>
          <DialogDescription>
            {budget
              ? "Update your budget settings."
              : "Set up a new budget category to track your spending."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter((item) => !item.type || item.type === "expense")
                  .map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Budget Type</Label>
            <Select value={budgetType} onValueChange={(value: any) => setBudgetType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Recurring</SelectItem>
                <SelectItem value="weekly">Weekly Recurring</SelectItem>
                <SelectItem value="monthly">Monthly Recurring</SelectItem>
                <SelectItem value="semester_1">First Semester</SelectItem>
                <SelectItem value="semester_2">Second Semester</SelectItem>
                <SelectItem value="academic_period">Custom Academic Period</SelectItem>
                <SelectItem value="yearly">Yearly Recurring</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
                <SelectItem value="onetime">One-Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">
              {budgetType === "daily" && "Daily Budget"}
              {budgetType === "weekly" && "Weekly Budget"}
              {budgetType === "monthly" && "Monthly Budget"}
              {budgetType === "semester_1" && "First Semester Budget"}
              {budgetType === "semester_2" && "Second Semester Budget"}
              {budgetType === "academic_period" && "Academic Period Budget"}
              {budgetType === "yearly" && "Yearly Budget"}
              {(budgetType === "onetime" || budgetType === "custom") && "Total Budget"}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₦
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>

          {["onetime", "custom", "semester_1", "semester_2", "academic_period"].includes(budgetType) && (
            <>
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate || undefined}
                      onSelect={(selected) => setStartDate(selected ?? null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate || undefined}
                      onSelect={(selected) => setEndDate(selected ?? null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="alerts">Budget Alerts</Label>
              </div>
              <Switch
                id="alerts"
                checked={alertEnabled}
                onCheckedChange={setAlertEnabled}
              />
            </div>

            {alertEnabled && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-muted-foreground">
                    Alert Threshold
                  </Label>
                  <span className="text-sm font-medium">{alertThreshold[0]}%</span>
                </div>
                <Slider
                  value={alertThreshold}
                  onValueChange={setAlertThreshold}
                  max={100}
                  min={50}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  {"You'll receive a notification when spending reaches"}{" "}
                  {alertThreshold[0]}% of budget.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="sm:[&>button]:w-auto [&>button]:w-full">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Saving..." : budget ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

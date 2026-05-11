"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Minus, Plus } from "lucide-react";
import { ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type DialogMode = "transaction" | "transfer";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Array<{ id: string | number; name: string; currency?: string }>;
  categories: Array<{ id: string; name: string; type?: string }>;
  defaultMode?: DialogMode;
  showModeToggle?: boolean;
  onSubmit: (transaction: {
    account_id: string;
    amount: number;
    fee_amount?: number;
    payment_method: string;
    type: "expense" | "income";
    category_id: string;
    description: string;
    date: string;
  }) => Promise<void>;
  onTransferSubmit?: (transfer: {
    from_account_id: string;
    to_account_id: string;
    amount: number;
    description: string;
    date: string;
  }) => Promise<void>;
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  accounts,
  categories,
  defaultMode = "transaction",
  showModeToggle = true,
  onSubmit,
  onTransferSubmit,
}: AddTransactionDialogProps) {
  const [mode, setMode] = useState<DialogMode>(defaultMode);
  const [type, setType] = useState<"expense" | "income">("expense");
  const [date, setDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [feeAmount, setFeeAmount] = useState("");
  const [transferFrom, setTransferFrom] = useState("");
  const [transferTo, setTransferTo] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const selectedTransferSource = useMemo(
    () => accounts.find((item) => String(item.id) === transferFrom),
    [accounts, transferFrom],
  );

  const transferToOptions = useMemo(
    () =>
      accounts.filter(
        (item) =>
          String(item.id) !== transferFrom &&
          (!selectedTransferSource ||
            (item.currency ?? "NGN") ===
              (selectedTransferSource.currency ?? "NGN")),
      ),
    [accounts, selectedTransferSource, transferFrom],
  );

  const resetFields = () => {
    setDate(new Date());
    setAmount("");
    setName("");
    setCategory("");
    setAccount("");
    setPaymentMethod("cash");
    setFeeAmount("");
    setTransferFrom("");
    setTransferTo("");
    setType("expense");
  };

  useEffect(() => {
    if (open) {
      setMode(defaultMode);
    }
  }, [defaultMode, open]);

  useEffect(() => {
    if (
      transferTo &&
      !transferToOptions.some((item) => String(item.id) === transferTo)
    ) {
      setTransferTo("");
    }
  }, [transferTo, transferToOptions]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetFields();
    }

    onOpenChange(nextOpen);
  };

  const handleSubmit = async () => {
    const parsedAmount = Number(amount);
    const parsedFeeAmount = Number(feeAmount || 0);

    if (
      Number.isNaN(parsedAmount) ||
      parsedAmount <= 0 ||
      Number.isNaN(parsedFeeAmount) ||
      parsedFeeAmount < 0 ||
      !name.trim()
    ) {
      return;
    }

    try {
      setIsSaving(true);
      if (mode === "transfer") {
        if (!onTransferSubmit || !transferFrom || !transferTo) {
          return;
        }

        await onTransferSubmit({
          from_account_id: transferFrom,
          to_account_id: transferTo,
          amount: parsedAmount,
          description: name.trim(),
          date: date.toISOString(),
        });
        handleOpenChange(false);
        resetFields();
        return;
      }

      if (!category || !account) {
        return;
      }

      await onSubmit({
        account_id: account,
        amount: parsedAmount,
        fee_amount: parsedFeeAmount,
        payment_method: paymentMethod,
        type,
        category_id: category,
        description: name.trim(),
        date: date.toISOString(),
      });
      handleOpenChange(false);
      resetFields();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "transfer" ? "Transfer Between Accounts" : "Add Transaction"}
          </DialogTitle>
          <DialogDescription>
            {mode === "transfer"
              ? "Move money from one account to another."
              : "Enter the details for your new transaction."}
          </DialogDescription>
        </DialogHeader>

        {onTransferSubmit && showModeToggle && (
          <Tabs value={mode} onValueChange={(v) => setMode(v as DialogMode)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transaction">Transaction</TabsTrigger>
              <TabsTrigger value="transfer" className="gap-2">
                <ArrowRightLeft className="h-4 w-4" />
                Transfer
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {mode === "transaction" && (
          <Tabs
            value={type}
            onValueChange={(v) => setType(v as "expense" | "income")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense" className="gap-2">
                <Minus className="h-4 w-4" />
                Expense
              </TabsTrigger>
              <TabsTrigger value="income" className="gap-2">
                <Plus className="h-4 w-4" />
                Income
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {"\u20a6"}
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

          <div className="grid gap-2">
            <Label htmlFor="name">Description</Label>
            <Input
              id="name"
              placeholder={
                mode === "transfer" ? "e.g., Savings transfer" : "e.g., Grocery shopping"
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {mode === "transaction" ? (
            <>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((item) => !item.type || item.type === type)
                      .map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Account</Label>
                <Select value={account} onValueChange={setAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="pos">POS</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="mobile_banking">Mobile Banking</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="feeAmount">Fees/Charges</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {"\u20a6"}
                  </span>
                  <Input
                    id="feeAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-2">
                <Label>From Account</Label>
                <Select value={transferFrom} onValueChange={setTransferFrom}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name} ({item.currency ?? "NGN"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>To Account</Label>
                <Select
                  value={transferTo}
                  onValueChange={setTransferTo}
                  disabled={!transferFrom}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {transferToOptions.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name} ({item.currency ?? "NGN"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="grid gap-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter className="sm:[&>button]:w-auto [&>button]:w-full">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving
              ? mode === "transfer"
                ? "Transferring..."
                : "Adding..."
              : mode === "transfer"
                ? "Transfer"
                : "Add Transaction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

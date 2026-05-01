"use client";

import { useState } from "react";
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
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTransactionDialog({
  open,
  onOpenChange,
}: AddTransactionDialogProps) {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [date, setDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("");

  const handleSubmit = () => {
    // In real implementation, save the transaction
    onOpenChange(false);
    // Reset form
    setAmount("");
    setName("");
    setCategory("");
    setAccount("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Enter the details for your new transaction.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={type} onValueChange={(v) => setType(v as "expense" | "income")}>
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

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
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
              placeholder="e.g., Grocery shopping"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {type === "expense" ? (
                  <>
                    <SelectItem value="food">Food & Dining</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="housing">Housing</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </>
                )}
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
                <SelectItem value="chase">Chase Checking</SelectItem>
                <SelectItem value="ally">Ally Savings</SelectItem>
                <SelectItem value="amex">Amex Platinum</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Transaction</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

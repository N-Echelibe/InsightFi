"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Coffee,
  ShoppingBag,
  Car,
  Wifi,
  Home,
  ArrowDownLeft,
  Edit,
  Trash2,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { useSearchParams } from "next/navigation";
import Loading from "./loading";

const transactions = [
  {
    id: 1,
    name: "Starbucks Coffee",
    category: "Food & Dining",
    account: "Chase Checking",
    amount: -5.75,
    date: "2024-01-21",
    status: "completed",
    icon: Coffee,
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    id: 2,
    name: "Salary Deposit",
    category: "Income",
    account: "Chase Checking",
    amount: 4500.0,
    date: "2024-01-20",
    status: "completed",
    icon: ArrowDownLeft,
    color: "bg-success/10 text-success",
  },
  {
    id: 3,
    name: "Amazon Purchase",
    category: "Shopping",
    account: "Amex Platinum",
    amount: -89.99,
    date: "2024-01-18",
    status: "completed",
    icon: ShoppingBag,
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    id: 4,
    name: "Uber Ride",
    category: "Transportation",
    account: "Chase Checking",
    amount: -24.5,
    date: "2024-01-17",
    status: "completed",
    icon: Car,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    id: 5,
    name: "Netflix Subscription",
    category: "Subscriptions",
    account: "Amex Platinum",
    amount: -15.99,
    date: "2024-01-16",
    status: "completed",
    icon: Wifi,
    color: "bg-red-500/10 text-red-500",
  },
  {
    id: 6,
    name: "Rent Payment",
    category: "Housing",
    account: "Chase Checking",
    amount: -2200.0,
    date: "2024-01-15",
    status: "completed",
    icon: Home,
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    id: 7,
    name: "Grocery Store",
    category: "Food & Dining",
    account: "Chase Checking",
    amount: -156.32,
    date: "2024-01-14",
    status: "pending",
    icon: ShoppingBag,
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    id: 8,
    name: "Gas Station",
    category: "Transportation",
    account: "Chase Checking",
    amount: -45.0,
    date: "2024-01-13",
    status: "completed",
    icon: Car,
    color: "bg-blue-500/10 text-blue-500",
  },
];

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const searchParams = useSearchParams();

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Manage and track all your transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                <SelectItem value="Transportation">Transportation</SelectItem>
                <SelectItem value="Shopping">Shopping</SelectItem>
                <SelectItem value="Housing">Housing</SelectItem>
                <SelectItem value="Subscriptions">Subscriptions</SelectItem>
                <SelectItem value="Income">Income</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", transaction.color)}>
                          <transaction.icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{transaction.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {transaction.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {transaction.account}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.status === "completed"
                            ? "default"
                            : "secondary"
                        }
                        className={cn(
                          "capitalize",
                          transaction.status === "completed" &&
                            "bg-success/10 text-success hover:bg-success/20"
                        )}
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-semibold",
                        transaction.amount > 0 ? "text-success" : ""
                      )}
                    >
                      {transaction.amount > 0 ? "+" : ""}$
                      {Math.abs(transaction.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Tag className="h-4 w-4 mr-2" />
                            Categorize
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddTransactionDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
}

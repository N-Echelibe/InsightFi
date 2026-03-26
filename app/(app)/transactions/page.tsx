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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
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
  CalendarIcon,
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
  const [dateFilter, setDateFilter] = useState("all");
  const [customDateStart, setCustomDateStart] = useState<Date | null>(null);
  const [customDateEnd, setCustomDateEnd] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const searchParams = useSearchParams();
  const itemsPerPage = 10;

  // Helper function to check if transaction is within date range
  const isWithinDateRange = (transactionDate: string): boolean => {
    const txDate = new Date(transactionDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    ninetyDaysAgo.setHours(0, 0, 0, 0);

    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    if (dateFilter === "custom" && customDateStart && customDateEnd) {
      const startDate = new Date(customDateStart);
      const endDate = new Date(customDateEnd);
      endDate.setHours(23, 59, 59, 999);
      return txDate >= startDate && txDate <= endDate;
    }

    switch (dateFilter) {
      case "7d":
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return txDate >= sevenDaysAgo && txDate <= today;
      case "30d":
        return txDate >= thirtyDaysAgo && txDate <= today;
      case "90d":
        return txDate >= ninetyDaysAgo && txDate <= today;
      case "6m":
        return txDate >= sixMonthsAgo && txDate <= today;
      default:
        return true;
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || t.category === categoryFilter;
    const matchesDate = isWithinDateRange(t.date);
    return matchesSearch && matchesCategory && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIdx, startIdx + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

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
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select value={dateFilter} onValueChange={(value) => {
              setDateFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(value) => {
              setCategoryFilter(value);
              setCurrentPage(1);
            }}>
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

          {/* Custom Date Range Inputs */}
          {dateFilter === "custom" && (
            <div className="flex flex-col sm:flex-row gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !customDateStart && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateStart ? format(customDateStart, "PPP") : <span>Start Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customDateStart || undefined}
                    onSelect={(d) => {
                      setCustomDateStart(d || null);
                      setCurrentPage(1);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !customDateEnd && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateEnd ? format(customDateEnd, "PPP") : <span>End Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customDateEnd || undefined}
                    onSelect={(d) => {
                      setCustomDateEnd(d || null);
                      setCurrentPage(1);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
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
                {paginatedTransactions.map((transaction) => (
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
                      {transaction.amount > 0 ? "+" : ""}₦
                      {Math.abs(transaction.amount).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {startIdx + 1} to {Math.min(startIdx + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={cn(currentPage === page && "bg-primary")}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddTransactionDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
}

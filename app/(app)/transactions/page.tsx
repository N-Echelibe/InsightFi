"use client";

import { useState, useEffect } from "react";
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
import * as LucideIcons from "lucide-react";
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Edit,
  Trash2,
  Tag,
  CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import Loading from "./loading";
import axios from "axios";
import api from "@/lib/api";
import { TableSkeleton } from "@/components/skeletons";
import { ErrorState, EmptyState } from "@/components/states";

type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense" | string;
  category_id?: string;
  date: string;
  created_at?: string;
  status: string;
  categories?: {
    icon?: string;
    name?: string;
    color?: string;
  };
  accounts?: {
    name?: string;
  };
};

export default function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [customDateStart, setCustomDateStart] = useState<Date | null>(null);
  const [customDateEnd, setCustomDateEnd] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [transactionsData, setTransactionsData] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 8;

  const resolveIcon = (iconName?: string) => {
    if (!iconName) {
      return LucideIcons.Tag;
    }

    const normalized = iconName
      .trim()
      .replace(/[-_ ]+/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");

    // direct oj; if not found fallback to Tag
    return (LucideIcons as any)[normalized] || LucideIcons.Tag;
  };

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    pages: 1,
  });

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", `${currentPage}`);

      if (categoryFilter !== "all") {
        params.set("category", categoryFilter);
      }

      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }

      const now = new Date();
      let startDate: Date | null = null;
      let endDate: Date | null = null;

      if (dateFilter === "7d") {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
      } else if (dateFilter === "30d") {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
      } else if (dateFilter === "90d") {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 90);
      } else if (dateFilter === "6m") {
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 6);
      } else if (dateFilter === "custom" && customDateStart && customDateEnd) {
        startDate = customDateStart;
        endDate = customDateEnd;
      }

      if (startDate) {
        params.set("startDate", startDate.toISOString());
      }
      if (endDate) {
        const endDateCopy = new Date(endDate);
        endDateCopy.setHours(23, 59, 59, 999);
        params.set("endDate", endDateCopy.toISOString());
      }

      const response = await axios.get(`${api.baseURL}/transactions?${params.toString()}`);
      const payload = response.data;

      if (payload && Array.isArray(payload.transactions)) {
        setTransactionsData(payload.transactions);
        setPagination({
          page: payload.pagination?.page ?? 1,
          limit: payload.pagination?.limit ?? 8,
          total: payload.pagination?.total ?? payload.transactions.length,
          pages: payload.pagination?.pages ?? 1,
        });
        setCurrentPage(payload.pagination?.page ?? 1);
      } else {
        setTransactionsData([]);
        setPagination({ page: 1, limit: itemsPerPage, total: 0, pages: 1 });
        setError("Unexpected transactions payload");
      }
    } catch (err) {
      console.error("Failed to fetch transactions", err);
      setTransactionsData([]);
      setPagination({ page: 1, limit: itemsPerPage, total: 0, pages: 1 });
      setError("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [searchQuery, categoryFilter, dateFilter, customDateStart, customDateEnd, currentPage]);

  const filteredTransactions = transactionsData;
  const paginatedTransactions = filteredTransactions;
  const totalPages = pagination.pages;
  const startIdx = (pagination.page - 1) * pagination.limit;

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Manage and track all your transactions
          </p>
        </div>
        <ErrorState
          title="Failed to load transactions"
          description={error}
          onRetry={() => fetchTransactions()}
        />
      </div>
    );
  }

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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg animate-pulse">
                            <div className="h-8 w-8 rounded bg-muted" />
                            <div className="h-4 flex-1 bg-muted rounded" />
                            <div className="h-4 w-20 bg-muted rounded" />
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <EmptyState
                        title="No transactions yet"
                        description="Start tracking your finances by adding your first transaction."
                        action={{
                          label: "Add Transaction",
                          onClick: () => setAddDialogOpen(true),
                        }}
                        variant="inline"
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTransactions.map((transaction) => {
                  const Icon = resolveIcon(transaction.categories?.icon);
                  const effectiveAmount =
                    transaction.type === "expense"
                      ? -Math.abs(transaction.amount)
                      : Math.abs(transaction.amount);

                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", transaction.categories?.color)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-medium">{transaction.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {transaction.categories?.name || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {transaction.accounts?.name || "Unknown"}
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
                            transaction.status === "completed" ? "default" : "secondary"
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
                          effectiveAmount > 0 ? "text-success" : ""
                        )}
                      >
                        {effectiveAmount > 0 ? "+" : ""}₦
                        {Math.abs(effectiveAmount).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                );
              })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {Math.min(startIdx + 1, pagination.total)} to {Math.min(startIdx + pagination.limit, pagination.total)} of {pagination.total}
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

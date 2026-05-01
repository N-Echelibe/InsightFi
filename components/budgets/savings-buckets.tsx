"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Edit,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const savingsBuckets = [
  {
    id: 1,
    name: "Vacation Fund",
    current: 3200,
    target: 5000,
    deadline: "Aug 2024",
    icon: Plane,
    color: "bg-sky-500/10 text-sky-500",
    autoSave: {
      enabled: true,
      amount: 200,
      frequency: "monthly",
    },
    alerts: true,
  },
  {
    id: 2,
    name: "Home Down Payment",
    current: 28500,
    target: 60000,
    deadline: "Dec 2025",
    icon: Home,
    color: "bg-emerald-500/10 text-emerald-500",
    autoSave: {
      enabled: true,
      amount: 1000,
      frequency: "monthly",
    },
    alerts: true,
  },
  {
    id: 3,
    name: "Education",
    current: 8400,
    target: 15000,
    deadline: "Sep 2024",
    icon: GraduationCap,
    color: "bg-amber-500/10 text-amber-500",
    autoSave: {
      enabled: false,
      amount: 0,
      frequency: "monthly",
    },
    alerts: false,
  },
  {
    id: 4,
    name: "New Car",
    current: 5200,
    target: 25000,
    deadline: "Jun 2025",
    icon: Car,
    color: "bg-blue-500/10 text-blue-500",
    autoSave: {
      enabled: true,
      amount: 500,
      frequency: "monthly",
    },
    alerts: true,
  },
  {
    id: 5,
    name: "Emergency Fund",
    current: 12000,
    target: 15000,
    deadline: "Ongoing",
    icon: Shield,
    color: "bg-rose-500/10 text-rose-500",
    autoSave: {
      enabled: true,
      amount: 300,
      frequency: "monthly",
    },
    alerts: true,
  },
];

export function SavingsBuckets() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  const totalSaved = savingsBuckets.reduce((sum, b) => sum + b.current, 0);
  const totalTarget = savingsBuckets.reduce((sum, b) => sum + b.target, 0);

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
              ${totalSaved.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">
              Total Target
            </p>
            <p className="text-2xl font-bold">
              ${totalTarget.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground">
              Monthly Auto-Save
            </p>
            <p className="text-2xl font-bold">
              $
              {savingsBuckets
                .filter((b) => b.autoSave.enabled)
                .reduce((sum, b) => sum + b.autoSave.amount, 0)
                .toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row">
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New Bucket
        </Button>
        <Button
          variant="outline"
          className="gap-2 bg-transparent"
          onClick={() => setTransferDialogOpen(true)}
        >
          <ArrowRightLeft className="h-4 w-4" />
          Transfer
        </Button>
      </div>

      {/* Buckets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savingsBuckets.map((bucket) => {
          const percentage = Math.round((bucket.current / bucket.target) * 100);

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
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                        Transfer
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Bell className="h-4 w-4 mr-2" />
                        {bucket.alerts ? "Disable Alerts" : "Enable Alerts"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      ${bucket.current.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      of ${bucket.target.toLocaleString()}
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
                          ${bucket.autoSave.amount}/{bucket.autoSave.frequency}
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Savings Bucket</DialogTitle>
            <DialogDescription>
              Set up a new savings goal with optional auto-save.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Bucket Name</Label>
              <Input placeholder="e.g., Vacation Fund" />
            </div>
            <div className="grid gap-2">
              <Label>Target Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input type="number" placeholder="0.00" className="pl-7" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Target Date</Label>
              <Input type="date" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Auto-Save</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically transfer money each month
                </p>
              </div>
              <Switch />
            </div>
          </div>
          <DialogFooter className="sm:[&>button]:w-auto [&>button]:w-full">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setDialogOpen(false)}>Create Bucket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transfer Between Buckets</DialogTitle>
            <DialogDescription>
              Move funds between your savings buckets.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>From</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Select bucket</option>
                {savingsBuckets.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} (${b.current.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label>To</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">Select bucket</option>
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
                  $
                </span>
                <Input type="number" placeholder="0.00" className="pl-7" />
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
            <Button onClick={() => setTransferDialogOpen(false)}>
              Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

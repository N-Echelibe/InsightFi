"use client";

import { SavingsBuckets } from "@/components/budgets/savings-buckets";

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
        <p className="text-muted-foreground">
          Track savings progress and manage money set aside for future plans
        </p>
      </div>

      <SavingsBuckets />
    </div>
  );
}

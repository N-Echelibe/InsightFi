"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plane, Home, GraduationCap, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const goals = [
  {
    name: "Vacation Fund",
    current: 3200,
    target: 5000,
    icon: Plane,
    color: "bg-sky-500/10 text-sky-500",
    autoSave: true,
  },
  {
    name: "Home Down Payment",
    current: 28500,
    target: 60000,
    icon: Home,
    color: "bg-emerald-500/10 text-emerald-500",
    autoSave: true,
  },
  {
    name: "Education",
    current: 8400,
    target: 15000,
    icon: GraduationCap,
    color: "bg-amber-500/10 text-amber-500",
    autoSave: false,
  },
];

export function SavingsGoals() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Savings Goals</CardTitle>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => {
          const percentage = Math.round((goal.current / goal.target) * 100);

          return (
            <div
              key={goal.name}
              className="p-3 rounded-lg border border-border hover:border-primary/20 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", goal.color)}>
                    <goal.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{goal.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ${goal.current.toLocaleString()} of $
                      {goal.target.toLocaleString()}
                    </p>
                  </div>
                </div>
                {goal.autoSave && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <Sparkles className="h-3 w-3" />
                    Auto
                  </div>
                )}
              </div>
              <Progress value={percentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2 text-right">
                {percentage}% complete
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

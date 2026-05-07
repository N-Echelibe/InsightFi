"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  isCurrency?: boolean;
}

export function StatCard({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  iconColor = "bg-primary/10 text-primary",
  isCurrency = false,
}: StatCardProps) {
  const formattedValue =
    isCurrency && typeof value === "number"
      ? `${"\u20a6"}${value.toLocaleString("en-NG", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : String(value);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="truncate text-2xl font-bold tracking-tight">
              {formattedValue}
            </p>
            {change && (
              <div className="flex items-center gap-1">
                {trend === "up" && (
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                )}
                {trend === "down" && (
                  <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                )}
                <span
                  className={cn(
                    "truncate text-xs font-medium",
                    trend === "up" && "text-success",
                    trend === "down" && "text-destructive",
                    trend === "neutral" && "text-muted-foreground",
                  )}
                >
                  {change}
                </span>
              </div>
            )}
          </div>
          <div className={cn("shrink-0 rounded-lg p-2.5", iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

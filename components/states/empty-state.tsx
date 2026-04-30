import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "card" | "inline";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "card",
  className,
}: EmptyStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
      {Icon && (
        <div className="rounded-lg bg-muted p-3">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action && (
        <Button onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  );

  if (variant === "inline") {
    return <div className={cn("rounded-lg border border-dashed border-muted-foreground/20 bg-muted/30 p-4", className)}>{content}</div>;
  }

  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="p-0">{content}</CardContent>
    </Card>
  );
}

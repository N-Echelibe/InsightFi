import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: "card" | "inline";
  className?: string;
}

export function ErrorState({
  title = "Failed to load data",
  description = "Something went wrong while loading. Please try again.",
  onRetry,
  retryLabel = "Retry",
  variant = "card",
  className,
}: ErrorStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
      <div className="rounded-lg bg-destructive/10 p-3">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="mt-2"
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );

  if (variant === "inline") {
    return <div className={cn("rounded-lg border border-destructive/20 bg-destructive/5 p-4", className)}>{content}</div>;
  }

  return (
    <Card className={cn("border-destructive/20 bg-destructive/5", className)}>
      <CardContent className="p-0">{content}</CardContent>
    </Card>
  );
}

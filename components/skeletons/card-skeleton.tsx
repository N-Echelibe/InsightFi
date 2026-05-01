import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CardSkeletonProps {
  count?: number;
  variant?: "stat" | "content";
  className?: string;
}

export function CardSkeleton({
  count = 1,
  variant = "stat",
  className,
}: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className={cn("animate-pulse", className)}>
          <CardHeader>
            <div className="space-y-2">
              <div className="h-4 w-1/3 rounded-md bg-muted" />
              {variant === "stat" && (
                <div className="h-8 w-1/2 rounded-md bg-muted" />
              )}
            </div>
          </CardHeader>
          {variant === "content" && (
            <CardContent className="space-y-3">
              <div className="h-4 w-full rounded-md bg-muted" />
              <div className="h-4 w-5/6 rounded-md bg-muted" />
            </CardContent>
          )}
        </Card>
      ))}
    </>
  );
}

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ChartSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-5 w-1/3 rounded-md bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full rounded-md bg-muted" />
      </CardContent>
    </Card>
  );
}

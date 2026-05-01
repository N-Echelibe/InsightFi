import { CardSkeleton } from "./card-skeleton";

interface PageSkeletonProps {
  title?: boolean;
  statsCount?: number;
  sections?: Array<{
    type: "card" | "chart" | "table";
    count?: number;
  }>;
}

export function PageSkeleton({
  title = true,
  statsCount = 4,
  sections = [{ type: "card", count: 2 }],
}: PageSkeletonProps) {
  return (
    <div className="space-y-8 animate-pulse">
      {title && (
        <div>
          <div className="h-8 w-1/4 rounded-md bg-muted" />
          <div className="mt-2 h-4 w-1/3 rounded-md bg-muted" />
        </div>
      )}

      {statsCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: statsCount }).map((_, i) => (
            <CardSkeleton key={i} variant="stat" />
          ))}
        </div>
      )}

      {sections.map((section, idx) => (
        <div key={idx}>
          {section.type === "card" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CardSkeleton count={section.count || 2} variant="content" />
            </div>
          )}
          {section.type === "chart" && (
            <div className="h-80 rounded-lg bg-muted" />
          )}
          {section.type === "table" && (
            <div className="space-y-3">
              <div className="h-10 rounded-lg bg-muted" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-muted" />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

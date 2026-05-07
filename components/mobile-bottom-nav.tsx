"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  FileBarChart,
  LayoutDashboard,
  Lightbulb,
  MoreHorizontal,
  PiggyBank,
  Settings,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const primaryItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: ArrowLeftRight,
  },
  {
    title: "Budgets",
    href: "/budgets",
    icon: PiggyBank,
  },
  {
    title: "Goals",
    href: "/goals",
    icon: Target,
  },
];

const moreItems = [
  {
    title: "Insights",
    href: "/insights",
    icon: Lightbulb,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileBarChart,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(href));
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const isMoreActive = moreItems.some((item) => isActivePath(pathname, item.href));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-sidebar-border bg-sidebar/95 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {primaryItems.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="max-w-full truncate">{item.title}</span>
            </Link>
          );
        })}

        <Sheet>
          <SheetTrigger
            aria-label="Open more navigation"
            className={cn(
              "flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-medium transition-colors",
              isMoreActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span>More</span>
          </SheetTrigger>
          <SheetContent side="bottom" className="gap-0 rounded-t-2xl p-0 pb-[env(safe-area-inset-bottom)]">
            <SheetHeader className="border-b text-left">
              <SheetTitle>More</SheetTitle>
            </SheetHeader>
            <div className="grid gap-2 p-4">
              {moreItems.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <SheetClose key={item.href} asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.title}
                    </Link>
                  </SheetClose>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

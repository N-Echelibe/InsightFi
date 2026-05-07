"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Lightbulb,
  FileBarChart,
  Settings,
  Target,
  Wallet,
} from "lucide-react";

const navItems = [
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

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="flex items-center gap-3 h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
          <Wallet className="h-5 w-5" />
        </div>
        <span className="font-semibold text-lg text-sidebar-foreground">
          FinanceAI
        </span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

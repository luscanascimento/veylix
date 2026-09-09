"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Laptop,
  ArrowRightLeft,
  Wrench,
  Users,
  MapPin,
  FolderTree,
  ShieldAlert,
  Settings,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { cn } from "@veylix/ui";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Assets", href: "/assets", icon: Laptop, badge: "1.4k" },
  { label: "Transfers & History", href: "/movements", icon: ArrowRightLeft },
  { label: "Maintenance", href: "/maintenance", icon: Wrench, badge: "42" },
  { label: "Employees", href: "/employees", icon: Users },
  { label: "Locations", href: "/locations", icon: MapPin },
  { label: "Categories", href: "/categories", icon: FolderTree },
  { label: "Audit Trail", href: "/audit-logs", icon: ShieldCheck },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6 dark:border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20">
          V
        </div>
        <div>
          <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-50">
            Veylix
          </span>
          <span className="block text-[10px] uppercase font-semibold text-blue-600 dark:text-blue-400 tracking-wider">
            Enterprise Asset
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100",
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300",
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    isActive
                      ? "bg-blue-200/60 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-2.5 dark:bg-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            AD
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-semibold text-slate-900 truncate dark:text-slate-100">
              Administrator
            </p>
            <p className="text-[10px] text-slate-500 truncate dark:text-slate-400">
              admin@veylix.corp
            </p>
          </div>
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
        </div>
      </div>
    </aside>
  );
}

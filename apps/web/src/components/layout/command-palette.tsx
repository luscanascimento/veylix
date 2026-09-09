"use client";

import * as React from "react";
import { Command } from "cmdk";
import {
  Search,
  Laptop,
  ArrowRightLeft,
  Wrench,
  Users,
  MapPin,
  ShieldCheck,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  if (!open) return null;

  const navigateTo = (path: string) => {
    onOpenChange(false);
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/60 backdrop-blur-sm animate-in fade-in-50">
      <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center border-b border-slate-200 px-3 pb-2 dark:border-slate-800">
          <Search className="h-4 w-4 text-slate-400 mr-2" />
          <input
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
            placeholder="Type a command or search assets..."
            autoFocus
          />
          <button
            onClick={() => onOpenChange(false)}
            className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="py-2 text-xs font-semibold text-slate-400 px-3 uppercase tracking-wider">
          Navigation
        </div>
        <div className="space-y-1">
          <button
            onClick={() => navigateTo("/")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Laptop className="h-4 w-4 text-blue-500" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => navigateTo("/assets")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Laptop className="h-4 w-4 text-blue-500" />
            <span>Asset Inventory</span>
          </button>
          <button
            onClick={() => navigateTo("/movements")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowRightLeft className="h-4 w-4 text-emerald-500" />
            <span>Custody Transfers</span>
          </button>
          <button
            onClick={() => navigateTo("/maintenance")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Wrench className="h-4 w-4 text-amber-500" />
            <span>Maintenance Work Orders</span>
          </button>
          <button
            onClick={() => navigateTo("/employees")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Users className="h-4 w-4 text-indigo-500" />
            <span>Employees Directory</span>
          </button>
        </div>
      </div>
    </div>
  );
}

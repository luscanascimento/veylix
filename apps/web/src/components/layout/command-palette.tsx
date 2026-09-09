"use client";

import * as React from "react";
import { Command } from "cmdk";
import {
  Search,
  Laptop,
  ArrowRightLeft,
  Wrench,
  Users,
  LayoutDashboard,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogOverlay,
} from "@radix-ui/react-dialog";

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

  const navigateTo = (path: string) => {
    onOpenChange(false);
    router.push(path);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm animate-in fade-in-50" />
      <DialogContent className="fixed left-[50%] top-[20%] z-50 w-full max-w-lg translate-x-[-50%] rounded-xl border border-slate-200 bg-white p-0 shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden outline-none">
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <Command
          className="flex w-full flex-col overflow-hidden bg-transparent"
          label="Command Menu"
        >
          <div className="flex items-center border-b border-slate-200 px-3 dark:border-slate-800">
            <Search className="h-4 w-4 shrink-0 text-slate-400 mr-2" />
            <Command.Input
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-100"
              placeholder="Type a command or search assets..."
            />
            <button
              onClick={() => onOpenChange(false)}
              className="ml-2 rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Close command palette"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm text-slate-500">
              No results found.
            </Command.Empty>
            <Command.Group
              heading="Navigation"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-slate-400 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
            >
              <Command.Item
                onSelect={() => navigateTo("/")}
                className="relative flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none aria-selected:bg-slate-100 dark:text-slate-300 dark:aria-selected:bg-slate-800 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <LayoutDashboard className="h-4 w-4 text-blue-500" />
                <span>Dashboard</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo("/assets")}
                className="relative flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none aria-selected:bg-slate-100 dark:text-slate-300 dark:aria-selected:bg-slate-800 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <Laptop className="h-4 w-4 text-blue-500" />
                <span>Asset Inventory</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo("/movements")}
                className="relative flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none aria-selected:bg-slate-100 dark:text-slate-300 dark:aria-selected:bg-slate-800 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <ArrowRightLeft className="h-4 w-4 text-emerald-500" />
                <span>Custody Transfers</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo("/maintenance")}
                className="relative flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none aria-selected:bg-slate-100 dark:text-slate-300 dark:aria-selected:bg-slate-800 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <Wrench className="h-4 w-4 text-amber-500" />
                <span>Maintenance Work Orders</span>
              </Command.Item>
              <Command.Item
                onSelect={() => navigateTo("/employees")}
                className="relative flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none aria-selected:bg-slate-100 dark:text-slate-300 dark:aria-selected:bg-slate-800 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <Users className="h-4 w-4 text-indigo-500" />
                <span>Employees Directory</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

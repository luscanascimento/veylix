"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Laptop,
  Wrench,
  ShieldAlert,
  ArrowRightLeft,
  X,
  Clock,
} from "lucide-react";
import { Button, cn } from "@veylix/ui";
import { fetchApi } from "@/lib/api-client";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "asset" | "maintenance" | "security" | "movement";
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Asset Custody Assigned",
    description: 'MacBook Pro 16" assigned to John Doe (Engineering)',
    time: "10m ago",
    read: false,
    type: "asset",
  },
  {
    id: "notif-2",
    title: "Maintenance Ticket Opened",
    description: "Ergonomic Desk Chair scheduled for routine inspection",
    time: "45m ago",
    read: false,
    type: "maintenance",
  },
  {
    id: "notif-3",
    title: "Security & Session Audit",
    description: "Administrative login verified from 127.0.0.1",
    time: "2h ago",
    read: false,
    type: "security",
  },
  {
    id: "notif-4",
    title: "Transfer Recorded",
    description: "Asset moved to IT Storage Room B-05",
    time: "5h ago",
    read: true,
    type: "movement",
  },
];

export function NotificationsDropdown() {
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(
    DEFAULT_NOTIFICATIONS,
  );
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Try to populate notifications from live audit logs
  React.useEffect(() => {
    let isMounted = true;
    const loadLiveNotifications = async () => {
      try {
        const res = await fetchApi<any>("/audit-logs?limit=4");
        if (res?.data && res.data.length > 0 && isMounted) {
          const mapped: NotificationItem[] = res.data.map(
            (log: any, index: number) => {
              let type: NotificationItem["type"] = "security";
              if (log.resourceType?.includes("Asset")) type = "asset";
              if (log.resourceType?.includes("Maintenance"))
                type = "maintenance";
              if (log.resourceType?.includes("Movement")) type = "movement";

              return {
                id: log.id,
                title: log.eventName?.replace(/_/g, " ") || "System Event",
                description: `${log.resourceType} - ${log.resourceId?.slice(0, 8)}`,
                time: new Date(log.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                read: index > 1, // first two unread
                type,
              };
            },
          );
          setNotifications(mapped);
        }
      } catch {
        // Fallback to default mock notifications if unauthenticated or on error
      }
    };

    loadLiveNotifications();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "asset":
        return <Laptop className="h-4 w-4 text-blue-500" />;
      case "maintenance":
        return <Wrench className="h-4 w-4 text-amber-500" />;
      case "movement":
        return <ArrowRightLeft className="h-4 w-4 text-emerald-500" />;
      case "security":
      default:
        return <ShieldAlert className="h-4 w-4 text-purple-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((prev) => !prev)}
        className="relative text-slate-600 dark:text-slate-400"
        aria-label="View notifications"
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-0 shadow-lg dark:border-slate-800 dark:bg-slate-950 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium px-2 py-1 rounded"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Close notifications"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No notifications right now.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={cn(
                    "flex items-start gap-3 p-3.5 text-left transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60",
                    !item.read && "bg-blue-50/40 dark:bg-blue-950/20",
                  )}
                >
                  <div className="mt-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 p-2 shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={cn(
                          "text-xs truncate",
                          item.read
                            ? "font-medium text-slate-700 dark:text-slate-300"
                            : "font-semibold text-slate-900 dark:text-slate-100",
                        )}
                      >
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  {!item.read && (
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 p-3 text-center dark:border-slate-800">
            <Link
              href="/audit-logs"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              View full system audit trail ➔
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import { PageHeader, DataTable, SearchInput } from "@veylix/ui";
import { fetchApi } from "@/lib/api-client";
import { MaintenanceStatus, MaintenancePriority } from "@veylix/types";

export default function MaintenancePage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [tickets, setTickets] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [totalPages, setTotalPages] = React.useState(1);

  const loadTickets = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchApi<any>(
        `/maintenance?page=${page}&limit=10${searchTerm ? `&search=${searchTerm}` : ""}`,
      );
      setTickets(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error("Failed to load maintenance tickets", err);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  React.useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const columns = [
    {
      key: "ticketNumber",
      header: "Ticket ID",
      render: (item: any) => (
        <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
          {item.ticketNumber}
        </span>
      ),
    },
    {
      key: "title",
      header: "Issue",
      render: (item: any) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">
            {item.title}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
            {item.description}
          </p>
        </div>
      ),
    },
    {
      key: "asset",
      header: "Asset Ref",
      render: (item: any) => (
        <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
          {item.assetId}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: any) => (
        <span
          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium
          ${
            item.status === MaintenanceStatus.OPEN
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
              : item.status === MaintenanceStatus.IN_PROGRESS
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : item.status === MaintenanceStatus.COMPLETED
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                  : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (item: any) => (
        <span
          className={`text-xs font-semibold
          ${
            item.priority === MaintenancePriority.CRITICAL
              ? "text-red-600 dark:text-red-400"
              : item.priority === MaintenancePriority.HIGH
                ? "text-orange-600 dark:text-orange-400"
                : item.priority === MaintenancePriority.MEDIUM
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400"
          }`}
        >
          {item.priority}
        </span>
      ),
    },
    {
      key: "date",
      header: "Opened At",
      render: (item: any) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {new Date(item.openedAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <PageHeader
        title="Maintenance Tickets"
        description="Track open work orders, repairs, and preventative maintenance."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 sm:w-80">
          <SearchInput
            placeholder="Search by ticket number or title..."
            onSearchChange={(val) => {
              setSearchTerm(val);
              setPage(1);
            }}
          />
        </div>
      </div>

      <DataTable
        data={tickets}
        columns={columns}
        keyExtractor={(item) => item.id}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        loading={loading}
        emptyTitle="No maintenance tickets found"
        emptyDescription="Try adjusting your search filters."
      />
    </div>
  );
}

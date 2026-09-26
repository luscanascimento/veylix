"use client";

import * as React from "react";
import { PageHeader, DataTable, SearchInput, Button } from "@veylix/ui";
import { fetchApi } from "@/lib/api-client";
import { Download, ShieldCheck } from "lucide-react";

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [logs, setLogs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [totalPages, setTotalPages] = React.useState(1);

  const loadLogs = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchApi<any>(
        `/audit-logs?page=${page}&limit=15${searchTerm ? `&resourceType=${encodeURIComponent(searchTerm)}` : ""}`,
      );
      setLogs(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  React.useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleExport = React.useCallback(() => {
    if (!logs.length) return;
    const headers = [
      "Log ID",
      "Event Name",
      "Resource Type",
      "Resource ID",
      "Actor",
      "IP Address",
      "Date",
    ];
    const rows = logs.map((l) => [
      l.id,
      l.eventName,
      l.resourceType,
      l.resourceId,
      l.actorUserId || "System",
      l.ipAddress || "",
      new Date(l.createdAt).toISOString(),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `veylix_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [logs]);

  const columns = [
    {
      key: "eventName",
      header: "Event",
      render: (item: any) => (
        <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
          {item.eventName}
        </span>
      ),
    },
    {
      key: "resource",
      header: "Resource Target",
      render: (item: any) => (
        <div>
          <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">
            {item.resourceType}
          </span>
          <span className="block font-mono text-[10px] text-slate-500 dark:text-slate-400">
            {item.resourceId}
          </span>
        </div>
      ),
    },
    {
      key: "actor",
      header: "Actor",
      render: (item: any) => (
        <span className="text-xs text-slate-700 dark:text-slate-300">
          {item.actorUserId || "System"}
        </span>
      ),
    },
    {
      key: "network",
      header: "IP / Request ID",
      render: (item: any) => (
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          <p>{item.ipAddress}</p>
          <span className="font-mono text-[10px]">
            {item.requestId?.slice(0, 12)}
          </span>
        </div>
      ),
    },
    {
      key: "date",
      header: "Timestamp",
      render: (item: any) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {new Date(item.createdAt).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <PageHeader
        title="Audit Trail"
        description="Immutable regulatory audit log of all system and custody operations (INV-005)."
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
              disabled={!logs.length}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Audit Trail
            </Button>
          </div>
        }
      />

      <DataTable
        data={logs}
        columns={columns}
        keyExtractor={(item) => item.id}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        loading={loading}
        emptyTitle="No audit logs found"
        emptyDescription="System security and domain events will be immutably recorded here."
      />
    </div>
  );
}

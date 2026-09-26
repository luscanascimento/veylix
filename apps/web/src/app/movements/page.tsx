"use client";

import * as React from "react";
import { PageHeader, DataTable, SearchInput, Button } from "@veylix/ui";
import { fetchApi } from "@/lib/api-client";
import { Download } from "lucide-react";

export default function MovementsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [movements, setMovements] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [totalPages, setTotalPages] = React.useState(1);

  const loadMovements = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchApi<any>(
        `/movements?page=${page}&limit=10${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""}`,
      );
      setMovements(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error("Failed to load movements", err);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  React.useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  const handleExport = React.useCallback(() => {
    if (!movements.length) return;
    const headers = [
      "Movement Code",
      "Asset Patrimony",
      "Asset Name",
      "Type",
      "From",
      "To",
      "Performed By",
      "Date",
      "Reason",
    ];
    const rows = movements.map((m) => [
      m.movementNumber,
      m.asset?.patrimonyNumber || "",
      `"${(m.asset?.name || "").replace(/"/g, '""')}"`,
      m.movementType,
      `"${(m.fromEmployee?.name || m.fromLocation?.name || "Inventory").replace(/"/g, '""')}"`,
      `"${(m.toEmployee?.name || m.toLocation?.name || "Inventory").replace(/"/g, '""')}"`,
      `"${(m.performedByUser?.name || "System").replace(/"/g, '""')}"`,
      new Date(m.createdAt).toISOString(),
      `"${(m.reason || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `veylix_movements_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [movements]);

  const columns = [
    {
      key: "movementNumber",
      header: "Movement Code",
      render: (item: any) => (
        <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
          {item.movementNumber}
        </span>
      ),
    },
    {
      key: "asset",
      header: "Asset & Patrimony",
      render: (item: any) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">
            {item.asset?.name || "Asset"}
          </p>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {item.asset?.patrimonyNumber || item.assetId}
          </span>
        </div>
      ),
    },
    {
      key: "movementType",
      header: "Action / Type",
      render: (item: any) => (
        <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200">
          {item.movementType}
        </span>
      ),
    },
    {
      key: "custody",
      header: "Custody Flow",
      render: (item: any) => {
        const from =
          item.fromEmployee?.name || item.fromLocation?.name || "Inventory";
        const to =
          item.toEmployee?.name || item.toLocation?.name || "Inventory";
        return (
          <div className="text-xs">
            <span className="text-slate-500 dark:text-slate-400">{from}</span>
            <span className="mx-1 text-slate-400">➔</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {to}
            </span>
          </div>
        );
      },
    },
    {
      key: "performedBy",
      header: "Performed By",
      render: (item: any) => (
        <span className="text-xs text-slate-700 dark:text-slate-300">
          {item.performedByUser?.name || "System"}
        </span>
      ),
    },
    {
      key: "reason",
      header: "Reason / Notes",
      render: (item: any) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px] block">
          {item.reason}
        </span>
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
        title="Transfers & Movement History"
        description="Immutable audit trail of all custody transfers and asset movements (INV-004)."
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
              disabled={!movements.length}
            >
              <Download className="mr-2 h-4 w-4" />
              Export History
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 sm:w-80">
          <SearchInput
            placeholder="Search by code, patrimony, asset..."
            onSearchChange={(val) => {
              setSearchTerm(val);
              setPage(1);
            }}
          />
        </div>
      </div>

      <DataTable
        data={movements}
        columns={columns}
        keyExtractor={(item) => item.id}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        loading={loading}
        emptyTitle="No movements recorded"
        emptyDescription="Asset transfers and custody assignments will appear here automatically."
      />
    </div>
  );
}

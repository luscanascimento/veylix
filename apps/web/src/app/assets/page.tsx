"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader, DataTable, StatusBadge, Button, SearchInput } from "@veylix/ui";
import { Plus, Download } from "lucide-react";
import { AssetStatus } from "@veylix/types";
import { RoleGate } from "@/components/auth/role-gate";

export default function AssetsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [assets, setAssets] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [totalPages, setTotalPages] = React.useState(1);

  const loadAssets = React.useCallback(async () => {
    try {
      setLoading(true);
      const { fetchApi } = await import("@/lib/api-client");
      const res = await fetchApi<any>(
        `/assets?page=${page}&limit=10${searchTerm ? `&search=${searchTerm}` : ""}`
      );
      setAssets(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error("Failed to load assets", err);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  React.useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const columns = [
    {
      key: "patrimonyNumber",
      header: "Patrimony No.",
      render: (item: any) => (
        <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
          {item.patrimonyNumber}
        </span>
      ),
    },
    {
      key: "name",
      header: "Asset details",
      render: (item: any) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">
            {item.name}
          </p>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {item.brand} {item.model}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: any) => <StatusBadge status={item.status as AssetStatus} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: any) => (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push(`/assets/${item.id}`)}
        >
          View details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <PageHeader
        title="Asset Inventory"
        description="Manage all physical assets, equipment, and devices."
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <RoleGate allowedRoles={["ADMIN", "OPERATOR"]}>
              <Button size="sm" onClick={() => router.push("/assets/new")}>
                <Plus className="mr-2 h-4 w-4" />
                New Asset
              </Button>
            </RoleGate>
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 sm:w-80">
          <SearchInput
            placeholder="Search by name, patrimony..."
            onSearchChange={(val) => {
              setSearchTerm(val);
              setPage(1);
            }}
          />
        </div>
      </div>

      <DataTable
        data={assets}
        columns={columns}
        keyExtractor={(item) => item.id}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        loading={loading}
        emptyTitle="No assets found"
        emptyDescription="Try adjusting your search filters or add a new asset."
      />
    </div>
  );
}

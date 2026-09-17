"use client";

import * as React from "react";
import {
  PageHeader,
  StatCard,
  DataTable,
  StatusBadge,
  SearchInput,
  Button,
} from "@veylix/ui";
import { AssetStatus } from "@veylix/types";
import {
  Laptop,
  CheckCircle2,
  Wrench,
  ArrowRightLeft,
  DollarSign,
  Plus,
  Filter,
} from "lucide-react";



export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [stats, setStats] = React.useState<any>(null);
  const [statsLoading, setStatsLoading] = React.useState(true);
  const [movements, setMovements] = React.useState<any[]>([]);
  const [movementsLoading, setMovementsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const { fetchApi } = await import("@/lib/api-client");
        
        // Fetch stats
        const statsData = await fetchApi("/dashboard/stats");
        setStats(statsData);

        // Fetch recent audit logs for movements
        const auditData = await fetchApi<any>("/audit-logs?limit=5");
        
        // Map audit logs to movement format (since we don't have a direct dashboard recent movements endpoint)
        const mappedMovements = auditData.data.map((log: any) => ({
          id: log.id,
          movementNumber: log.id.slice(0, 8).toUpperCase(),
          patrimonyNumber: log.resourceId.slice(0, 8),
          assetName: log.resourceType,
          type: log.eventName,
          custodian: log.actorUserId || "System",
          location: "See details",
          status: AssetStatus.IN_USE,
          date: new Date(log.createdAt).toLocaleString(),
        }));
        
        setMovements(mappedMovements);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setStatsLoading(false);
        setMovementsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredMovements = React.useMemo(() => {
    if (!searchTerm) return movements;
    return movements.filter(
      (m) =>
        m.patrimonyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.custodian.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, movements]);

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
            {item.assetName}
          </p>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {item.patrimonyNumber}
          </span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Action",
      render: (item: any) => (
        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {item.type}
        </span>
      ),
    },
    {
      key: "custodian",
      header: "Custodian / Location",
      render: (item: any) => (
        <div>
          <p className="text-slate-900 dark:text-slate-100">{item.custodian}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {item.location}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "State",
      render: (item: any) => <StatusBadge status={item.status} />,
    },
    {
      key: "date",
      header: "Timestamp",
      render: (item: any) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {item.date}
        </span>
      ),
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-8 animate-in fade-in-50">
      <PageHeader
        title="Asset Inventory Dashboard"
        description="Real-time physical asset lifecycle, custody tracking, and operational metrics."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <ArrowRightLeft className="h-4 w-4" />
              Transfer Custody
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Register Asset
            </Button>
          </div>
        }
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Assets"
          value={statsLoading ? "..." : stats?.totalAssets?.toString() || "0"}
          description="Tracked corporate physical assets"
          icon={Laptop}
          trend={{ value: "Total active in db", positive: true }}
        />
        <StatCard
          title="Active in Custody"
          value={statsLoading ? "..." : stats?.inCustody?.toString() || "0"}
          description="Assigned to verified employees"
          icon={CheckCircle2}
        />
        <StatCard
          title="In Maintenance"
          value={statsLoading ? "..." : stats?.inMaintenance?.toString() || "0"}
          description="Open work orders & tech service"
          icon={Wrench}
        />
        <StatCard
          title="Total Valuation"
          value={statsLoading ? "..." : stats ? formatCurrency(stats.totalValuation) : "$0"}
          description="Acquisition capital value"
          icon={DollarSign}
        />
      </div>

      {/* Recent Movements & Chain of Custody */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Recent Chain of Custody Movements
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Immutable audit log of recent transfers, assignments, and service
              transitions.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:w-72">
            <SearchInput
              placeholder="Filter by patrimony, name..."
              onSearchChange={setSearchTerm}
            />
          </div>
        </div>

        <DataTable
          data={filteredMovements}
          columns={columns}
          keyExtractor={(item) => item.id}
          page={page}
          totalPages={1}
          onPageChange={setPage}
          emptyTitle="No movements recorded"
          emptyDescription="Try adjusting your search criteria."
        />
      </div>
    </div>
  );
}

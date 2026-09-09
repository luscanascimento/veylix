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

interface MockAssetMovement {
  id: string;
  movementNumber: string;
  patrimonyNumber: string;
  assetName: string;
  type: string;
  custodian: string;
  location: string;
  status: AssetStatus;
  date: string;
}

const mockMovements: MockAssetMovement[] = [
  {
    id: "mov_1",
    movementNumber: "MOV-2026-0042",
    patrimonyNumber: "AST-2026-0182",
    assetName: 'MacBook Pro 16" M3 Max',
    type: "ASSIGNMENT",
    custodian: "Lucas Nascimento",
    location: "HQ - Floor 3 (Engineering)",
    status: AssetStatus.IN_USE,
    date: "2026-09-09 18:30",
  },
  {
    id: "mov_2",
    movementNumber: "MOV-2026-0041",
    patrimonyNumber: "AST-2026-0094",
    assetName: 'Dell UltraSharp 32" 4K',
    type: "TRANSFER",
    custodian: "Mariana Silva",
    location: "HQ - Floor 2 (Design)",
    status: AssetStatus.IN_USE,
    date: "2026-09-09 16:15",
  },
  {
    id: "mov_3",
    movementNumber: "MOV-2026-0040",
    patrimonyNumber: "AST-2026-0310",
    assetName: "ThinkPad P1 Gen 6",
    type: "RETURN",
    custodian: "IT Storage Pool",
    location: "HQ - Floor 1 (IT Warehouse)",
    status: AssetStatus.AVAILABLE,
    date: "2026-09-09 14:00",
  },
  {
    id: "mov_4",
    movementNumber: "MOV-2026-0039",
    patrimonyNumber: "AST-2026-0012",
    assetName: "Cisco Catalyst 9300 Switch",
    type: "MAINTENANCE",
    custodian: "Tech Lab Repair",
    location: "Server Room B",
    status: AssetStatus.MAINTENANCE,
    date: "2026-09-08 11:20",
  },
];

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [page, setPage] = React.useState(1);

  const filteredMovements = React.useMemo(() => {
    if (!searchTerm) return mockMovements;
    return mockMovements.filter(
      (m) =>
        m.patrimonyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.custodian.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

  const columns = [
    {
      key: "movementNumber",
      header: "Movement Code",
      render: (item: MockAssetMovement) => (
        <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
          {item.movementNumber}
        </span>
      ),
    },
    {
      key: "asset",
      header: "Asset & Patrimony",
      render: (item: MockAssetMovement) => (
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
      render: (item: MockAssetMovement) => (
        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {item.type}
        </span>
      ),
    },
    {
      key: "custodian",
      header: "Custodian / Location",
      render: (item: MockAssetMovement) => (
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
      render: (item: MockAssetMovement) => <StatusBadge status={item.status} />,
    },
    {
      key: "date",
      header: "Timestamp",
      render: (item: MockAssetMovement) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {item.date}
        </span>
      ),
    },
  ];

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
          value="1,428"
          description="Tracked corporate physical assets"
          icon={Laptop}
          trend={{ value: "+12 this month", positive: true }}
        />
        <StatCard
          title="Active in Custody"
          value="1,180"
          description="Assigned to verified employees"
          icon={CheckCircle2}
          trend={{ value: "82.6% utilization", positive: true }}
        />
        <StatCard
          title="In Maintenance"
          value="42"
          description="Open work orders & tech service"
          icon={Wrench}
          trend={{ value: "2 critical", positive: false }}
        />
        <StatCard
          title="Total Valuation"
          value="$2.84M"
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

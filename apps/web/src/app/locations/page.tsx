"use client";

import * as React from "react";
import { PageHeader, DataTable, SearchInput } from "@veylix/ui";
import { fetchApi } from "@/lib/api-client";
import { MapPin, Building2 } from "lucide-react";

export default function LocationsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [locations, setLocations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadLocations = async () => {
      try {
        setLoading(true);
        const data = await fetchApi<any[]>("/locations");
        setLocations(data || []);
      } catch (err) {
        console.error("Failed to load locations", err);
      } finally {
        setLoading(false);
      }
    };
    loadLocations();
  }, []);

  const filteredLocations = React.useMemo(() => {
    if (!searchTerm) return locations;
    const term = searchTerm.toLowerCase();
    return locations.filter(
      (l) =>
        l.name?.toLowerCase().includes(term) ||
        l.code?.toLowerCase().includes(term) ||
        l.building?.toLowerCase().includes(term),
    );
  }, [searchTerm, locations]);

  const columns = [
    {
      key: "code",
      header: "Location Code",
      render: (item: any) => (
        <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
          {item.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Location Name",
      render: (item: any) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-blue-500" />
            {item.name}
          </p>
        </div>
      ),
    },
    {
      key: "building",
      header: "Building & Floor",
      render: (item: any) => (
        <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
          <Building2 className="h-3.5 w-3.5 text-slate-400" />
          <span>{item.building}</span>
          {item.floor && <span>• {item.floor}</span>}
          {item.room && <span>({item.room})</span>}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item: any) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
            item.isActive
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {item.isActive ? "Active Facility" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <PageHeader
        title="Physical Locations"
        description="Corporate physical premises, warehouses, and storage rooms."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 sm:w-80">
          <SearchInput
            placeholder="Search by name, code, building..."
            onSearchChange={setSearchTerm}
          />
        </div>
      </div>

      <DataTable
        data={filteredLocations}
        columns={columns}
        keyExtractor={(item) => item.id}
        page={1}
        totalPages={1}
        loading={loading}
        emptyTitle="No locations found"
        emptyDescription="Facilities and inventory rooms configured in the platform."
      />
    </div>
  );
}

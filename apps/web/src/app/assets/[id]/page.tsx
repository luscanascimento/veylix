"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader, Button, StatusBadge, DataTable } from "@veylix/ui";
import { fetchApi } from "@/lib/api-client";
import { ArrowLeft, ArrowRightLeft, UserCheck, CornerDownLeft } from "lucide-react";
import { AssetStatus } from "@veylix/types";

export default function AssetDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [asset, setAsset] = React.useState<any>(null);
  const [movements, setMovements] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [actionType, setActionType] = React.useState<"ASSIGN" | "TRANSFER" | "RETURN" | null>(null);
  const [employees, setEmployees] = React.useState<any[]>([]);
  const [locations, setLocations] = React.useState<any[]>([]);
  
  const [actionForm, setActionForm] = React.useState({
    employeeId: "",
    locationId: "",
    reason: "",
  });

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [assetRes, movementsRes] = await Promise.all([
        fetchApi<any>(`/assets/${id}`),
        fetchApi<any>(`/assets/${id}/movements`)
      ]);
      setAsset(assetRes.data || assetRes);
      setMovements(movementsRes.data || movementsRes);
    } catch (err: any) {
      setError(err.message || "Failed to load asset details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleActionClick = async (type: "ASSIGN" | "TRANSFER" | "RETURN") => {
    setActionType(type);
    if (employees.length === 0) {
      const [empRes, locRes] = await Promise.all([
        fetchApi<any>("/employees"),
        fetchApi<any>("/locations")
      ]);
      setEmployees(empRes.data || empRes);
      setLocations(locRes.data || locRes);
    }
  };

  const submitAction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = 
        actionType === "ASSIGN" ? `/assets/${id}/assign` :
        actionType === "TRANSFER" ? `/assets/${id}/transfer` :
        `/assets/${id}/return`;
        
      await fetchApi(endpoint, {
        method: "POST",
        body: JSON.stringify({
          employeeId: actionType !== "RETURN" ? actionForm.employeeId : undefined,
          locationId: actionForm.locationId,
          reason: actionForm.reason,
        }),
      });
      
      setActionType(null);
      setActionForm({ employeeId: "", locationId: "", reason: "" });
      loadData();
    } catch (err: any) {
      alert("Action failed: " + (err.data?.message || err.message));
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading asset details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!asset) return <div className="p-8 text-center">Asset not found</div>;

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <PageHeader
        title={asset.name}
        description={`Patrimony: ${asset.patrimonyNumber} • Brand: ${asset.brand} • Model: ${asset.model}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {asset.status === AssetStatus.AVAILABLE && (
              <Button size="sm" onClick={() => handleActionClick("ASSIGN")}>
                <UserCheck className="mr-2 h-4 w-4" />
                Assign
              </Button>
            )}
            {asset.status === AssetStatus.IN_USE && (
              <>
                <Button size="sm" variant="outline" onClick={() => handleActionClick("TRANSFER")}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Transfer
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleActionClick("RETURN")}>
                  <CornerDownLeft className="mr-2 h-4 w-4" />
                  Return
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-950 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold mb-4">Chain of Custody (Movements)</h3>
            <DataTable 
              data={movements}
              columns={[
                { key: "movementType", header: "Type" },
                { key: "reason", header: "Reason" },
                { key: "date", header: "Date", render: (m: any) => new Date(m.createdAt).toLocaleString() },
              ]}
              keyExtractor={(m: any) => m.id}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-950 rounded-xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-semibold border-b border-slate-200 dark:border-slate-800 pb-2">Asset Status</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500">Current state:</span>
              <StatusBadge status={asset.status} />
            </div>
            {asset.assignedEmployeeId && (
              <div>
                <span className="text-sm font-medium text-slate-500 block">Custodian:</span>
                <span className="text-sm text-slate-900 dark:text-slate-100">{asset.assignedEmployeeId}</span>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-slate-500 block">Serial Number:</span>
              <span className="text-sm font-mono text-slate-900 dark:text-slate-100">{asset.serialNumber || "N/A"}</span>
            </div>
          </div>

          {actionType && (
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-6 border border-blue-100 dark:border-blue-900 space-y-4">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {actionType === "ASSIGN" ? "Assign Asset" : actionType === "TRANSFER" ? "Transfer Asset" : "Return Asset"}
              </h3>
              <form onSubmit={submitAction} className="space-y-4">
                {actionType !== "RETURN" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Employee</label>
                    <select
                      value={actionForm.employeeId}
                      onChange={(e) => setActionForm({...actionForm, employeeId: e.target.value})}
                      required
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      <option value="">Select Employee...</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Location</label>
                  <select
                    value={actionForm.locationId}
                    onChange={(e) => setActionForm({...actionForm, locationId: e.target.value})}
                    required
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="">Select Location...</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Reason</label>
                  <input
                    type="text"
                    required
                    value={actionForm.reason}
                    onChange={(e) => setActionForm({...actionForm, reason: e.target.value})}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" type="submit" className="w-full">Confirm</Button>
                  <Button size="sm" type="button" variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

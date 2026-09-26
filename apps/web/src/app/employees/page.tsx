"use client";

import * as React from "react";
import { PageHeader, DataTable, SearchInput, Button } from "@veylix/ui";
import { fetchApi } from "@/lib/api-client";
import { Users, Mail, Building, Briefcase } from "lucide-react";

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [employees, setEmployees] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        const data = await fetchApi<any[]>("/employees");
        setEmployees(data || []);
      } catch (err) {
        console.error("Failed to load employees", err);
      } finally {
        setLoading(false);
      }
    };
    loadEmployees();
  }, []);

  const filteredEmployees = React.useMemo(() => {
    if (!searchTerm) return employees;
    const term = searchTerm.toLowerCase();
    return employees.filter(
      (e) =>
        e.name?.toLowerCase().includes(term) ||
        e.employeeNumber?.toLowerCase().includes(term) ||
        e.department?.toLowerCase().includes(term) ||
        e.email?.toLowerCase().includes(term),
    );
  }, [searchTerm, employees]);

  const columns = [
    {
      key: "employeeNumber",
      header: "Employee ID",
      render: (item: any) => (
        <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
          {item.employeeNumber}
        </span>
      ),
    },
    {
      key: "name",
      header: "Name & Contact",
      render: (item: any) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">
            {item.name}
          </p>
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
            <Mail className="h-3 w-3" />
            {item.email}
          </span>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (item: any) => (
        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <Building className="h-3 w-3" />
          {item.department}
        </span>
      ),
    },
    {
      key: "position",
      header: "Position / Role",
      render: (item: any) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
          <Briefcase className="h-3 w-3" />
          {item.position}
        </span>
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
          {item.isActive ? "Active Custodian" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <PageHeader
        title="Corporate Employees"
        description="Directory of verified personnel authorized for corporate asset custody (INV-001)."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 sm:w-80">
          <SearchInput
            placeholder="Search by name, ID, department..."
            onSearchChange={setSearchTerm}
          />
        </div>
      </div>

      <DataTable
        data={filteredEmployees}
        columns={columns}
        keyExtractor={(item) => item.id}
        page={1}
        totalPages={1}
        loading={loading}
        emptyTitle="No employees found"
        emptyDescription="Employee records loaded from enterprise directory."
      />
    </div>
  );
}

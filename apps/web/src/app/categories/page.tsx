"use client";

import * as React from "react";
import { PageHeader, DataTable, SearchInput } from "@veylix/ui";
import { fetchApi } from "@/lib/api-client";
import { FolderTree, Tag } from "lucide-react";

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await fetchApi<any[]>("/categories");
        setCategories(data || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const filteredCategories = React.useMemo(() => {
    if (!searchTerm) return categories;
    const term = searchTerm.toLowerCase();
    return categories.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        c.code?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term),
    );
  }, [searchTerm, categories]);

  const columns = [
    {
      key: "code",
      header: "Category Code",
      render: (item: any) => (
        <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
          {item.code}
        </span>
      ),
    },
    {
      key: "name",
      header: "Category Name",
      render: (item: any) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-blue-500" />
            {item.name}
          </p>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (item: any) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {item.description || "—"}
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
          {item.isActive ? "Active Classification" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <PageHeader
        title="Asset Categories"
        description="Asset taxonomy, classifications, and lifecycle groups."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 sm:w-80">
          <SearchInput
            placeholder="Search by name, code, description..."
            onSearchChange={setSearchTerm}
          />
        </div>
      </div>

      <DataTable
        data={filteredCategories}
        columns={columns}
        keyExtractor={(item) => item.id}
        page={1}
        totalPages={1}
        loading={loading}
        emptyTitle="No categories found"
        emptyDescription="Classification groups configured in the system."
      />
    </div>
  );
}

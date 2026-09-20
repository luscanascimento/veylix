"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader, Button, Input } from "@veylix/ui";
import { fetchApi } from "@/lib/api-client";
import { ArrowLeft, Save } from "lucide-react";

export default function NewAssetPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reference data for selects
  const [categories, setCategories] = React.useState<any[]>([]);
  const [locations, setLocations] = React.useState<any[]>([]);

  const [formData, setFormData] = React.useState({
    patrimonyNumber: "",
    name: "",
    categoryId: "",
    locationId: "",
    brand: "",
    model: "",
    serialNumber: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    purchaseValue: 0,
    description: "",
  });

  React.useEffect(() => {
    async function loadRefs() {
      try {
        const [cats, locs] = await Promise.all([
          fetchApi<any>("/categories"),
          fetchApi<any>("/locations"),
        ]);
        setCategories(cats.data || cats || []);
        setLocations(locs.data || locs || []);
      } catch (err) {
        console.error("Failed to load reference data", err);
      }
    }
    loadRefs();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await fetchApi("/assets", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      router.push("/assets");
      router.refresh();
    } catch (err: any) {
      setError(err.data?.message || err.message || "Failed to create asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 max-w-4xl">
      <PageHeader
        title="Register New Asset"
        description="Add a new physical asset to the inventory."
        actions={
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800"
      >
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 rounded-md">
            {typeof error === "string" ? error : JSON.stringify(error)}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Patrimony Number *</label>
            <Input
              name="patrimonyNumber"
              placeholder="AST-YYYY-NNNN"
              value={formData.patrimonyNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Asset Name *</label>
            <Input
              name="name"
              placeholder="e.g. MacBook Pro 16 M3"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category *</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:focus-visible:ring-blue-400"
            >
              <option value="">Select Category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Location *</label>
            <select
              name="locationId"
              value={formData.locationId}
              onChange={handleChange}
              required
              className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:focus-visible:ring-blue-400"
            >
              <option value="">Select Location...</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Brand *</label>
            <Input
              name="brand"
              placeholder="e.g. Apple"
              value={formData.brand}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Model *</label>
            <Input
              name="model"
              placeholder="e.g. MacBook Pro 16"
              value={formData.model}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Serial Number</label>
            <Input
              name="serialNumber"
              placeholder="Optional"
              value={formData.serialNumber}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Purchase Date *</label>
            <Input
              name="purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Purchase Value *</label>
            <Input
              name="purchaseValue"
              type="number"
              step="0.01"
              min="0"
              value={formData.purchaseValue}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="flex w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:focus-visible:ring-blue-400"
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Asset"}
            {!loading && <Save className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}

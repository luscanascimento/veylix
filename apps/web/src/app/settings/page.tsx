"use client";

import * as React from "react";
import { PageHeader, Card, Button, Input } from "@veylix/ui";
import { useAuth } from "@/contexts/auth-context";
import { Shield, User, Server, Terminal, Lock } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <PageHeader
        title="Settings & System Diagnostics"
        description="User profile details, role permissions, and platform operational status."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Profile */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <User className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Authenticated Profile
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs font-medium text-slate-500">
                Full Name
              </label>
              <Input
                value={user?.name || "System Admin"}
                readOnly
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">
                Email Address
              </label>
              <Input
                value={user?.email || "admin@veylix.local"}
                readOnly
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">
                System Role
              </label>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-blue-100 dark:bg-blue-950 px-2.5 py-1 text-xs font-semibold text-blue-800 dark:text-blue-300">
                  <Shield className="h-3.5 w-3.5" />
                  {user?.role || "ADMIN"}
                </span>
                <span className="text-xs text-slate-500">
                  Full administrative permissions
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* System Diagnostics & Platform Info */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Server className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Platform & Architecture
            </h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/50">
              <span className="text-slate-500">Release Version</span>
              <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                v1.0.0
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/50">
              <span className="text-slate-500">Architecture</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                Modular Monolith
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/50">
              <span className="text-slate-500">Database Engine</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                PostgreSQL 16 + Prisma ORM
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/50">
              <span className="text-slate-500">Concurrency Guard</span>
              <span className="font-mono text-xs text-slate-800 dark:text-slate-200">
                Pessimistic FOR UPDATE + Versioning
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Observability</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                OpenTelemetry + Prometheus
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

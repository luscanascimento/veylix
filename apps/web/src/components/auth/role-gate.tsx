"use client";

import React from "react";
import { useAuth } from "@/contexts/auth-context";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

export function RoleGate({
  children,
  allowedRoles,
  fallback = null,
}: RoleGateProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

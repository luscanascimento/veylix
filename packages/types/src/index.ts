// Domain Enums
export enum AssetStatus {
  AVAILABLE = "AVAILABLE",
  IN_USE = "IN_USE",
  MAINTENANCE = "MAINTENANCE",
  RETIRED = "RETIRED",
  LOST = "LOST",
}

export enum MovementType {
  ASSIGNMENT = "ASSIGNMENT",
  RETURN = "RETURN",
  TRANSFER = "TRANSFER",
  LOCATION_CHANGE = "LOCATION_CHANGE",
  RETIREMENT = "RETIREMENT",
}

export enum MaintenanceStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum MaintenancePriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum UserRole {
  ADMIN = "ADMIN",
  OPERATOR = "OPERATOR",
  VIEWER = "VIEWER",
}

// API Standard Responses
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    totalItems?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    cursor?: string;
  };
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  requestId: string;
  details?: Record<string, unknown>;
}

export interface HealthCheckResponse {
  status: "ok" | "error";
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  checks?: {
    database: {
      status: "up" | "down";
      latencyMs?: number;
      message?: string;
    };
  };
}

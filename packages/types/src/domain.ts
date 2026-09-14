import { AssetStatus, MaintenancePriority, MaintenanceStatus, MovementType, UserRole } from './index';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date | null;
}

export interface Employee extends BaseEntity {
  employeeNumber: string;
  name: string;
  email: string;
  department: string;
  position: string;
  isActive: boolean;
}

export interface Category extends BaseEntity {
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface Location extends BaseEntity {
  code: string;
  name: string;
  building: string;
  floor: string | null;
  room: string | null;
  isActive: boolean;
}

export interface Asset extends BaseEntity {
  patrimonyNumber: string;
  name: string;
  categoryId: string;
  locationId: string;
  assignedEmployeeId: string | null;
  brand: string;
  model: string;
  serialNumber: string | null;
  status: AssetStatus;
  purchaseDate: Date;
  purchaseValue: number;
  description: string | null;
  version: number;
}

export interface AssetMovement {
  id: string;
  movementNumber: string;
  assetId: string;
  fromEmployeeId: string | null;
  toEmployeeId: string | null;
  fromLocationId: string;
  toLocationId: string;
  reason: string;
  movementType: MovementType;
  performedByUserId: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface Maintenance extends BaseEntity {
  ticketNumber: string;
  assetId: string;
  title: string;
  description: string;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  cost: number | null;
  openedByUserId: string;
  closedByUserId: string | null;
  openedAt: Date;
  closedAt: Date | null;
  resolutionNotes: string | null;
}

export interface AuditLog {
  id: string;
  eventName: string;
  actorUserId: string | null;
  ipAddress: string;
  userAgent: string;
  requestId: string;
  traceId: string | null;
  resourceType: string;
  resourceId: string;
  changes: Record<string, any>;
  createdAt: Date;
}

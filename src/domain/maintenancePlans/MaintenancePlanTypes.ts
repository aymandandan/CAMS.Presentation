// ──────────────────────────────────────────────
// Data Transfer Objects (mirror backend DTOs)
// ──────────────────────────────────────────────

import { SortablePaginationRequestInfo } from "../shared";

export interface PlannedTaskDetailsDto {
  taskId: string;
  order: number;
  taskDescription: string;
  estimatedDurationValue: number;
  estimatedDurationUnit: string;
}

export interface MaterialRequirementDetailsDto {
  itemId: string;
  itemSku: string;
  itemName: string;
  itemDescription?: string;
  quantity: number;
  unitOfMeasure: string;
}

export interface MaintenancePlanListItemDto {
  id: string;
  code: string;
  description: string;
  cycleDays: number;
  categoryId: string;
  categoryName: string;
  isActive: boolean;
}

export interface MaintenancePlanDetailsDto {
  id: string;
  code: string;
  description: string;
  cycleDays: number;
  categoryId: string;
  categoryName: string;
  isActive: boolean;
  tasks: PlannedTaskDetailsDto[];
  materialRequirements: MaterialRequirementDetailsDto[];
}

// ──────────────────────────────────────────────
// Command / Request Types (mutations)
// ──────────────────────────────────────────────

export interface PlannedTaskInput {
  taskId: string;
  order: number;
}

export interface MaterialRequirementInput {
  itemId: string;
  quantity: number;
  unitOfMeasure: string;
}

export interface CreateMaintenancePlanRequest {
  code: string;
  categoryId: string;
  cycleDays: number;
  description: string;
  tasks: PlannedTaskInput[];
  materialRequirements?: MaterialRequirementInput[];
}

export interface UpdateMaintenancePlanRequest {
  planId: string; // included in the body for validation on PUT
  cycleDays?: number;
  description?: string;
  tasks?: PlannedTaskInput[];
  materialRequirements?: MaterialRequirementInput[];
}

// ──────────────────────────────────────────────
// Query Parameters for List Endpoint
// ──────────────────────────────────────────────

export interface MaintenancePlansQueryParams extends SortablePaginationRequestInfo {
  categoryId?: string;
  isActive?: boolean;
}

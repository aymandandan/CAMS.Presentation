import { SortablePaginationRequestInfo } from "../shared";

// --------------- Enums ---------------
export enum EquipmentStatus {
  Operational = "Operational",
  UnderMaintenance = "Under Maintenance",
  Decommissioned = "Decommissioned",
}

// --------------- DTOs ---------------
export interface EquipmentSpecificationsDto {
  installationDate?: string; // ISO date string
  weight?: number;
  weightUnit?: string;
  customAttributes: Record<string, string>;
}

export interface EquipmentListItemDto {
  id: string;
  code: string;
  name: string;
  location: string; // location name
  category: string; // category name
  trade: string; // trade name
  status: EquipmentStatus;
}

export interface EquipmentDetailsDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  location: string; // location name (for display)
  locationPath: string;
  locationId: string; // <-- needed for editing
  category: string; // category name
  categoryId: string; // <-- needed for editing
  trade: string; // trade name
  tradeId: string; // <-- needed for editing
  status: EquipmentStatus;
  decomissionDate?: string;
  notes?: string;
  specifications: EquipmentSpecificationsDto;
}

// --------------- Commands (Mutations) ---------------
export interface CreateEquipmentRequest {
  code: string;
  name: string;
  description?: string;
  locationId: string;
  categoryId: string;
  tradeId: string;
  status?: EquipmentStatus; // defaults to Operational
  notes?: string;
  specifications?: EquipmentSpecificationsDto;
}

export interface UpdateEquipmentRequest {
  equipmentId: string;
  name?: string;
  description?: string;
  locationId?: string;
  categoryId?: string;
  tradeId?: string;
  notes?: string;
  specifications?: EquipmentSpecificationsDto;
}

// --------------- Query Parameters ---------------
export interface EquipmentSearchParams extends SortablePaginationRequestInfo {
  locationId?: string;
  categoryId?: string;
  tradeId?: string;
}

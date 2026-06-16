// ---------- DTOs (from backend) ----------

import { SortablePaginationRequestInfo } from "../shared";

export interface MaterialItemStockLevelDto {
  storeId: string;
  storeCode: string;
  storeName: string;
  storeAddress?: string;
  onHand: number;
  reserved: number;
  available: number;
  unit: string;
}

export interface MaterialItemListItemDto {
  id: string;
  sku: string;
  storeId?: string | null;
  storeName: string;
  name: string;
  available: number;
  unit: string;
  reorderLevel: number;
  isStockable: boolean;
}

export interface MaterialItemDetailsDto {
  id: string;
  sku: string;
  name: string;
  description?: string;
  unit: string;
  unitCost: number;
  currency: string;
  reorderLevel: number;
  isStockable: boolean;
  specifications: Record<string, string>;
  stockLevels: MaterialItemStockLevelDto[];
}

// ---------- Query Parameters ----------

export interface GetMaterialItemsQueryParams extends SortablePaginationRequestInfo {
  storeId?: string;
  lowStockOnly?: boolean;
  aggregateAcrossStores?: boolean; // new: if true, sums availability across stores
}

// ---------- Commands (Requests) ----------

export interface CreateMaterialItemRequest {
  isStockable: boolean;
  storeId?: string; // optional, required only if initial stock > 0
  initialStock?: number;
  name: string;
  description?: string;
  unitOfMeasureSymbol: string;
  specifications?: Record<string, string>;
  reorderLevel: number;
  unitCostAmount: number;
  unitCostCurrency: string;
}

export interface UpdateMaterialItemRequest {
  id: string;
  name: string;
  description?: string;
  reorderLevel?: number;
  unitCostAmount?: number;
  specifications?: Record<string, string>;
}

export interface ReserveStockRequest {
  materialItemId: string;
  storeId: string;
  quantity: number;
  notes?: string;
}

export interface ReleaseReservationRequest {
  materialItemId: string;
  storeId: string;
  quantity: number;
  notes?: string;
}

export interface AdjustStockRequest {
  materialItemId: string;
  storeId: string;
  signedAdjustment: number;
  notes?: string;
}

export interface TransferStockRequest {
  materialItemId: string;
  sourceStoreId: string;
  destinationStoreId: string;
  quantity: number;
  notes?: string;
}

export interface AddItemToStoresRequest {
  materialItemId: string;
  stores: { storeId: string; initialQuantity: number }[];
}

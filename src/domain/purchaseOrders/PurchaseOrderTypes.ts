import { SortablePaginationRequestInfo } from "../shared";

// --------------- Enums ---------------
export enum PurchaseOrderStatus {
  Draft = "Draft",
  Received = "Received",
  Cancelled = "Cancelled",
}

// --------------- DTOs ---------------
export interface PurchaseOrderListItemDto {
  id: string;
  vendorId: string;
  vendorName: string;
  orderDate: string; // ISO date string
  status: string; // PurchaseOrderStatus as string
  totalLines: number;
  totalAmount?: number;
  currency?: string;
  receivedAt?: string;
}

export interface PurchaseOrderLineItemDto {
  itemId: string;
  sku: string;
  itemName: string;
  storeId: string;
  storeCode: string;
  storeName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  currency: string;
  lineTotal: number;
}

export interface PurchaseOrderDetailsDto {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorEmail?: string;
  vendorPhone?: string;
  orderDate: string;
  status: string;
  receivedAt?: string;
  lines: PurchaseOrderLineItemDto[];
  totalAmount: number;
  currency: string;
}

// --------------- Input Types (for commands) ---------------
export interface PurchaseOrderLineInput {
  itemId: string;
  storeId: string;
  quantity: number;
  unitSymbol: string;
  unitPriceAmount: number;
  unitPriceCurrency: string;
}

export interface CreatePurchaseOrderRequest {
  vendorId: string;
  orderDate: string; // ISO date string
  lines: PurchaseOrderLineInput[];
}

// --------------- Query Parameters ---------------
export interface GetPurchaseOrdersQueryParams extends SortablePaginationRequestInfo {
  vendorId?: string;
  status?: PurchaseOrderStatus;
  fromDate?: string; // ISO date string
  toDate?: string;
}

// ── Work Orders ──
export interface WorkOrderAssignmentDto {
  id: string;
  code: string;
  description: string;
  scheduledDate?: string;
}

export interface WorkOrderSummaryDto {
  statusCounts: Record<string, number>;
  urgentCount: number;
  criticalCount: number;
  myAssignments: WorkOrderAssignmentDto[];
  pendingAssignmentCount: number;
  upcomingSchedule: WorkOrderAssignmentDto[];
}

// ── Equipment ──
export interface EquipmentRecentDto {
  id: string;
  code: string;
  name: string;
  status: string;
  lastModifiedDate: string;
}

export interface EquipmentSummaryDto {
  statusCounts: Record<string, number>;
  recentlyModified: EquipmentRecentDto[];
}

// ── Material Items ──
export interface LowStockItemDto {
  sku: string;
  name: string;
  availableQuantity: number;
  unit: string;
}

export interface CurrencyTotalDto {
  currency: string;
  totalValue: number;
}

export interface MaterialItemSummaryDto {
  lowStockItemCount: number;
  lowStockItems: LowStockItemDto[];
  totalStockValues: CurrencyTotalDto[];
}

// ── Stock Transactions ──
export interface RecentStockTransactionDto {
  id: string;
  transactionDate: string;
  type: string;
  itemSku: string;
  itemName: string;
  storeCode: string;
  signedQuantity: number;
  unit: string;
}

export interface StockTransactionSummaryDto {
  recentTransactions: RecentStockTransactionDto[];
}

// ── Maintenance Plans ──
export interface MaintenancePlanSummaryDto {
  activeCount: number;
  inactiveCount: number;
  upcomingPlanWorkOrders: WorkOrderAssignmentDto[];
}

// ── Purchase Orders ──
export interface RecentPurchaseOrderDto {
  id: string;
  vendorName: string;
  receivedAt: string;
  totalAmount: number;
  currency: string;
}

export interface PurchaseOrderSummaryDto {
  draftCount: number;
  recentlyReceived: RecentPurchaseOrderDto[];
}

// ── Users & Roles ──
export interface UsersSummaryDto {
  totalUsers: number;
  activeUsers: number;
}

export interface RolesSummaryDto {
  totalRoles: number;
}

export interface WorkOrderTrendDto {
  dailyCounts: number[];
}

export interface WorkOrderMonthlyItemDto {
  month: number; // 1-12
  corrective: number;
  preventive: number;
}

export interface WorkOrderMonthlyDto {
  items: WorkOrderMonthlyItemDto[];
}

export interface EquipmentDowntimeTrendDto {
  dailyHours: number[];
}

export interface MaterialItemValueTrendDto {
  dailyValues: number[]; // decimal on the server, represented as number in TS
}

export interface WorkOrderCalendarItemDto {
  date: string; // ISO date string
  count: number;
}

export interface WorkOrderCalendarDto {
  items: WorkOrderCalendarItemDto[];
}

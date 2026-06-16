import axiosClient from "@/infrastructure/api/axiosClient";
import type {
  WorkOrderSummaryDto,
  EquipmentSummaryDto,
  MaterialItemSummaryDto,
  StockTransactionSummaryDto,
  MaintenancePlanSummaryDto,
  PurchaseOrderSummaryDto,
  UsersSummaryDto,
  RolesSummaryDto,
  EquipmentDowntimeTrendDto,
  MaterialItemValueTrendDto,
  WorkOrderCalendarDto,
  WorkOrderMonthlyDto,
  WorkOrderTrendDto,
} from "@/domain/dashboard/DashboardTypes";

function extractData<T>(response: any): T {
  const result = response.data;
  if (!result.succeeded) {
    const message = result.error ?? "Dashboard request failed";
    throw new Error(message);
  }
  return result.data;
}

export async function getDashboardWorkOrders(): Promise<WorkOrderSummaryDto> {
  const response = await axiosClient.get<WorkOrderSummaryDto>(
    "/dashboard/work-orders",
  );
  return extractData<WorkOrderSummaryDto>(response);
}

export async function getDashboardEquipment(): Promise<EquipmentSummaryDto> {
  const response = await axiosClient.get<EquipmentSummaryDto>(
    "/dashboard/equipment",
  );
  return extractData<EquipmentSummaryDto>(response);
}

export async function getDashboardMaterialItems(): Promise<MaterialItemSummaryDto> {
  const response = await axiosClient.get<MaterialItemSummaryDto>(
    "/dashboard/material-items",
  );
  return extractData<MaterialItemSummaryDto>(response);
}

export async function getDashboardStockTransactions(
  count: number = 5,
): Promise<StockTransactionSummaryDto> {
  const response = await axiosClient.get<StockTransactionSummaryDto>(
    "/dashboard/stock-transactions",
    { params: { count } },
  );
  return extractData<StockTransactionSummaryDto>(response);
}

export async function getDashboardMaintenancePlans(): Promise<MaintenancePlanSummaryDto> {
  const response = await axiosClient.get<MaintenancePlanSummaryDto>(
    "/dashboard/maintenance-plans",
  );
  return extractData<MaintenancePlanSummaryDto>(response);
}

export async function getDashboardPurchaseOrders(): Promise<PurchaseOrderSummaryDto> {
  const response = await axiosClient.get<PurchaseOrderSummaryDto>(
    "/dashboard/purchase-orders",
  );
  return extractData<PurchaseOrderSummaryDto>(response);
}

export async function getDashboardUsers(): Promise<UsersSummaryDto> {
  const response = await axiosClient.get<UsersSummaryDto>("/dashboard/users");
  return extractData<UsersSummaryDto>(response);
}

export async function getDashboardRoles(): Promise<RolesSummaryDto> {
  const response = await axiosClient.get<RolesSummaryDto>("/dashboard/roles");
  return extractData<RolesSummaryDto>(response);
}

export async function getWorkOrderTrend(
  days: number = 30,
): Promise<WorkOrderTrendDto> {
  const response = await axiosClient.get<WorkOrderTrendDto>(
    "/dashboard/work-orders/trend",
    { params: { days } },
  );
  return extractData<WorkOrderTrendDto>(response);
}

export async function getWorkOrderMonthly(
  year: number,
): Promise<WorkOrderMonthlyDto> {
  const response = await axiosClient.get<WorkOrderMonthlyDto>(
    "/dashboard/work-orders/monthly",
    { params: { year } },
  );
  return extractData<WorkOrderMonthlyDto>(response);
}

export async function getEquipmentDowntimeTrend(
  days: number = 30,
): Promise<EquipmentDowntimeTrendDto> {
  const response = await axiosClient.get<EquipmentDowntimeTrendDto>(
    "/dashboard/equipment/downtime",
    { params: { days } },
  );
  return extractData<EquipmentDowntimeTrendDto>(response);
}

export async function getMaterialItemValueTrend(
  days: number = 30,
): Promise<MaterialItemValueTrendDto> {
  const response = await axiosClient.get<MaterialItemValueTrendDto>(
    "/dashboard/material-items/value-trend",
    { params: { days } },
  );
  return extractData<MaterialItemValueTrendDto>(response);
}

export async function getWorkOrderCalendar(
  from: string, // ISO date string
  to: string,
): Promise<WorkOrderCalendarDto> {
  const response = await axiosClient.get<WorkOrderCalendarDto>(
    "/dashboard/work-orders/calendar",
    { params: { from, to } },
  );
  return extractData<WorkOrderCalendarDto>(response);
}

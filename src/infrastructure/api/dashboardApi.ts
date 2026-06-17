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
import { extractData, getErrorMessage } from "@/lib/utils/ResponseUtils";

export async function getDashboardWorkOrders(): Promise<WorkOrderSummaryDto> {
  try {
    const response = await axiosClient.get<WorkOrderSummaryDto>(
      "/dashboard/work-orders",
    );
    return extractData<WorkOrderSummaryDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getDashboardEquipment(): Promise<EquipmentSummaryDto> {
  try {
    const response = await axiosClient.get<EquipmentSummaryDto>(
      "/dashboard/equipment",
    );
    return extractData<EquipmentSummaryDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getDashboardMaterialItems(): Promise<MaterialItemSummaryDto> {
  try {
    const response = await axiosClient.get<MaterialItemSummaryDto>(
      "/dashboard/material-items",
    );
    return extractData<MaterialItemSummaryDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getDashboardStockTransactions(
  count: number = 5,
): Promise<StockTransactionSummaryDto> {
  try {
    const response = await axiosClient.get<StockTransactionSummaryDto>(
      "/dashboard/stock-transactions",
      { params: { count } },
    );
    return extractData<StockTransactionSummaryDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getDashboardMaintenancePlans(): Promise<MaintenancePlanSummaryDto> {
  try {
    const response = await axiosClient.get<MaintenancePlanSummaryDto>(
      "/dashboard/maintenance-plans",
    );
    return extractData<MaintenancePlanSummaryDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getDashboardPurchaseOrders(): Promise<PurchaseOrderSummaryDto> {
  try {
    const response = await axiosClient.get<PurchaseOrderSummaryDto>(
      "/dashboard/purchase-orders",
    );
    return extractData<PurchaseOrderSummaryDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getDashboardUsers(): Promise<UsersSummaryDto> {
  try {
    const response = await axiosClient.get<UsersSummaryDto>("/dashboard/users");
    return extractData<UsersSummaryDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getDashboardRoles(): Promise<RolesSummaryDto> {
  try {
    const response = await axiosClient.get<RolesSummaryDto>("/dashboard/roles");
    return extractData<RolesSummaryDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getWorkOrderTrend(
  days: number = 30,
): Promise<WorkOrderTrendDto> {
  try {
    const response = await axiosClient.get<WorkOrderTrendDto>(
      "/dashboard/work-orders/trend",
      { params: { days } },
    );
    return extractData<WorkOrderTrendDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getWorkOrderMonthly(
  year: number,
): Promise<WorkOrderMonthlyDto> {
  try {
    const response = await axiosClient.get<WorkOrderMonthlyDto>(
      "/dashboard/work-orders/monthly",
      { params: { year } },
    );
    return extractData<WorkOrderMonthlyDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getEquipmentDowntimeTrend(
  days: number = 30,
): Promise<EquipmentDowntimeTrendDto> {
  try {
    const response = await axiosClient.get<EquipmentDowntimeTrendDto>(
      "/dashboard/equipment/downtime",
      { params: { days } },
    );
    return extractData<EquipmentDowntimeTrendDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getMaterialItemValueTrend(
  days: number = 30,
): Promise<MaterialItemValueTrendDto> {
  try {
    const response = await axiosClient.get<MaterialItemValueTrendDto>(
      "/dashboard/material-items/value-trend",
      { params: { days } },
    );
    return extractData<MaterialItemValueTrendDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getWorkOrderCalendar(
  from: string, // ISO date string
  to: string,
): Promise<WorkOrderCalendarDto> {
  try {
    const response = await axiosClient.get<WorkOrderCalendarDto>(
      "/dashboard/work-orders/calendar",
      { params: { from, to } },
    );
    return extractData<WorkOrderCalendarDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

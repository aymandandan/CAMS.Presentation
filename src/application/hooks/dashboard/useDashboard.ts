import { useQuery, useQueries } from "@tanstack/react-query";
import {
  getDashboardWorkOrders,
  getDashboardEquipment,
  getDashboardMaterialItems,
  getDashboardStockTransactions,
  getDashboardMaintenancePlans,
  getDashboardPurchaseOrders,
  getDashboardUsers,
  getDashboardRoles,
  getEquipmentDowntimeTrend,
  getMaterialItemValueTrend,
  getWorkOrderCalendar,
  getWorkOrderMonthly,
  getWorkOrderTrend,
} from "@/infrastructure/api/dashboardApi";

// ── Centralized default refetch interval ──
const DEFAULT_DASHBOARD_REFETCH_INTERVAL = 60_000; // 1 minute

// ── Helper to compute the effective interval ──
function resolveRefetchInterval(
  autoRefresh: boolean,
  intervalMs?: number,
): number | false {
  return autoRefresh
    ? (intervalMs ?? DEFAULT_DASHBOARD_REFETCH_INTERVAL)
    : false;
}

// ── Individual hooks ──

export function useWorkOrderDashboard(
  permissionEnabled: boolean = true,
  autoRefresh: boolean = true,
  refetchIntervalMs?: number,
) {
  return useQuery({
    queryKey: ["dashboard", "workOrders"],
    queryFn: getDashboardWorkOrders,
    enabled: permissionEnabled,
    refetchInterval: resolveRefetchInterval(autoRefresh, refetchIntervalMs),
  });
}

export function useEquipmentDashboard(
  permissionEnabled: boolean = true,
  autoRefresh: boolean = true,
  refetchIntervalMs?: number,
) {
  return useQuery({
    queryKey: ["dashboard", "equipment"],
    queryFn: getDashboardEquipment,
    enabled: permissionEnabled,
    refetchInterval: resolveRefetchInterval(autoRefresh, refetchIntervalMs),
  });
}

export function useMaterialItemDashboard(
  permissionEnabled: boolean = true,
  autoRefresh: boolean = true,
  refetchIntervalMs?: number,
) {
  return useQuery({
    queryKey: ["dashboard", "materialItems"],
    queryFn: getDashboardMaterialItems,
    enabled: permissionEnabled,
    refetchInterval: resolveRefetchInterval(autoRefresh, refetchIntervalMs),
  });
}

export function useStockTransactionDashboard(
  permissionEnabled: boolean = true,
  autoRefresh: boolean = true,
  refetchIntervalMs?: number,
) {
  return useQuery({
    queryKey: ["dashboard", "stockTransactions"],
    queryFn: () => getDashboardStockTransactions(5),
    enabled: permissionEnabled,
    refetchInterval: resolveRefetchInterval(autoRefresh, refetchIntervalMs),
  });
}

export function useMaintenancePlanDashboard(
  permissionEnabled: boolean = true,
  autoRefresh: boolean = true,
  refetchIntervalMs?: number,
) {
  return useQuery({
    queryKey: ["dashboard", "maintenancePlans"],
    queryFn: getDashboardMaintenancePlans,
    enabled: permissionEnabled,
    refetchInterval: resolveRefetchInterval(autoRefresh, refetchIntervalMs),
  });
}

export function usePurchaseOrderDashboard(
  permissionEnabled: boolean = true,
  autoRefresh: boolean = true,
  refetchIntervalMs?: number,
) {
  return useQuery({
    queryKey: ["dashboard", "purchaseOrders"],
    queryFn: getDashboardPurchaseOrders,
    enabled: permissionEnabled,
    refetchInterval: resolveRefetchInterval(autoRefresh, refetchIntervalMs),
  });
}

export function useUsersDashboard(
  permissionEnabled: boolean = true,
  autoRefresh: boolean = true,
  refetchIntervalMs?: number,
) {
  return useQuery({
    queryKey: ["dashboard", "users"],
    queryFn: getDashboardUsers,
    enabled: permissionEnabled,
    refetchInterval: resolveRefetchInterval(autoRefresh, refetchIntervalMs),
  });
}

export function useRolesDashboard(
  permissionEnabled: boolean = true,
  autoRefresh: boolean = true,
  refetchIntervalMs?: number,
) {
  return useQuery({
    queryKey: ["dashboard", "roles"],
    queryFn: getDashboardRoles,
    enabled: permissionEnabled,
    refetchInterval: resolveRefetchInterval(autoRefresh, refetchIntervalMs),
  });
}

export function useWorkOrderTrend(
  days: number = 30,
  permissionEnabled: boolean = true,
  autoRefresh: boolean = true,
  refetchIntervalMs?: number,
) {
  return useQuery({
    queryKey: ["dashboard", "workOrderTrend", days],
    queryFn: () => getWorkOrderTrend(days),
    enabled: permissionEnabled,
    refetchInterval: resolveRefetchInterval(autoRefresh, refetchIntervalMs),
  });
}

export function useWorkOrderMonthly(
  year: number,
  permissionEnabled: boolean = true,
  autoRefresh: boolean = true,
  refetchIntervalMs?: number,
) {
  return useQuery({
    queryKey: ["dashboard", "workOrderMonthly", year],
    queryFn: () => getWorkOrderMonthly(year),
    enabled: permissionEnabled,
    refetchInterval: resolveRefetchInterval(autoRefresh, refetchIntervalMs),
  });
}

export function useEquipmentDowntimeTrend(
  days: number = 30,
  permissionEnabled: boolean = true,
  autoRefresh: boolean = true,
  refetchIntervalMs?: number,
) {
  return useQuery({
    queryKey: ["dashboard", "equipmentDowntimeTrend", days],
    queryFn: () => getEquipmentDowntimeTrend(days),
    enabled: permissionEnabled,
    refetchInterval: resolveRefetchInterval(autoRefresh, refetchIntervalMs),
  });
}

export function useMaterialItemValueTrend(
  days: number = 30,
  permissionEnabled: boolean = true,
  autoRefresh: boolean = true,
  refetchIntervalMs?: number,
) {
  return useQuery({
    queryKey: ["dashboard", "materialItemValueTrend", days],
    queryFn: () => getMaterialItemValueTrend(days),
    enabled: permissionEnabled,
    refetchInterval: resolveRefetchInterval(autoRefresh, refetchIntervalMs),
  });
}

export function useWorkOrderCalendar(
  from: string,
  to: string,
  permissionEnabled: boolean = true,
  autoRefresh: boolean = true,
  refetchIntervalMs?: number,
) {
  return useQuery({
    queryKey: ["dashboard", "workOrderCalendar", from, to],
    queryFn: () => getWorkOrderCalendar(from, to),
    enabled: permissionEnabled,
    refetchInterval: resolveRefetchInterval(autoRefresh, refetchIntervalMs),
  });
}

// ── Combined hook ──

export interface UseDashboardParams {
  canViewWorkOrders?: boolean;
  canViewEquipment?: boolean;
  canViewMaterialItems?: boolean;
  canViewStockTransactions?: boolean;
  canViewMaintenancePlans?: boolean;
  canViewPurchaseOrders?: boolean;
  canViewUsers?: boolean;
  canViewRoles?: boolean;
  // Global toggle & interval for all sub‑queries (can be overridden per query if needed)
  autoRefresh?: boolean;
  refetchIntervalMs?: number;
  workOrderTrendDays?: number;
  workOrderMonthlyYear?: number;
  equipmentDowntimeDays?: number;
  materialItemValueTrendDays?: number;
  workOrderCalendarFrom?: string; // ISO date string
  workOrderCalendarTo?: string;
}

export function useDashboard(permissions: UseDashboardParams) {
  const autoRefresh = permissions.autoRefresh ?? true;
  const intervalMs = permissions.refetchIntervalMs;

  const now = new Date();
  const currentYear = now.getFullYear();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  return useQueries({
    queries: [
      {
        queryKey: ["dashboard", "workOrders"],
        queryFn: getDashboardWorkOrders,
        enabled: permissions.canViewWorkOrders ?? false,
        refetchInterval: resolveRefetchInterval(autoRefresh, intervalMs),
      },
      {
        queryKey: ["dashboard", "equipment"],
        queryFn: getDashboardEquipment,
        enabled: permissions.canViewEquipment ?? false,
        refetchInterval: resolveRefetchInterval(autoRefresh, intervalMs),
      },
      {
        queryKey: ["dashboard", "materialItems"],
        queryFn: getDashboardMaterialItems,
        enabled: permissions.canViewMaterialItems ?? false,
        refetchInterval: resolveRefetchInterval(autoRefresh, intervalMs),
      },
      {
        queryKey: ["dashboard", "stockTransactions"],
        queryFn: () => getDashboardStockTransactions(5),
        enabled: permissions.canViewStockTransactions ?? false,
        refetchInterval: resolveRefetchInterval(autoRefresh, intervalMs),
      },
      {
        queryKey: ["dashboard", "maintenancePlans"],
        queryFn: getDashboardMaintenancePlans,
        enabled: permissions.canViewMaintenancePlans ?? false,
        refetchInterval: resolveRefetchInterval(autoRefresh, intervalMs),
      },
      {
        queryKey: ["dashboard", "purchaseOrders"],
        queryFn: getDashboardPurchaseOrders,
        enabled: permissions.canViewPurchaseOrders ?? false,
        refetchInterval: resolveRefetchInterval(autoRefresh, intervalMs),
      },
      {
        queryKey: ["dashboard", "users"],
        queryFn: getDashboardUsers,
        enabled: permissions.canViewUsers ?? false,
        refetchInterval: resolveRefetchInterval(autoRefresh, intervalMs),
      },
      {
        queryKey: ["dashboard", "roles"],
        queryFn: getDashboardRoles,
        enabled: permissions.canViewRoles ?? false,
        refetchInterval: resolveRefetchInterval(autoRefresh, intervalMs),
      },
      {
        queryKey: [
          "dashboard",
          "workOrderTrend",
          permissions.workOrderTrendDays ?? 30,
        ],
        queryFn: () => getWorkOrderTrend(permissions.workOrderTrendDays ?? 30),
        enabled: permissions.canViewWorkOrders ?? false,
        refetchInterval: resolveRefetchInterval(autoRefresh, intervalMs),
      },
      {
        queryKey: [
          "dashboard",
          "workOrderMonthly",
          permissions.workOrderMonthlyYear ?? currentYear,
        ],
        queryFn: () =>
          getWorkOrderMonthly(permissions.workOrderMonthlyYear ?? currentYear),
        enabled: permissions.canViewWorkOrders ?? false,
        refetchInterval: resolveRefetchInterval(autoRefresh, intervalMs),
      },
      {
        queryKey: [
          "dashboard",
          "equipmentDowntimeTrend",
          permissions.equipmentDowntimeDays ?? 30,
        ],
        queryFn: () =>
          getEquipmentDowntimeTrend(permissions.equipmentDowntimeDays ?? 30),
        enabled: permissions.canViewEquipment ?? false,
        refetchInterval: resolveRefetchInterval(autoRefresh, intervalMs),
      },
      {
        queryKey: [
          "dashboard",
          "materialItemValueTrend",
          permissions.materialItemValueTrendDays ?? 30,
        ],
        queryFn: () =>
          getMaterialItemValueTrend(
            permissions.materialItemValueTrendDays ?? 30,
          ),
        enabled: permissions.canViewMaterialItems ?? false,
        refetchInterval: resolveRefetchInterval(autoRefresh, intervalMs),
      },
      {
        queryKey: [
          "dashboard",
          "workOrderCalendar",
          permissions.workOrderCalendarFrom ?? defaultFrom,
          permissions.workOrderCalendarTo ?? defaultTo,
        ],
        queryFn: () =>
          getWorkOrderCalendar(
            permissions.workOrderCalendarFrom ?? defaultFrom,
            permissions.workOrderCalendarTo ?? defaultTo,
          ),
        enabled: permissions.canViewWorkOrders ?? false,
        refetchInterval: resolveRefetchInterval(autoRefresh, intervalMs),
      },
    ],
  });
}

import { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardStatCard from "./DashboardStatCard";
import {
  useWorkOrderDashboard,
  useWorkOrderTrend,
} from "@/application/hooks/dashboard/useDashboard";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import { useTrendDirection } from "@/application/hooks/useTrendDirection";
import { WorkOrderStatus } from "@/domain/workOrders/WorkOrderTypes";

export default function WorkOrderStatCard() {
  const navigate = useNavigate();
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useWorkOrderDashboard();
  const {
    data: trend,
    isLoading: trendLoading,
    error: trendError,
  } = useWorkOrderTrend(30);

  const openCount = useMemo(() => {
    if (!summary) return 0;
    return Object.entries(summary.statusCounts)
      .filter(([status]) => status !== "Closed")
      .reduce((sum, [, v]) => sum + v, 0);
  }, [summary]);

  const sparklineData = useMemo(() => trend?.dailyCounts ?? [], [trend]);

  const { direction, percentChange } = useTrendDirection(sparklineData);

  const handleClick = useCallback(() => {
    navigate(`/work-orders?status=${WorkOrderStatus.InProgress}`);
  }, [navigate]);

  const isLoading = summaryLoading || trendLoading;
  const error = summaryError || trendError;

  return (
    <Can requiredPermissions={[Permissions.WorkOrders.View]}>
      <DashboardStatCard
        title="Open Work Orders"
        value={openCount}
        interval="Last 30 days"
        trend={direction}
        percentChange={percentChange}
        data={sparklineData}
        onClick={handleClick}
        loading={isLoading}
        error={error as Error | null}
      />
    </Can>
  );
}

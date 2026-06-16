import { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardStatCard from "./DashboardStatCard";
import {
  useEquipmentDashboard,
  useEquipmentDowntimeTrend,
} from "@/application/hooks/dashboard/useDashboard";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import { useTrendDirection } from "@/application/hooks/useTrendDirection";

export default function EquipmentStatCard() {
  const navigate = useNavigate();
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useEquipmentDashboard();
  const {
    data: downtimeTrend,
    isLoading: trendLoading,
    error: trendError,
  } = useEquipmentDowntimeTrend(30);

  const totalEquipment = useMemo(() => {
    if (!summary) return 0;
    return Object.values(summary.statusCounts).reduce((a, b) => a + b, 0);
  }, [summary]);

  const sparklineData = useMemo(
    () => downtimeTrend?.dailyHours ?? [],
    [downtimeTrend],
  );

  const { direction, percentChange } = useTrendDirection(sparklineData);

  const handleClick = useCallback(() => {
    navigate("/equipment");
  }, [navigate]);

  const isLoading = summaryLoading || trendLoading;
  const error = summaryError || trendError;

  return (
    <Can requiredPermissions={[Permissions.Equipment.View]}>
      <DashboardStatCard
        title="Total Equipment"
        value={totalEquipment}
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

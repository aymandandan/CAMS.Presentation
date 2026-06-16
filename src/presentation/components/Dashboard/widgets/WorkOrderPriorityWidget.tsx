import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart } from "@mui/x-charts/BarChart";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import { useWorkOrderDashboard } from "@/application/hooks/dashboard/useDashboard";

const PRIORITY_COLORS = ["#9e9e9e", "#ff9800", "#f44336"];
const PRIORITY_LABELS = ["Normal", "Urgent", "Critical"];

export default function WorkOrderPriorityWidget() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useWorkOrderDashboard();

  const chartData = useMemo(() => {
    if (!data) return { series: [], xLabels: [] };
    const allOpen = Object.entries(data.statusCounts)
      .filter(([status]) => status !== "Closed")
      .reduce((sum, [, v]) => sum + v, 0);
    const normalOpen = Math.max(
      0,
      allOpen - data.urgentCount - data.criticalCount,
    );
    return {
      series: [{ data: [normalOpen, data.urgentCount, data.criticalCount] }],
      xLabels: PRIORITY_LABELS,
    };
  }, [data]);

  if (isLoading) {
    return (
      <Card variant="outlined">
        <CardHeader title="Priority Breakdown" />
        <CardContent>
          <Skeleton variant="rectangular" height={200} />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card variant="outlined">
        <CardHeader title="Priority Breakdown" />
        <CardContent>
          <Alert severity="error">{(error as Error)?.message}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Can requiredPermissions={[Permissions.WorkOrders.View]}>
      <Card variant="outlined">
        <CardHeader title="Priority Breakdown" />
        <CardContent>
          <BarChart
            xAxis={[{ scaleType: "band", data: chartData.xLabels, height: 30 }]}
            series={chartData.series.map((s, idx) => ({
              ...s,
              color: PRIORITY_COLORS[idx],
            }))}
            height={200}
            grid={{ vertical: true }}
            onAxisClick={(_, d) => {
              if (d && d.axisValue) {
                navigate(
                  `/work-orders?priority=${encodeURIComponent(String(d.axisValue))}`,
                );
              }
            }}
          />
        </CardContent>
      </Card>
    </Can>
  );
}

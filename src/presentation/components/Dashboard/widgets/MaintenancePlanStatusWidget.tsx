import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart } from "@mui/x-charts/PieChart";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import { useMaintenancePlanDashboard } from "@/application/hooks/dashboard/useDashboard";
import { CenterLabel } from "../../common/CenterLabel";

export default function MaintenancePlanStatusWidget() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useMaintenancePlanDashboard();

  const chartData = useMemo(() => {
    if (!data) return { segments: [], total: 0 };
    const segments = [
      { id: 0, value: data.activeCount, label: "Active", color: "#4caf50" },
      { id: 1, value: data.inactiveCount, label: "Inactive", color: "#9e9e9e" },
    ];
    return { segments, total: data.activeCount + data.inactiveCount };
  }, [data]);

  // Navigate on any segment click
  const handleItemClick = () => navigate("/maintenance-plans");

  return (
    <Can requiredPermissions={[Permissions.MaintenancePlans.View]}>
      <Card variant="outlined">
        <CardHeader title="Maintenance Plans" />
        <CardContent sx={{ display: "flex", justifyContent: "center" }}>
          {isLoading ? (
            <Skeleton variant="circular" width={180} height={180} />
          ) : isError ? (
            <Alert severity="error">{(error as Error)?.message}</Alert>
          ) : (
            <PieChart
              series={[
                { data: chartData.segments, innerRadius: 55, outerRadius: 85 },
              ]}
              width={200}
              height={200}
              margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
              hideLegend
              onItemClick={handleItemClick}
            >
              <CenterLabel total={chartData.total} />
            </PieChart>
          )}
        </CardContent>
      </Card>
    </Can>
  );
}

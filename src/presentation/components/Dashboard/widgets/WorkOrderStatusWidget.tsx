import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart } from "@mui/x-charts/PieChart";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import { useTheme } from "@mui/material/styles";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import { useWorkOrderDashboard } from "@/application/hooks/dashboard/useDashboard";
import { CenterLabel } from "../../common/CenterLabel";

// Map status to theme colour key (used to resolve from palette)
const statusToColorKey: Record<string, string> = {
  Draft: "grey",
  Scheduled: "secondary",
  InProgress: "primary",
  Terminated: "error",
  NotPerformed: "warning",
  Closed: "success",
};

export default function WorkOrderStatusWidget() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { data, isLoading, isError, error } = useWorkOrderDashboard();
  const [hideClosed, setHideClosed] = useState(true);

  const chartData = useMemo(() => {
    if (!data) return { segments: [], total: 0 };
    const filtered = { ...data.statusCounts };
    if (hideClosed) {
      delete filtered["Closed"];
    }
    const total = Object.values(filtered).reduce((sum, v) => sum + v, 0);
    const segments = Object.entries(filtered).map(([status, count], index) => {
      const colorKey = statusToColorKey[status] || "grey";
      // Resolve colour from theme
      let color: string;
      if (colorKey === "grey") {
        color = theme.palette.grey[500];
      } else {
        color =
          (theme.palette as any)[colorKey]?.main || theme.palette.grey[500];
      }
      return {
        id: index,
        value: count,
        label: status,
        color,
      };
    });
    return { segments, total };
  }, [data, hideClosed, theme]);

  const handleItemClick = (_event: any, pieItemIdentifier: any) => {
    const segment = chartData.segments[pieItemIdentifier.dataIndex];
    if (segment) {
      navigate(`/work-orders?status=${encodeURIComponent(segment.label)}`);
    }
  };

  return (
    <Can requiredPermissions={[Permissions.WorkOrders.View]}>
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardHeader
          title="Work Orders"
          action={
            <ToggleButtonGroup
              size="small"
              value={hideClosed ? "hide" : "show"}
              exclusive
              onChange={(_, val) => val && setHideClosed(val === "hide")}
            >
              <ToggleButton value="hide">Hide Closed</ToggleButton>
              <ToggleButton value="show">All</ToggleButton>
            </ToggleButtonGroup>
          }
        />
        <CardContent>
          {isLoading ? (
            <Skeleton variant="circular" width={200} height={200} />
          ) : isError ? (
            <Alert severity="error">{(error as Error)?.message}</Alert>
          ) : chartData.segments.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center">
              No work orders.
            </Typography>
          ) : (
            <>
              <PieChart
                series={[
                  {
                    data: chartData.segments,
                    innerRadius: 60,
                    outerRadius: 90,
                    paddingAngle: 2,
                    cornerRadius: 4,
                    highlightScope: { fade: "global", highlight: "item" },
                  },
                ]}
                width={220}
                height={220}
                margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                hideLegend
                onItemClick={handleItemClick}
              >
                <CenterLabel total={chartData.total} />
              </PieChart>
              <Stack spacing={0.5} sx={{ mt: 1 }}>
                {chartData.segments.map((seg) => (
                  <Stack
                    key={seg.label}
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center" }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: seg.color,
                      }}
                    />
                    <Typography variant="caption">
                      {seg.label}: {seg.value}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </>
          )}
        </CardContent>
      </Card>
    </Can>
  );
}

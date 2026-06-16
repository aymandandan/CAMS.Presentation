import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart } from "@mui/x-charts/PieChart";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import { useTheme } from "@mui/material/styles";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import { useEquipmentDashboard } from "@/application/hooks/dashboard/useDashboard";
import { CenterLabel } from "../../common/CenterLabel";

// Map equipment status to theme colour key
const statusToColorKey: Record<string, string> = {
  Operational: "secondary",
  UnderMaintenance: "warning",
  Decommissioned: "error",
};

export default function EquipmentStatusWidget() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { data, isLoading, isError, error } = useEquipmentDashboard();

  const chartData = useMemo(() => {
    if (!data) return { segments: [], total: 0 };
    const total = Object.values(data.statusCounts).reduce(
      (sum, v) => sum + v,
      0,
    );
    const segments = Object.entries(data.statusCounts).map(
      ([status, count], index) => {
        const colorKey = statusToColorKey[status] || "grey";
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
      },
    );
    return { segments, total };
  }, [data, theme]);

  const handleItemClick = (_event: any, pieItemIdentifier: any) => {
    const segment = chartData.segments[pieItemIdentifier.dataIndex];
    if (segment) {
      navigate(`/equipment?status=${encodeURIComponent(segment.label)}`);
    }
  };

  return (
    <Can requiredPermissions={[Permissions.Equipment.View]}>
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardHeader title="Equipment Status" />
        <CardContent>
          {isLoading ? (
            <Skeleton variant="circular" width={200} height={200} />
          ) : isError ? (
            <Alert severity="error">{(error as Error)?.message}</Alert>
          ) : chartData.segments.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center">
              No equipment found.
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
                    highlightScope: { fade: "global", highlight: "item" }, // added for hover effect
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

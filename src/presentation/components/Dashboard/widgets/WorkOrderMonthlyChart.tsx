import { useMemo } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import { useTheme } from "@mui/material/styles";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import { useWorkOrderMonthly } from "@/application/hooks/dashboard/useDashboard";

const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function WorkOrderMonthlyChart() {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  const { data, isLoading, isError, error } = useWorkOrderMonthly(currentYear);

  const chartData = useMemo(() => {
    if (!data?.items) return { xLabels: [], series: [] };
    const items = data.items;
    return {
      xLabels: items.map(
        (item) => MONTH_ABBR[item.month - 1] || item.month.toString(),
      ),
      series: [
        {
          data: items.map((item) => item.corrective),
          label: "Corrective",
          color: theme.palette.warning.main,
        },
        {
          data: items.map((item) => item.preventive),
          label: "Preventive",
          color: theme.palette.success.main,
        },
      ],
    };
  }, [data, theme]);

  return (
    <Can requiredPermissions={[Permissions.WorkOrders.View]}>
      <Card variant="outlined">
        <CardHeader title="Monthly Work Orders" />
        <CardContent>
          {isLoading ? (
            <Skeleton variant="rectangular" height={200} />
          ) : isError ? (
            <Alert severity="error">{(error as Error)?.message}</Alert>
          ) : (
            <BarChart
              xAxis={[{ scaleType: "band", data: chartData.xLabels }]}
              series={chartData.series.map((s) => ({ ...s, stack: "total" }))}
              height={200}
            />
          )}
        </CardContent>
      </Card>
    </Can>
  );
}

import { MouseEvent, useMemo } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { lineClasses } from "@mui/x-charts/LineChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { useTheme } from "@mui/material/styles";

// Helper to generate date labels for the xAxis
function getDateLabels(days: number): string[] {
  const now = new Date();
  const labels: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    labels.push(
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    );
  }
  return labels;
}

function AreaGradient({ color, id }: { color: string; id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  interval: string; // e.g., "Last 30 days"
  trend: "up" | "down" | "neutral";
  percentChange?: number | null;
  data: number[];
  onClick?: (event: MouseEvent) => void;
  loading?: boolean;
  error?: Error | null;
}

export default function DashboardStatCard({
  title,
  value,
  interval,
  trend,
  percentChange,
  data,
  onClick,
  loading = false,
  error = null,
}: DashboardStatCardProps) {
  const theme = useTheme();

  // Determine trend colors based on mode
  const trendColors = {
    up:
      theme.palette.mode === "light"
        ? theme.palette.success.main
        : theme.palette.success.dark,
    down:
      theme.palette.mode === "light"
        ? theme.palette.error.main
        : theme.palette.error.dark,
    neutral:
      theme.palette.mode === "light"
        ? theme.palette.grey[400]
        : theme.palette.grey[700],
  };
  const chipColor =
    trend === "up" ? "success" : trend === "down" ? "error" : "default";
  const chartColor = trendColors[trend];

  // Build the trend label (show percentage when available)
  let trendLabel: string;
  if (percentChange !== undefined && percentChange !== null) {
    const sign = trend === "up" ? "+" : "";
    trendLabel = `${sign}${percentChange.toFixed(0)}%`;
  } else {
    trendLabel = trend === "up" ? "+25%" : trend === "down" ? "-25%" : "0%";
  }

  const chipIcon =
    trend === "up" ? (
      <TrendingUpIcon fontSize="small" />
    ) : trend === "down" ? (
      <TrendingDownIcon fontSize="small" />
    ) : undefined;

  // Generate xAxis labels based on data length
  const xLabels = useMemo(() => getDateLabels(data.length), [data.length]);

  // Unique ID for gradient (sanitize title)
  const gradientId = `area-gradient-${title.replace(/\s/g, "")}`;

  // Loading state
  if (loading) {
    return (
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardContent>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="rectangular" height={40} sx={{ mt: 1 }} />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card variant="outlined" sx={{ height: "100%" }}>
        <CardContent>
          <Alert severity="error" sx={{ alignItems: "center" }}>
            {error.message}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": onClick
          ? {
              transform: "translateY(-4px)",
              boxShadow: theme.shadows[4],
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Typography variant="subtitle2" gutterBottom color="text.secondary">
          {title}
        </Typography>
        <Stack
          direction="column"
          sx={{ justifyContent: "space-between", flexGrow: 1, gap: 1 }}
        >
          <Stack sx={{ justifyContent: "space-between" }}>
            <Stack
              direction="row"
              sx={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <Typography variant="h4" component="p">
                {value}
              </Typography>
              <Chip
                size="small"
                color={chipColor}
                label={trendLabel}
                icon={chipIcon}
                sx={{ fontWeight: 500 }}
              />
            </Stack>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {interval}
            </Typography>
          </Stack>
          <Box sx={{ width: "100%", height: 50 }}>
            {data.length > 0 ? (
              <SparkLineChart
                color={chartColor}
                data={data}
                area
                showHighlight
                showTooltip
                xAxis={{
                  scaleType: "band",
                  data: xLabels,
                }}
                sx={{
                  [`& .${lineClasses.area}`]: {
                    fill: `url(#${gradientId})`,
                  },
                }}
              >
                <AreaGradient color={chartColor} id={gradientId} />
              </SparkLineChart>
            ) : (
              <Typography variant="caption" color="text.secondary">
                No data available
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

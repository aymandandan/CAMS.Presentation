import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Timeline from "@mui/lab/Timeline";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import AssignmentIcon from "@mui/icons-material/Assignment";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import AddIcon from "@mui/icons-material/Add";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import { useWorkOrderDashboard } from "@/application/hooks/dashboard/useDashboard";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useState } from "react";

dayjs.extend(relativeTime);

function groupByDate(items: any[]) {
  const groups: Record<string, any[]> = {};
  items.forEach((item) => {
    const date = item.scheduledDate
      ? dayjs(item.scheduledDate).format("YYYY-MM-DD")
      : "Unscheduled";
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
  });
  return groups;
}

export default function WorkOrdersOverviewWidget() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { data, isLoading, isError, error } = useWorkOrderDashboard();
  const [countdown, setCountdown] = useState("");

  // Countdown to the next upcoming work order (first in upcomingSchedule)
  const nextWO = data?.upcomingSchedule?.[0];
  useEffect(() => {
    if (!nextWO?.scheduledDate) return;
    const update = () => {
      const now = dayjs();
      const sched = dayjs(nextWO.scheduledDate);
      const diff = sched.diff(now, "minute");
      if (diff <= 0) setCountdown("Starting now");
      else if (diff < 60) setCountdown(`In ${diff}m`);
      else if (diff < 1440) setCountdown(`In ${Math.floor(diff / 60)}h`);
      else setCountdown(sched.fromNow());
    };
    update();
    const timer = setInterval(update, 30_000);
    return () => clearInterval(timer);
  }, [nextWO]);

  // Derived counts from the response
  const urgentCount = data?.urgentCount ?? 0;
  const criticalCount = data?.criticalCount ?? 0;
  const pendingAssignCount = data?.pendingAssignmentCount ?? 0;
  const myAssignments = data?.myAssignments ?? [];
  const upcoming = data?.upcomingSchedule ?? [];

  // Whether there is any data at all
  const hasAnyData =
    !isLoading &&
    !isError &&
    urgentCount +
      criticalCount +
      pendingAssignCount +
      myAssignments.length +
      upcoming.length >
      0;

  // Group upcoming items for the timeline
  const upcomingGroups = upcoming.length > 0 ? groupByDate(upcoming) : {};

  return (
    <Can requiredPermissions={[Permissions.WorkOrders.View]}>
      <Card
        variant="outlined"
        sx={{
          height: "100%",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <CardHeader
          title="Work Orders"
          action={
            !isLoading && hasAnyData && countdown ? (
              <Chip
                icon={<ScheduleIcon />}
                label={countdown}
                color="secondary"
                size="small"
                variant="outlined"
              />
            ) : null
          }
        />
        <CardContent sx={{ py: 0, px: 2 }}>
          {isLoading ? (
            <Box>
              <Skeleton
                variant="rectangular"
                height={60}
                sx={{ mb: 2, borderRadius: 1 }}
              />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
            </Box>
          ) : isError ? (
            <Alert severity="error">{(error as Error)?.message}</Alert>
          ) : !hasAnyData ? (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <CalendarMonthIcon
                sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary" gutterBottom>
                No work orders to show
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => navigate("/work-orders/new")}
              >
                Create Work Order
              </Button>
            </Box>
          ) : (
            <>
              {/* Top stat chips */}
              <Grid container spacing={1} sx={{ mb: 2 }}>
                {(urgentCount > 0 || criticalCount > 0) && (
                  <Grid size={{ xs: 6 }}>
                    <Chip
                      icon={<WarningAmberIcon />}
                      label={`Urgent/Critical: ${urgentCount + criticalCount}`}
                      color="error"
                      size="small"
                      variant="outlined"
                      sx={{ width: "100%", justifyContent: "flex-start" }}
                    />
                  </Grid>
                )}
                {pendingAssignCount > 0 && (
                  <Grid size={{ xs: 6 }}>
                    <Chip
                      icon={<PersonOutlineIcon />}
                      label={`Unassigned: ${pendingAssignCount}`}
                      color="warning"
                      size="small"
                      variant="outlined"
                      sx={{ width: "100%", justifyContent: "flex-start" }}
                    />
                  </Grid>
                )}
              </Grid>

              {/* My Assignments */}
              {myAssignments.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="overline" color="text.secondary">
                    My Assignments
                  </Typography>
                  <Box sx={{ maxHeight: 120, overflowY: "auto" }}>
                    {myAssignments.slice(0, 3).map((wo) => (
                      <Box
                        key={wo.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          py: 0.5,
                          cursor: "pointer",
                          borderRadius: 1,
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                        onClick={() => navigate(`/work-orders/${wo.id}`)}
                      >
                        <AssignmentIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "primary.main" }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {wo.code}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {wo.scheduledDate
                              ? dayjs(wo.scheduledDate).format("MMM D, h:mm A")
                              : "Not scheduled"}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                    {myAssignments.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{myAssignments.length - 3} more
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}

              {/* Upcoming Schedule (timeline) */}
              {upcoming.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="overline" color="text.secondary">
                    Upcoming
                  </Typography>
                  {Object.entries(upcomingGroups).map(([date, items]) => {
                    const isToday = dayjs(date).isSame(dayjs(), "day");
                    const isTomorrow = dayjs(date).isSame(
                      dayjs().add(1, "day"),
                      "day",
                    );
                    const label = isToday
                      ? "Today"
                      : isTomorrow
                        ? "Tomorrow"
                        : dayjs(date).format("ddd, MMM D");

                    return (
                      <Box key={date} sx={{ mb: 0.5 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          {label}
                        </Typography>
                        <Timeline
                          sx={{
                            [`& .${timelineItemClasses.root}:before`]: {
                              flex: 0,
                            },
                            px: 0,
                          }}
                        >
                          {items.slice(0, 3).map((wo, idx) => (
                            <TimelineItem
                              key={wo.id}
                              sx={{ cursor: "pointer" }}
                              onClick={() => navigate(`/work-orders/${wo.id}`)}
                            >
                              <TimelineSeparator>
                                <TimelineDot
                                  color={
                                    idx === 0 && isToday ? "error" : "primary"
                                  }
                                  variant={idx === 0 ? "filled" : "outlined"}
                                  sx={{ width: 10, height: 10, m: 0 }}
                                />
                                {idx < items.length - 1 && (
                                  <TimelineConnector />
                                )}
                              </TimelineSeparator>
                              <TimelineContent sx={{ py: 0.5 }}>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 500 }}
                                  noWrap
                                >
                                  {wo.code}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {wo.scheduledDate
                                    ? dayjs(wo.scheduledDate).format("h:mm A")
                                    : "Not scheduled"}
                                </Typography>
                              </TimelineContent>
                            </TimelineItem>
                          ))}
                        </Timeline>
                      </Box>
                    );
                  })}
                </Box>
              )}

              <Button
                fullWidth
                variant="text"
                size="small"
                onClick={() => navigate("/work-orders")}
                sx={{ mt: 0.5 }}
              >
                View all work orders
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Can>
  );
}

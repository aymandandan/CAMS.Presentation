import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import { useWorkOrderDashboard } from "@/application/hooks/dashboard/useDashboard";
import dayjs from "dayjs";

export default function UpcomingWorkOrdersWidget() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { data, isLoading, isError, error } = useWorkOrderDashboard();

  const handleItemClick = (woId: string) => {
    navigate(`/work-orders/${woId}`);
  };

  const upcomingCount = data?.upcomingSchedule?.length ?? 0;

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
          title="Upcoming Schedule"
          action={
            <Chip
              label={isLoading ? "…" : upcomingCount}
              color="primary"
              size="small"
              variant="filled"
            />
          }
        />
        <CardContent>
          {isLoading ? (
            // Skeleton that mimics list items
            [...Array(5)].map((_, i) => (
              <Box
                key={i}
                sx={{ display: "flex", alignItems: "center", mb: 1 }}
              >
                <Skeleton
                  variant="circular"
                  width={24}
                  height={24}
                  sx={{ mr: 1 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </Box>
              </Box>
            ))
          ) : isError ? (
            <Alert severity="error">{(error as Error)?.message}</Alert>
          ) : upcomingCount === 0 ? (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                No upcoming work orders
              </Typography>
              <Button
                size="small"
                variant="text"
                onClick={() => navigate("/work-orders")}
              >
                View all
              </Button>
            </Box>
          ) : (
            <>
              <List dense disablePadding>
                {data!.upcomingSchedule.slice(0, 5).map((wo) => (
                  <ListItem
                    key={wo.id}
                    disableGutters
                    sx={{
                      cursor: "pointer",
                      borderRadius: 1,
                      px: 1,
                      py: 0.5,
                      transition: "background 0.15s",
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                    onClick={() => handleItemClick(wo.id)}
                  >
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CalendarMonthIcon
                        fontSize="small"
                        sx={{ color: theme.palette.primary.main }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" noWrap>
                          {wo.code}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {wo.scheduledDate
                            ? dayjs(wo.scheduledDate).format("MMM D, h:mm A")
                            : "Not scheduled"}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              {upcomingCount > 5 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  +{upcomingCount - 5} more
                </Typography>
              )}
              <Button
                size="small"
                variant="text"
                onClick={() => navigate("/work-orders")}
                sx={{ mt: 1 }}
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

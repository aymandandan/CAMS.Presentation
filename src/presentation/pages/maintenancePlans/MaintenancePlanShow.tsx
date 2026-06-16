import { useCallback, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import TaskIcon from "@mui/icons-material/Task";
import InventoryIcon from "@mui/icons-material/Inventory";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CategoryIcon from "@mui/icons-material/Category";
import PageContainer from "@/presentation/components/PageContainer";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import {
  useActivateMaintenancePlan,
  useDeactivateMaintenancePlan,
  useDeleteMaintenancePlan,
  useMaintenancePlan,
} from "@/application/hooks/maintenancePlans/useMaintenancePlans";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import { useDialogs } from "@/application/hooks/useDialogs/useDialogs";

export default function MaintenancePlanShow() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const locationRouter = useLocation();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const {
    data: plan,
    isLoading,
    isError,
    error,
    refetch,
  } = useMaintenancePlan(planId!);
  const activateMutation = useActivateMaintenancePlan();
  const deactivateMutation = useDeactivateMaintenancePlan();
  const deleteMutation = useDeleteMaintenancePlan();

  const goBack = useCallback(() => {
    const from = locationRouter.state?.from;

    const isEditOrCreatePage = (path: string): boolean => {
      return (
        /\/maintenance-plans\/create$/.test(path) ||
        /\/maintenance-plans\/.+\/edit$/.test(path)
      );
    };

    if (from && typeof from === "string" && !isEditOrCreatePage(from)) {
      navigate(from);
    } else {
      navigate("/maintenance-plans");
    }
  }, [navigate, locationRouter.state]);

  const handleDelete = useCallback(async () => {
    if (!plan) return;
    const confirmed = await dialogs.confirm(
      `Delete maintenance plan ${plan.code}?`,
      {
        title: "Delete Plan",
        severity: "error",
        okText: "Delete",
      },
    );
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(plan.id);
      notifications.show("Plan deleted successfully.", { severity: "success" });
      navigate("/maintenance-plans");
    } catch (err: any) {
      notifications.show(`Failed: ${err.message}`, { severity: "error" });
    }
  }, [plan, dialogs, deleteMutation, notifications, navigate]);

  const handleActivate = useCallback(async () => {
    if (!plan) return;
    try {
      await activateMutation.mutateAsync(plan.id);
      notifications.show("Plan activated.", { severity: "success" });
      refetch();
    } catch (err: any) {
      notifications.show(`Failed: ${err.message}`, { severity: "error" });
    }
  }, [plan, activateMutation, notifications, refetch]);

  const handleDeactivate = useCallback(async () => {
    if (!plan) return;
    try {
      await deactivateMutation.mutateAsync(plan.id);
      notifications.show("Plan deactivated.", { severity: "success" });
      refetch();
    } catch (err: any) {
      notifications.show(`Failed: ${err.message}`, { severity: "error" });
    }
  }, [plan, deactivateMutation, notifications, refetch]);

  const handleViewWorkOrders = useCallback(() => {
    navigate(`/work-orders?planId=${plan!.id}`);
  }, [plan, navigate]);

  const statusChip = useMemo(
    () => (
      <Chip
        label={plan?.isActive ? "Active" : "Inactive"}
        color={plan?.isActive ? "success" : "default"}
        size="medium"
        variant="outlined"
      />
    ),
    [plan],
  );

  const hasTasks = plan?.tasks && plan.tasks.length > 0;
  const hasMaterials =
    plan?.materialRequirements && plan.materialRequirements.length > 0;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !plan) {
    return (
      <Alert severity="error">
        {(error as Error)?.message || "Plan not found"}
      </Alert>
    );
  }

  return (
    <PageContainer
      title={`Plan ${plan.code}`}
      breadcrumbs={[
        { title: "Maintenance Plans", path: "/maintenance-plans" },
        { title: plan.code },
      ]}
    >
      {/* Top action bar */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 3, justifyContent: "space-between", flexWrap: "wrap" }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={goBack}
        >
          Back
        </Button>
        <Stack direction="row" spacing={2}>
          <Can requiredPermissions={[Permissions.MaintenancePlans.Update]}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/maintenance-plans/${plan.id}/edit`)}
            >
              Edit
            </Button>
          </Can>
          <Button
            variant="outlined"
            startIcon={<FormatListBulletedIcon />}
            onClick={handleViewWorkOrders}
          >
            Work Orders
          </Button>
        </Stack>
      </Stack>

      {/* Main plan card */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardHeader
          avatar={<BuildCircleIcon color="primary" sx={{ fontSize: 32 }} />}
          title={
            <Typography variant="h5" component="span" sx={{ fontWeight: 600 }}>
              {plan.code} - {plan.description}
            </Typography>
          }
          action={statusChip}
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <CalendarTodayIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="overline" color="textSecondary">
                    Cycle Days
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {plan.cycleDays}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <CategoryIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="overline" color="textSecondary">
                    Category
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {plan.categoryName}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tasks section */}
      <Card sx={{ mb: 3, boxShadow: 1 }}>
        <CardHeader
          avatar={<TaskIcon color="primary" />}
          title={
            <Typography variant="h6">
              Tasks{" "}
              {hasTasks && <Chip label={plan.tasks.length} size="small" />}
            </Typography>
          }
          subheader={!hasTasks ? "No tasks defined for this plan" : undefined}
        />
        {hasTasks && (
          <CardContent sx={{ pt: 0 }}>
            <List disablePadding>
              {plan.tasks.map((task) => (
                <ListItem key={task.taskId} divider sx={{ py: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Chip label={task.order} size="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {task.taskDescription}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="textSecondary">
                        Estimated duration: {task.estimatedDurationValue}{" "}
                        {task.estimatedDurationUnit}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        )}
      </Card>

      {/* Material Requirements section */}
      <Card sx={{ mb: 3, boxShadow: 1 }}>
        <CardHeader
          avatar={<InventoryIcon color="primary" />}
          title={
            <Typography variant="h6">
              Material Requirements{" "}
              {hasMaterials && (
                <Chip
                  label={plan.materialRequirements.length}
                  size="small"
                  color="primary"
                />
              )}
            </Typography>
          }
          subheader={
            !hasMaterials
              ? "No material requirements defined for this plan"
              : undefined
          }
        />
        {hasMaterials && (
          <CardContent sx={{ pt: 0 }}>
            <List disablePadding>
              {plan.materialRequirements.map((mat, idx) => (
                <ListItem key={idx} divider sx={{ py: 1.5 }}>
                  <ListItemText
                    primary={
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {mat.itemName} ({mat.itemSku})
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="textSecondary">
                        Qty: {mat.quantity} {mat.unitOfMeasure}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        )}
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* Bottom action bar */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ justifyContent: "flex-end", flexWrap: "wrap" }}
      >
        {!plan.isActive && (
          <Can requiredPermissions={[Permissions.MaintenancePlans.Activate]}>
            <Tooltip title="Start this maintenance plan">
              <Button
                variant="contained"
                color="success"
                startIcon={<PlayArrowIcon />}
                onClick={handleActivate}
                disabled={activateMutation.isPending}
              >
                Activate
              </Button>
            </Tooltip>
          </Can>
        )}
        {plan.isActive && (
          <Can requiredPermissions={[Permissions.MaintenancePlans.Deactivate]}>
            <Tooltip title="Pause this maintenance plan">
              <Button
                variant="contained"
                color="warning"
                startIcon={<PauseIcon />}
                onClick={handleDeactivate}
                disabled={deactivateMutation.isPending}
              >
                Deactivate
              </Button>
            </Tooltip>
          </Can>
        )}
        <Can requiredPermissions={[Permissions.MaintenancePlans.Delete]}>
          <Tooltip title="Permanently delete this plan">
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </Tooltip>
        </Can>
      </Stack>
    </PageContainer>
  );
}

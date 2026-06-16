import { useCallback } from "react";
import {
  useNavigate,
  useParams,
  useLocation as useLocationRouter,
} from "react-router-dom";
import {
  Box,
  CircularProgress,
  Alert,
  Grid,
  Typography,
  Divider,
  Stack,
  Button,
  Card,
  CardContent,
  CardHeader,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BuildIcon from "@mui/icons-material/Build";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import dayjs from "dayjs";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import PageContainer from "@/presentation/components/PageContainer";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import {
  useEquipment,
  useDeleteEquipment,
  useMarkUnderMaintenance,
  useDecommissionEquipment,
} from "@/application/hooks/equipment/useEquipment";
import { useDialogs } from "@/application/hooks/useDialogs/useDialogs";
import { EquipmentStatus } from "@/domain/equipment/EquipmentTypes";
import EquipmentStatusChip from "@/presentation/components/equipment/EquipmentStatusChip";

export default function EquipmentShow() {
  const { equipmentId } = useParams<{ equipmentId: string }>();
  const navigate = useNavigate();
  const locationRouter = useLocationRouter();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const {
    data: equipment,
    isLoading,
    isError,
    error,
    refetch,
  } = useEquipment(equipmentId!);
  const deleteMutation = useDeleteEquipment();
  const maintenanceMutation = useMarkUnderMaintenance();
  const decommissionMutation = useDecommissionEquipment();

  const handleDelete = useCallback(async () => {
    if (!equipment) return;
    const confirmed = await dialogs.confirm(
      `Delete equipment ${equipment.code}?`,
      { title: "Delete Equipment", severity: "error", okText: "Delete" },
    );
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(equipment.id);
      notifications.show("Equipment deleted successfully.", {
        severity: "success",
      });
      navigate("/equipment");
    } catch (err: any) {
      notifications.show(`Failed: ${err.message}`, { severity: "error" });
    }
  }, [equipment, dialogs, deleteMutation, notifications, navigate]);

  const handleMaintenance = useCallback(async () => {
    if (!equipment) return;
    const confirmed = await dialogs.confirm(
      `Mark ${equipment.code} as under maintenance?`,
      { title: "Change Status", severity: "warning", okText: "Confirm" },
    );
    if (!confirmed) return;
    try {
      await maintenanceMutation.mutateAsync(equipment.id);
      notifications.show("Status updated.", { severity: "success" });
      refetch();
    } catch (err: any) {
      notifications.show(`Failed: ${err.message}`, { severity: "error" });
    }
  }, [equipment, dialogs, maintenanceMutation, notifications, refetch]);

  const handleDecommission = useCallback(async () => {
    if (!equipment) return;
    const confirmed = await dialogs.confirm(
      `Decommission ${equipment.code}? This is irreversible.`,
      { title: "Decommission", severity: "error", okText: "Decommission" },
    );
    if (!confirmed) return;
    try {
      await decommissionMutation.mutateAsync(equipment.id);
      notifications.show("Equipment decommissioned.", { severity: "success" });
      refetch();
    } catch (err: any) {
      notifications.show(`Failed: ${err.message}`, { severity: "error" });
    }
  }, [equipment, dialogs, decommissionMutation, notifications, refetch]);

  const goBack = useCallback(() => {
    const from = locationRouter.state?.from;

    const isEditOrCreatePage = (path: string): boolean => {
      return (
        /\/equipment\/create$/.test(path) || /\/equipment\/.+\/edit$/.test(path)
      );
    };

    if (from && typeof from === "string" && !isEditOrCreatePage(from)) {
      navigate(from);
    } else {
      navigate("/equipment");
    }
  }, [navigate, locationRouter.state]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !equipment) {
    return (
      <Alert severity="error">
        {(error as Error)?.message || "Equipment not found"}
      </Alert>
    );
  }

  const hasCustomAttributes =
    Object.keys(equipment.specifications.customAttributes).length > 0;

  return (
    <PageContainer
      title={`Equipment ${equipment.code}`}
      breadcrumbs={[
        { title: "Equipment", path: "/equipment" },
        { title: equipment.code },
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
          <Can requiredPermissions={[Permissions.Equipment.Edit]}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/equipment/${equipmentId}/edit`)}
            >
              Edit
            </Button>
          </Can>
          <Button
            variant="outlined"
            startIcon={<FormatListBulletedIcon />}
            onClick={() => navigate(`/work-orders?equipmentId=${equipment.id}`)}
          >
            Work Orders
          </Button>
        </Stack>
      </Stack>

      {/* Equipment summary card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <BuildIcon color="primary" />
              <Typography variant="h5" component="span">
                {equipment.code} – {equipment.name}
              </Typography>
            </Stack>
          }
          action={<EquipmentStatusChip status={equipment.status} />}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="overline" color="textSecondary">
                Trade
              </Typography>
              <Typography variant="body1">{equipment.trade}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="overline" color="textSecondary">
                Category
              </Typography>
              <Typography variant="body1">{equipment.category}</Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="overline" color="textSecondary">
                Location
              </Typography>
              <Typography variant="body1">{equipment.locationPath}</Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="overline" color="textSecondary">
                Description
              </Typography>
              <Typography variant="body1">
                {equipment.description || "—"}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Specifications & dates */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Specifications & Dates" />
        <CardContent>
          <Grid container spacing={2}>
            {equipment.specifications.installationDate && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="overline" color="textSecondary">
                  Installation Date
                </Typography>
                <Typography variant="body1">
                  {dayjs(equipment.specifications.installationDate).format(
                    "LL",
                  )}
                </Typography>
              </Grid>
            )}
            {equipment.decomissionDate && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="overline" color="textSecondary">
                  Decommission Date
                </Typography>
                <Typography variant="body1">
                  {dayjs(equipment.decomissionDate).format("LL")}
                </Typography>
              </Grid>
            )}
            {equipment.specifications.weight !== undefined && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="overline" color="textSecondary">
                  Weight
                </Typography>
                <Typography variant="body1">
                  {equipment.specifications.weight}{" "}
                  {equipment.specifications.weightUnit}
                </Typography>
              </Grid>
            )}
            {hasCustomAttributes && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="overline" color="textSecondary">
                  Custom Attributes
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {Object.entries(
                    equipment.specifications.customAttributes,
                  ).map(([key, val]) => (
                    <Typography key={key} variant="body2">
                      {key}: {val}
                    </Typography>
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Notes */}
      {equipment.notes && (
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Notes" />
          <CardContent>
            <Typography variant="body1">{equipment.notes}</Typography>
          </CardContent>
        </Card>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Bottom action bar */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ justifyContent: "flex-end", flexWrap: "wrap" }}
      >
        <Can requiredPermissions={[Permissions.Equipment.ChangeStatus]}>
          {equipment.status !== EquipmentStatus.UnderMaintenance &&
            equipment.status !== EquipmentStatus.Decommissioned && (
              <Button
                variant="outlined"
                color="warning"
                startIcon={<BuildIcon />}
                onClick={handleMaintenance}
              >
                Mark Under Maintenance
              </Button>
            )}
          {equipment.status !== EquipmentStatus.Decommissioned && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={handleDecommission}
            >
              Decommission
            </Button>
          )}
        </Can>
        <Can requiredPermissions={[Permissions.Equipment.Delete]}>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Can>
      </Stack>
    </PageContainer>
  );
}

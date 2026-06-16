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
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BuildIcon from "@mui/icons-material/Build";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import {
  useDeleteLocation,
  useLocation,
} from "@/application/hooks/locations/useLocations";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import { useDialogs } from "@/application/hooks/useDialogs/useDialogs";
import PageContainer from "@/presentation/components/PageContainer";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";

const typeColorMap: Record<
  string,
  "primary" | "secondary" | "info" | "warning"
> = {
  Building: "primary",
  Floor: "secondary",
  Room: "info",
  Area: "warning",
};

export default function LocationShow() {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const locationRouter = useLocationRouter();

  const { data: location, isLoading, error } = useLocation(locationId);
  const deleteMutation = useDeleteLocation();

  const goBack = useCallback(() => {
    const from = locationRouter.state?.from;

    const isEditOrCreatePage = (path: string): boolean => {
      return (
        /\/locations\/create$/.test(path) || /\/locations\/.+\/edit$/.test(path)
      );
    };

    if (from && typeof from === "string" && !isEditOrCreatePage(from)) {
      navigate(from);
    } else {
      navigate("/locations");
    }
  }, [navigate, locationRouter.state]);

  const handleEdit = useCallback(() => {
    navigate(`/locations/${locationId}/edit`);
  }, [locationId, navigate]);

  const handleDelete = useCallback(async () => {
    if (!location) return;
    const confirmed = await dialogs.confirm(
      `Do you wish to delete ${location.name}?`,
      {
        title: `Delete location?`,
        severity: "error",
        okText: "Delete",
        cancelText: "Cancel",
      },
    );
    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(location.id);
        notifications.show("Location deleted successfully.", {
          severity: "success",
        });
        navigate("/locations");
      } catch (err: any) {
        notifications.show(
          `Failed to delete location. Reason: ${err.message}`,
          { severity: "error" },
        );
      }
    }
  }, [location, dialogs, deleteMutation, notifications, navigate]);

  const handleViewEquipment = useCallback(() => {
    navigate(`/equipment?locationId=${location!.id}`);
  }, [location, navigate]);

  if (isLoading) {
    return (
      <PageContainer title="Location">
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error || !location) {
    return (
      <PageContainer title="Location">
        <Alert severity="error">{error?.message || "Location not found"}</Alert>
      </PageContainer>
    );
  }

  const typeChipColor = typeColorMap[location.type] || "default";

  return (
    <PageContainer
      title={`Location ${location.code}`}
      breadcrumbs={[
        { title: "Locations", path: "/locations" },
        { title: location.code },
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
          <Can requiredPermissions={[Permissions.Locations.Update]}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit
            </Button>
          </Can>
          <Button
            variant="outlined"
            startIcon={<BuildIcon />}
            onClick={handleViewEquipment}
          >
            Equipment
          </Button>
        </Stack>
      </Stack>

      {/* Main location card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={<LocationOnIcon color="primary" />}
          title={
            <Typography variant="h5" component="span">
              {location.code} – {location.name}
            </Typography>
          }
          action={
            <Chip
              icon={<AccountTreeIcon />}
              label={location.type}
              color={typeChipColor}
              variant="filled"
              size="medium"
            />
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="overline" color="textSecondary">
                Description
              </Typography>
              <Typography variant="body1">
                {location.description || "—"}
              </Typography>
            </Grid>
            {location.parent && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="overline" color="textSecondary">
                  Parent Location
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={`${location.parent.code} - ${location.parent.name}`}
                    size="small"
                    onClick={() =>
                      navigate(`/locations/${location?.parent?.id || ""}`)
                    }
                    clickable
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* Bottom action bar */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ justifyContent: "flex-end", flexWrap: "wrap" }}
      >
        <Can requiredPermissions={[Permissions.Locations.Delete]}>
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

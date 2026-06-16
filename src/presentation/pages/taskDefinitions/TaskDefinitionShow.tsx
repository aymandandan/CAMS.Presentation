import { useCallback } from "react";
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import PageContainer from "@/presentation/components/PageContainer";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import {
  useTaskDefinition,
  useDeleteTaskDefinition,
} from "@/application/hooks/taskDefinitions/useTaskDefinitions";
import { useDialogs } from "@/application/hooks/useDialogs/useDialogs";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";

export default function TaskDefinitionShow() {
  const { taskDefinitionId } = useParams<{ taskDefinitionId: string }>();
  const navigate = useNavigate();
  const locationRouter = useLocation();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const {
    data: taskDefinition,
    isLoading,
    isError,
    error,
  } = useTaskDefinition(taskDefinitionId!);
  const deleteMutation = useDeleteTaskDefinition();

  const goBack = useCallback(() => {
    const from = locationRouter.state?.from;

    const isEditOrCreatePage = (path: string): boolean => {
      return (
        /\/task-definitions\/create$/.test(path) ||
        /\/task-definitions\/.+\/edit$/.test(path)
      );
    };

    if (from && typeof from === "string" && !isEditOrCreatePage(from)) {
      navigate(from);
    } else {
      navigate("/task-definitions");
    }
  }, [navigate, locationRouter.state]);

  const handleEdit = useCallback(() => {
    navigate(`/task-definitions/${taskDefinitionId}/edit`);
  }, [navigate, taskDefinitionId]);

  const handleDelete = useCallback(async () => {
    if (!taskDefinition) return;
    const confirmed = await dialogs.confirm(
      `Delete "${taskDefinition.description}"?`,
      {
        title: "Delete task definition?",
        severity: "error",
        okText: "Delete",
      },
    );
    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(taskDefinition.id);
        notifications.show("Task definition deleted.", {
          severity: "success",
        });
        navigate("/task-definitions");
      } catch (err: any) {
        notifications.show(`Delete failed: ${err.message}`, {
          severity: "error",
        });
      }
    }
  }, [taskDefinition, dialogs, deleteMutation, notifications, navigate]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !taskDefinition) {
    return (
      <Alert severity="error">
        {(error as Error)?.message || "Task definition not found"}
      </Alert>
    );
  }

  return (
    <PageContainer
      title={`Task Definition`}
      breadcrumbs={[
        { title: "Task Definitions", path: "/task-definitions" },
        { title: taskDefinition.description.substring(0, 30) + "..." },
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
          <Can requiredPermissions={[Permissions.TaskDefinitions.Edit]}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit
            </Button>
          </Can>
        </Stack>
      </Stack>

      {/* Main task definition card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={<TaskAltIcon color="primary" />}
          title={
            <Typography variant="h5" component="span">
              {taskDefinition.description}
            </Typography>
          }
          action={
            <Chip
              label={taskDefinition.type}
              color="primary"
              variant="outlined"
              size="small"
            />
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <AccessTimeIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="overline" color="textSecondary">
                    Estimated Duration
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {taskDefinition.estimatedDuration}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <WorkHistoryIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="overline" color="textSecondary">
                    Work Order Type
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {taskDefinition.type}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
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
        <Can requiredPermissions={[Permissions.TaskDefinitions.Delete]}>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </Can>
      </Stack>
    </PageContainer>
  );
}

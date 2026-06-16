import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import { validateUpdateTaskDefinition } from "@/domain/taskDefinitions/TaskDefinitionValidation";
import PageContainer from "@/presentation/components/PageContainer";
import {
  useTaskDefinition,
  useUpdateTaskDefinition,
} from "@/application/hooks/taskDefinitions/useTaskDefinitions";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import TaskDefinitionForm, {
  TaskDefinitionFormState,
  FormFieldValue,
} from "@/presentation/components/taskDefinitions/TaskDefinitionForm";
import {
  TimeUnit,
  WorkOrderType,
} from "@/domain/taskDefinitions/TaskDefinitionTypes";

// Helper to parse "2 Hours" -> { value: 2, unit: TimeUnit.Hours }
function parseEstimatedDuration(estimatedDuration: string): {
  durationValue: number;
  durationUnit: TimeUnit;
} {
  const parts = estimatedDuration.split(" ");
  const value = parseFloat(parts[0]) || 0;
  const rawUnit = parts[1] || "Hours";
  // Capitalise first letter to match TimeUnit enum
  const unit = rawUnit.charAt(0).toUpperCase() + rawUnit.slice(1).toLowerCase();
  return {
    durationValue: value,
    durationUnit: unit as TimeUnit,
  };
}

export default function TaskDefinitionEdit() {
  const { taskDefinitionId } = useParams<{ taskDefinitionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = useNotifications();

  const {
    data: taskDef,
    isLoading,
    error,
  } = useTaskDefinition(taskDefinitionId!);
  const updateMutation = useUpdateTaskDefinition();

  const [formState, setFormState] = useState<TaskDefinitionFormState>({
    values: {},
    errors: {},
  });

  // Populate form when taskDef loads
  useEffect(() => {
    if (taskDef) {
      const { durationValue, durationUnit } = parseEstimatedDuration(
        taskDef.estimatedDuration,
      );
      setFormState({
        values: {
          id: taskDef.id,
          description: taskDef.description,
          durationValue,
          durationUnit,
          type: taskDef.type as WorkOrderType,
        },
        errors: {},
      });
    }
  }, [taskDef]);

  const handleFieldChange = useCallback(
    (name: keyof TaskDefinitionFormState["values"], value: FormFieldValue) => {
      setFormState((prev) => {
        const newValues = { ...prev.values, [name]: value };
        // Validate only changed field using update validation
        const payload = {
          id: taskDefinitionId!,
          description: newValues.description,
          durationValue: newValues.durationValue,
          durationUnit: newValues.durationUnit,
        };
        const { issues } = validateUpdateTaskDefinition(payload);
        const fieldError = issues.find((i) => i.path[0] === name)?.message;
        return {
          values: newValues,
          errors: { ...prev.errors, [name]: fieldError },
        };
      });
    },
    [taskDefinitionId],
  );

  const handleSubmit = useCallback(async () => {
    const payload = {
      id: taskDefinitionId!,
      description: formState.values.description,
      durationValue: formState.values.durationValue,
      durationUnit: formState.values.durationUnit,
    };
    const { issues } = validateUpdateTaskDefinition(payload);
    if (issues.length) {
      const errors: any = {};
      issues.forEach((i) => (errors[i.path[0]] = i.message));
      setFormState((prev) => ({ ...prev, errors }));
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: taskDefinitionId!,
        data: payload,
      });
      notifications.show("Task definition updated.", { severity: "success" });
      navigate(`/task-definitions/${taskDefinitionId}`);
    } catch (err) {
      notifications.show(`Update failed: ${(err as Error).message}`, {
        severity: "error",
      });
    }
  }, [
    formState.values,
    updateMutation,
    taskDefinitionId,
    navigate,
    notifications,
  ]);

  // Go back using router state or default to detail page
  const handleCancel = useCallback(() => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(`/task-definitions/${taskDefinitionId}`);
    }
  }, [navigate, location.state, taskDefinitionId]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error">
        {(error as Error)?.message || "Error loading task definition."}
      </Typography>
    );
  }

  return (
    <Can
      requiredPermissions={[Permissions.TaskDefinitions.Edit]}
      fallback={
        <PageContainer title="Edit Task Definition">
          <Typography>
            You do not have permission to edit task definitions.
          </Typography>
        </PageContainer>
      }
    >
      <PageContainer
        title="Edit Task Definition"
        breadcrumbs={[
          { title: "Task Definitions", path: "/task-definitions" },
          {
            title: "Task",
            path: `/task-definitions/${taskDef?.id}`,
          },
          { title: "Edit" },
        ]}
      >
        <Box sx={{ maxWidth: 600, mx: "auto" }}>
          <TaskDefinitionForm
            formState={formState}
            onFieldChange={handleFieldChange}
            onSubmit={handleSubmit}
            submitButtonLabel="Save"
            onCancel={handleCancel}
            isEdit
          />
        </Box>
      </PageContainer>
    </Can>
  );
}

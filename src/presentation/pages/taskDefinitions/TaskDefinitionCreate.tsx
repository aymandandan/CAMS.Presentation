import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import { validateCreateTaskDefinition } from "@/domain/taskDefinitions/TaskDefinitionValidation";
import PageContainer from "@/presentation/components/PageContainer";
import { useCreateTaskDefinition } from "@/application/hooks/taskDefinitions/useTaskDefinitions";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import {
  TimeUnit,
  WorkOrderType,
} from "@/domain/taskDefinitions/TaskDefinitionTypes";
import TaskDefinitionForm, {
  TaskDefinitionFormState,
  FormFieldValue,
} from "@/presentation/components/taskDefinitions/TaskDefinitionForm";
import { Typography, Box } from "@mui/material";

const INITIAL_VALUES: Partial<TaskDefinitionFormState["values"]> = {
  description: "",
  durationValue: 1,
  durationUnit: TimeUnit.Hours,
  type: WorkOrderType.Corrective,
};

export default function TaskDefinitionCreate() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const createMutation = useCreateTaskDefinition();

  const [formState, setFormState] = useState<TaskDefinitionFormState>({
    values: { ...INITIAL_VALUES },
    errors: {},
  });

  const handleFieldChange = useCallback(
    (name: keyof TaskDefinitionFormState["values"], value: FormFieldValue) => {
      setFormState((prev) => {
        const newValues = { ...prev.values, [name]: value };
        const { issues } = validateCreateTaskDefinition(newValues as any);
        const fieldError = issues.find((i) => i.path[0] === name)?.message;
        return {
          values: newValues,
          errors: { ...prev.errors, [name]: fieldError },
        };
      });
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    const { issues } = validateCreateTaskDefinition(formState.values as any);
    if (issues.length) {
      const errors: any = {};
      issues.forEach((issue) => {
        errors[issue.path[0]] = issue.message;
      });
      setFormState((prev) => ({ ...prev, errors }));
      return;
    }

    try {
      await createMutation.mutateAsync(formState.values as any);
      notifications.show("Task definition created.", { severity: "success" });
      navigate("/task-definitions");
    } catch (err) {
      notifications.show(`Creation failed: ${(err as Error).message}`, {
        severity: "error",
      });
    }
  }, [formState.values, createMutation, navigate, notifications]);

  const handleCancel = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/task-definitions");
    }
  }, [navigate]);

  return (
    <Can
      requiredPermissions={[Permissions.TaskDefinitions.Create]}
      fallback={
        <PageContainer title="Create Task Definition">
          <Typography>
            You do not have permission to create task definitions.
          </Typography>
        </PageContainer>
      }
    >
      <PageContainer
        title="New Task Definition"
        breadcrumbs={[
          { title: "Task Definitions", path: "/task-definitions" },
          { title: "New" },
        ]}
      >
        <Box sx={{ maxWidth: 600, mx: "auto" }}>
          <TaskDefinitionForm
            formState={formState}
            onFieldChange={handleFieldChange}
            onSubmit={handleSubmit}
            submitButtonLabel="Create"
            onCancel={handleCancel}
            isEdit={false}
          />
        </Box>
      </PageContainer>
    </Can>
  );
}

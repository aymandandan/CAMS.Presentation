import * as React from "react";
import { useNavigate } from "react-router";
import { Box } from "@mui/material";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import PageContainer from "@/presentation/components/PageContainer";
import type { CreateRoleRequest } from "@/domain/roles/RoleTypes";
import { useCreateRole } from "@/application/hooks/roles/useRoles";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import RoleForm, {
  RoleFormState,
} from "@/presentation/components/roles/RoleForm";
import { validateCreateRole } from "@/domain/roles/RoleValidation";
import { Typography } from "@mui/material";

const INITIAL_VALUES: Partial<CreateRoleRequest> = {
  name: "",
  description: "",
};

export default function RoleCreate() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const createMutation = useCreateRole();

  const [formState, setFormState] = React.useState<RoleFormState>({
    values: INITIAL_VALUES,
    errors: {},
  });

  const handleFieldChange = React.useCallback(
    (name: keyof RoleFormState["values"], value: string) => {
      setFormState((prev) => {
        const newValues = { ...prev.values, [name]: value };
        const { issues } = validateCreateRole(newValues as any);
        const newErrors = { ...prev.errors };
        const issue = issues.find((i: any) => i.path[0] === name);
        if (issue) newErrors[name] = issue.message;
        else delete newErrors[name];
        return { values: newValues, errors: newErrors };
      });
    },
    [],
  );

  const handleSubmit = React.useCallback(async () => {
    const { values } = formState;
    const { issues } = validateCreateRole(values as any);
    if (issues.length > 0) {
      const newErrors: any = {};
      issues.forEach((i: any) => (newErrors[i.path[0]] = i.message));
      setFormState((prev) => ({ ...prev, errors: newErrors }));
      return;
    }

    try {
      await createMutation.mutateAsync(values as CreateRoleRequest);
      notifications.show("Role created", { severity: "success" });
      navigate("/roles");
    } catch (err) {
      notifications.show(`Failed to create role: ${(err as Error).message}`, {
        severity: "error",
      });
    }
  }, [formState, createMutation, navigate, notifications]);

  const handleCancel = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/roles");
    }
  };

  return (
    <Can
      requiredPermissions={[Permissions.Roles.Create]}
      fallback={
        <PageContainer title="Create Role">
          <Typography>Access denied</Typography>
        </PageContainer>
      }
    >
      <PageContainer
        title="New Role"
        breadcrumbs={[{ title: "Roles", path: "/roles" }, { title: "New" }]}
      >
        <Box sx={{ maxWidth: 600, mx: "auto" }}>
          <RoleForm
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

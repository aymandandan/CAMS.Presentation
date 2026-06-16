import * as React from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { Box, CircularProgress, Alert } from "@mui/material";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import PageContainer from "@/presentation/components/PageContainer";
import type { UpdateRoleRequest } from "@/domain/roles/RoleTypes";
import { useRole, useUpdateRole } from "@/application/hooks/roles/useRoles";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import RoleForm, {
  RoleFormState,
} from "@/presentation/components/roles/RoleForm";
import { validateUpdateRole } from "@/domain/roles/RoleValidation";
import { Typography } from "@mui/material";

export default function RoleEdit() {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = useNotifications();
  const { data: role, isLoading, error } = useRole(roleId!);
  const updateMutation = useUpdateRole(roleId!);

  const [formState, setFormState] = React.useState<RoleFormState>({
    values: { name: "", description: "", roleId: roleId! },
    errors: {},
  });

  React.useEffect(() => {
    if (role) {
      setFormState({
        values: {
          name: role.name,
          description: role.description ?? "",
          roleId: role.id,
        },
        errors: {},
      });
    }
  }, [role]);

  const handleFieldChange = React.useCallback(
    (name: keyof RoleFormState["values"], value: string) => {
      setFormState((prev) => {
        const newValues = { ...prev.values, [name]: value };
        const { issues } = validateUpdateRole(newValues as any);
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
    const { issues } = validateUpdateRole(values as any);
    if (issues.length > 0) {
      const newErrors: any = {};
      issues.forEach((i: any) => (newErrors[i.path[0]] = i.message));
      setFormState((prev) => ({ ...prev, errors: newErrors }));
      return;
    }

    try {
      await updateMutation.mutateAsync(values as UpdateRoleRequest);
      notifications.show("Role updated", { severity: "success" });
      navigate(`/roles/${roleId}`);
    } catch (err) {
      notifications.show(`Failed to update role: ${(err as Error).message}`, {
        severity: "error",
      });
    }
  }, [formState, updateMutation, navigate, notifications, roleId]);

  const handleCancel = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(`/roles/${roleId}`);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{(error as Error).message}</Alert>;
  }

  return (
    <Can
      requiredPermissions={[Permissions.Roles.Update]}
      fallback={
        <PageContainer title="Edit Role">
          <Typography>Access denied</Typography>
        </PageContainer>
      }
    >
      <PageContainer
        title={`Edit ${role?.name ?? ""}`}
        breadcrumbs={[
          { title: "Roles", path: "/roles" },
          { title: role?.name ?? "", path: `/roles/${roleId}` },
          { title: "Edit" },
        ]}
      >
        <Box sx={{ maxWidth: 600, mx: "auto" }}>
          <RoleForm
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

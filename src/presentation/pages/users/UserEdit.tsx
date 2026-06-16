import * as React from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { Box, CircularProgress, Alert } from "@mui/material";
import PageContainer from "@/presentation/components/PageContainer";
import type { UpdateUserRequest } from "@/domain/users/UserTypes";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import { useUser, useUpdateUser } from "@/application/hooks/users/useUsers";
import UserForm, {
  type UserFormState,
} from "@/presentation/components/users/UserForm";
import { validateUpdateUser } from "@/domain/users/UserValidation";

export default function UserEdit() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = useNotifications();

  const { data: user, isLoading, error } = useUser(userId!);
  const updateMutation = useUpdateUser(userId!);

  const [formState, setFormState] = React.useState<UserFormState>({
    values: {
      fullName: "",
      email: "",
      phoneNumber: "",
      userId: userId!,
    },
    errors: {},
  });

  React.useEffect(() => {
    if (user) {
      setFormState({
        values: {
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber ?? "",
          userId: user.id,
        },
        errors: {},
      });
    }
  }, [user]);

  const handleFieldChange = React.useCallback(
    (name: keyof UserFormState["values"], value: string) => {
      setFormState((prev) => {
        const newValues = { ...prev.values, [name]: value };
        const { issues } = validateUpdateUser(newValues as any);
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
    const { issues } = validateUpdateUser(values as any);
    if (issues.length > 0) {
      const newErrors: any = {};
      issues.forEach((i: any) => (newErrors[i.path[0]] = i.message));
      setFormState((prev) => ({ ...prev, errors: newErrors }));
      return;
    }

    try {
      await updateMutation.mutateAsync(values as UpdateUserRequest);
      notifications.show("User updated", { severity: "success" });
      navigate(`/users/${userId}`);
    } catch (err) {
      notifications.show(`Failed to update user: ${(err as Error).message}`, {
        severity: "error",
      });
    }
  }, [formState, updateMutation, navigate, notifications, userId]);

  const handleCancel = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(`/users/${userId}`);
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
    <PageContainer
      title={`Edit ${user?.fullName ?? ""}`}
      breadcrumbs={[
        { title: "Users", path: "/users" },
        { title: user?.fullName ?? "", path: `/users/${userId}` },
        { title: "Edit" },
      ]}
    >
      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <UserForm
          formState={formState}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitButtonLabel="Save"
          onCancel={handleCancel}
          isEdit
        />
      </Box>
    </PageContainer>
  );
}

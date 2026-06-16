import * as React from "react";
import { useNavigate } from "react-router";
import { Box } from "@mui/material";
import PageContainer from "@/presentation/components/PageContainer";
import type { CreateUserRequest } from "@/domain/users/UserTypes";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import { useCreateUser } from "@/application/hooks/users/useUsers";
import UserForm, {
  UserFormState,
} from "@/presentation/components/users/UserForm";
import { validateCreateUser } from "@/domain/users/UserValidation";

const INITIAL_VALUES: Partial<CreateUserRequest & { password: string }> = {
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
};

export default function UserCreate() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const createMutation = useCreateUser();

  const [formState, setFormState] = React.useState<UserFormState>({
    values: INITIAL_VALUES,
    errors: {},
  });

  const handleFieldChange = React.useCallback(
    (name: keyof UserFormState["values"], value: string) => {
      setFormState((prev) => {
        const newValues = { ...prev.values, [name]: value };
        const { issues } = validateCreateUser(newValues as any);
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
    const { issues } = validateCreateUser(values as any);
    if (issues.length > 0) {
      const newErrors: any = {};
      issues.forEach((i: any) => (newErrors[i.path[0]] = i.message));
      setFormState((prev) => ({ ...prev, errors: newErrors }));
      return;
    }

    try {
      await createMutation.mutateAsync(values as CreateUserRequest);
      notifications.show("User created successfully", { severity: "success" });
      navigate("/users");
    } catch (err) {
      notifications.show(`Failed to create user: ${(err as Error).message}`, {
        severity: "error",
      });
    }
  }, [formState, createMutation, navigate, notifications]);

  const handleCancel = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/users");
    }
  };

  return (
    <PageContainer
      title="New User"
      breadcrumbs={[{ title: "Users", path: "/users" }, { title: "New" }]}
    >
      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <UserForm
          formState={formState}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitButtonLabel="Create"
          onCancel={handleCancel}
          showPasswordField
          isEdit={false}
        />
      </Box>
    </PageContainer>
  );
}

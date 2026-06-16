// CategoryCreate.tsx
import * as React from "react";
import { useNavigate } from "react-router";
import { Box } from "@mui/material";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import { useCreateCategory } from "@/application/hooks/categories/useCategories";
import CategoryForm, {
  type CategoryFormState,
} from "@/presentation/components/categories/CategoryForm";
import { validateCategory } from "@/domain/categories/CategoryValidation";
import PageContainer from "@/presentation/components/PageContainer";

const INITIAL_VALUES: CategoryFormState["values"] = {
  code: "",
  name: "",
  description: "",
};

export default function CategoryCreate() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const createMutation = useCreateCategory();

  const [formState, setFormState] = React.useState<CategoryFormState>({
    values: INITIAL_VALUES,
    errors: {},
  });

  const handleFieldChange = React.useCallback(
    (name: keyof CategoryFormState["values"], value: string | null) => {
      setFormState((prev) => {
        const newValues = { ...prev.values, [name]: value };
        const { issues } = validateCategory(newValues);
        const newErrors = { ...prev.errors };
        const issue = issues.find((i) => i.path[0] === name);
        if (issue) newErrors[name] = issue.message;
        else delete newErrors[name];
        return { values: newValues, errors: newErrors };
      });
    },
    [],
  );

  const handleSubmit = React.useCallback(async () => {
    const { values } = formState;
    const { issues } = validateCategory(values);
    if (issues.length > 0) {
      const newErrors: any = {};
      issues.forEach((i) => (newErrors[i.path[0]] = i.message));
      setFormState((prev) => ({ ...prev, errors: newErrors }));
      return;
    }

    try {
      await createMutation.mutateAsync({
        code: values.code!.trim(),
        name: values.name!.trim(),
        description: values.description?.trim() || null,
      });
      notifications.show("Category created successfully.", {
        severity: "success",
      });
      navigate("/categories");
    } catch (error) {
      notifications.show(
        `Failed to create category: ${(error as Error).message}`,
        { severity: "error" },
      );
    }
  }, [formState, createMutation, navigate, notifications]);

  const handleCancel = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/categories");
    }
  };

  return (
    <PageContainer
      title="New Category"
      breadcrumbs={[
        { title: "Categories", path: "/categories" },
        { title: "New" },
      ]}
    >
      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <CategoryForm
          formState={formState}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitButtonLabel="Create"
          onCancel={handleCancel}
          isEdit={false}
        />
      </Box>
    </PageContainer>
  );
}

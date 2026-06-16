import * as React from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { Box, CircularProgress, Alert } from "@mui/material";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import {
  useCategory,
  useUpdateCategory,
} from "@/application/hooks/categories/useCategories";
import CategoryForm, {
  type CategoryFormState,
} from "@/presentation/components/categories/CategoryForm";
import { validateCategory } from "@/domain/categories/CategoryValidation";
import PageContainer from "@/presentation/components/PageContainer";

export default function CategoryEdit() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = useNotifications();

  const { data: category, isLoading, error } = useCategory(categoryId!);
  const updateMutation = useUpdateCategory();

  const [formState, setFormState] = React.useState<CategoryFormState>({
    values: { code: "", name: "", description: "" },
    errors: {},
  });

  React.useEffect(() => {
    if (category) {
      setFormState({
        values: {
          id: category.id,
          code: category.code,
          name: category.name,
          description: category.description ?? "",
        },
        errors: {},
      });
    }
  }, [category]);

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
      await updateMutation.mutateAsync({
        categoryId: categoryId!,
        name: values.name!.trim(),
        description: values.description?.trim() || null,
      });
      notifications.show("Category updated successfully.", {
        severity: "success",
      });
      navigate(`/categories/${categoryId}`);
    } catch (error) {
      notifications.show(
        `Failed to update category: ${(error as Error).message}`,
        { severity: "error" },
      );
    }
  }, [formState, categoryId, updateMutation, navigate, notifications]);

  const handleCancel = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(`/categories/${categoryId}`);
    }
  };

  if (isLoading) {
    return (
      <PageContainer title="Edit Category">
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Edit Category">
        <Alert severity="error">{(error as Error).message}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`Edit ${category?.code ?? ""}`}
      breadcrumbs={[
        { title: "Categories", path: "/categories" },
        { title: category?.code ?? "", path: `/categories/${categoryId}` },
        { title: "Edit" },
      ]}
    >
      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <CategoryForm
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

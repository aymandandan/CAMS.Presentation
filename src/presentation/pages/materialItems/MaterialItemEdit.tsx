import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { CircularProgress, Alert, Box } from "@mui/material";
import PageContainer from "@/presentation/components/PageContainer";
import type { UpdateMaterialItemRequest } from "@/domain/materialItems/MaterialItemTypes";
import {
  useMaterialItemById,
  useUpdateMaterialItem,
} from "@/application/hooks/materialItems/useMaterialItems";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import { validateUpdateMaterialItem } from "@/domain/materialItems/MaterialItemValidations";
import MaterialItemForm, {
  MaterialItemFormState,
} from "@/presentation/components/materialItems/MaterialItemForm";

export default function MaterialItemEdit() {
  const { materialItemId } = useParams<{ materialItemId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = useNotifications();

  const { data: item, isLoading, error } = useMaterialItemById(materialItemId!);
  const updateMutation = useUpdateMaterialItem();

  const [formState, setFormState] = useState<MaterialItemFormState>({
    values: {},
    errors: {},
  });

  // Once data loads, initialise the form with editable fields only
  useEffect(() => {
    if (item) {
      setFormState({
        values: {
          id: item.id,
          name: item.name,
          description: item.description ?? "",
          reorderLevel: item.reorderLevel,
          unitOfMeasureSymbol: item.unit ?? "UNK",
          unitCostAmount: item.unitCost,
          unitCostCurrency: item.currency ?? "USD",
          specifications: item.specifications ?? {},
        },
        errors: {},
      });
    }
  }, [item]);

  const handleFieldChange = useCallback(
    (name: keyof MaterialItemFormState["values"], value: unknown) => {
      setFormState((prev) => {
        const newValues = { ...prev.values, [name]: value };
        const { issues } = validateUpdateMaterialItem(
          newValues as UpdateMaterialItemRequest,
        );
        const newErrors = { ...prev.errors };
        delete newErrors[name];
        const issue = issues.find((i) => i.path[0] === name);
        if (issue) newErrors[name] = issue.message;
        return { values: newValues, errors: newErrors };
      });
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    const finalValues = formState.values as UpdateMaterialItemRequest;
    const { issues } = validateUpdateMaterialItem(finalValues);
    if (issues.length) {
      const errors: Record<string, string> = {};
      issues.forEach((i) => (errors[i.path[0]] = i.message));
      setFormState((prev) => ({ ...prev, errors }));
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: materialItemId!,
        data: finalValues,
      });
      notifications.show("Material item updated.", { severity: "success" });
      navigate(`/material-items/${materialItemId}`);
    } catch (err) {
      notifications.show(`Update failed: ${(err as Error).message}`, {
        severity: "error",
      });
    }
  }, [
    formState.values,
    updateMutation,
    materialItemId,
    notifications,
    navigate,
  ]);

  // Go back using router state or default to detail page
  const handleCancel = useCallback(() => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(`/material-items/${materialItemId}`);
    }
  }, [navigate, location.state, materialItemId]);

  if (isLoading) {
    return (
      <PageContainer title="Loading...">
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Error">
        <Alert severity="error">{(error as Error).message}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`Edit ${item?.name ?? ""}`}
      breadcrumbs={[
        { title: "Material Items", path: "/material-items" },
        { title: item?.name ?? "", path: `/material-items/${materialItemId}` },
        { title: "Edit" },
      ]}
    >
      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <MaterialItemForm
          formState={formState}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitLabel="Save"
          isSubmitting={updateMutation.isPending}
          onCancel={handleCancel}
          isEdit
        />
      </Box>
    </PageContainer>
  );
}

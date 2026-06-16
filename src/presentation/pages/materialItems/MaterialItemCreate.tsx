import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import PageContainer from "@/presentation/components/PageContainer";
import type { CreateMaterialItemRequest } from "@/domain/materialItems/MaterialItemTypes";
import type { MaterialStoreDto } from "@/domain/materialStores/MaterialStoreTypes";
import { useCreateMaterialItem } from "@/application/hooks/materialItems/useMaterialItems";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import { validateCreateMaterialItem } from "@/domain/materialItems/MaterialItemValidations";
import MaterialItemForm, {
  MaterialItemFormValues,
  MaterialItemFormState,
} from "@/presentation/components/materialItems/MaterialItemForm";
import MaterialStorePickerDialog from "@/presentation/components/pickers/MaterialStorePickerDialog";

const INITIAL_VALUES: Partial<MaterialItemFormValues> = {
  reorderLevel: 0,
  isStockable: true,
  unitCostCurrency: "USD",
  specifications: {},
};

export default function MaterialItemCreate() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const createMutation = useCreateMaterialItem();

  const [formState, setFormState] = useState<MaterialItemFormState>({
    values: INITIAL_VALUES,
    errors: {},
  });

  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedStoreName, setSelectedStoreName] = useState<
    string | undefined
  >();

  const handleFieldChange = useCallback(
    (name: keyof MaterialItemFormValues, value: unknown) => {
      setFormState((prev) => {
        const newValues = { ...prev.values, [name]: value };
        const { issues } = validateCreateMaterialItem(newValues as any);
        const newErrors = { ...prev.errors };
        delete newErrors[name];
        const issue = issues.find((i) => i.path[0] === name);
        if (issue) newErrors[name] = issue.message;
        return { values: newValues, errors: newErrors };
      });
    },
    [],
  );

  const handleStoreSelect = useCallback((store: MaterialStoreDto) => {
    setFormState((prev) => ({
      ...prev,
      values: { ...prev.values, storeId: store.id },
    }));
    setSelectedStoreName(`${store.code} - ${store.name}`);
    setPickerOpen(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    const finalValues = formState.values as CreateMaterialItemRequest;
    const { issues } = validateCreateMaterialItem(finalValues);
    if (issues.length) {
      const errors: Record<string, string> = {};
      issues.forEach((i) => (errors[i.path[0]] = i.message));
      setFormState((prev) => ({ ...prev, errors }));
      return;
    }

    try {
      await createMutation.mutateAsync(finalValues);
      notifications.show("Material item created successfully.", {
        severity: "success",
      });
      navigate("/material-items");
    } catch (err) {
      notifications.show(`Creation failed: ${(err as Error).message}`, {
        severity: "error",
      });
    }
  }, [formState.values, createMutation, notifications, navigate]);

  const handleCancel = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/material-items");
    }
  }, [navigate]);

  return (
    <PageContainer
      title="New Material Item"
      breadcrumbs={[
        { title: "Material Items", path: "/material-items" },
        { title: "New" },
      ]}
    >
      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <MaterialItemForm
          formState={formState}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitLabel="Create"
          isSubmitting={createMutation.isPending}
          selectedStoreName={selectedStoreName}
          onPickStore={() => setPickerOpen(true)}
          onCancel={handleCancel}
          isEdit={false}
        />
      </Box>
      <MaterialStorePickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleStoreSelect}
      />
    </PageContainer>
  );
}

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { validateEquipment } from "@/domain/equipment/EquipmentValidation";
import type { CreateEquipmentRequest } from "@/domain/equipment/EquipmentTypes";
import { EquipmentStatus } from "@/domain/equipment/EquipmentTypes";
import EquipmentForm, {
  type EquipmentFormState,
} from "@/presentation/components/equipment/EquipmentForm";
import PageContainer from "@/presentation/components/PageContainer";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import { useCreateEquipment } from "@/application/hooks/equipment/useEquipment";

const INITIAL_VALUES: Partial<CreateEquipmentRequest> = {
  code: "",
  name: "",
  description: "",
  locationId: "",
  categoryId: "",
  tradeId: "",
  status: EquipmentStatus.Operational,
  notes: "",
  specifications: {
    customAttributes: {},
  },
};

export default function EquipmentCreate() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const createMutation = useCreateEquipment();

  const [formState, setFormState] = useState<EquipmentFormState>({
    values: { ...INITIAL_VALUES },
    errors: {},
  });

  const handleFieldChange = useCallback(
    (name: keyof EquipmentFormState["values"], value: any) => {
      setFormState((prev) => {
        const newValues = { ...prev.values, [name]: value };
        const { issues } = validateEquipment(newValues);
        const newErrors = { ...prev.errors };
        const issue = issues.find((i) => i.path[0] === name);
        newErrors[name] = issue?.message || "";
        return { values: newValues, errors: newErrors };
      });
    },
    [],
  );

  const handleSubmit = useCallback(
    async (values: Partial<CreateEquipmentRequest>) => {
      const { issues } = validateEquipment(values);
      if (issues.length > 0) {
        const fieldErrors: Partial<Record<string, string>> = {};
        issues.forEach((issue) => {
          fieldErrors[issue.path[0]] = issue.message;
        });
        setFormState((prev) => ({ ...prev, errors: fieldErrors }));
        return;
      }
      try {
        await createMutation.mutateAsync(values as CreateEquipmentRequest);
        notifications.show("Equipment created successfully.", {
          severity: "success",
        });
        navigate("/equipment");
      } catch (error: any) {
        notifications.show(`Creation failed: ${error.message}`, {
          severity: "error",
        });
        throw error;
      }
    },
    [createMutation, notifications, navigate],
  );

  const handleCancel = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/equipment");
    }
  }, [navigate]);

  return (
    <PageContainer
      title="New Equipment"
      breadcrumbs={[
        { title: "Equipment", path: "/equipment" },
        { title: "New" },
      ]}
    >
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <EquipmentForm
          formState={formState}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitButtonLabel="Create Equipment"
          isSubmitting={createMutation.isPending}
          isEdit={false}
          onCancel={handleCancel}
        />
      </Box>
    </PageContainer>
  );
}

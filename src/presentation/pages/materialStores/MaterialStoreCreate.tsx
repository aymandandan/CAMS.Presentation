import * as React from "react";
import { useNavigate } from "react-router";
import { Box } from "@mui/material";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import PageContainer from "@/presentation/components/PageContainer";
import MaterialStoreForm, {
  MaterialStoreFormState,
} from "@/presentation/components/materialStores/MaterialStoreForm";
import { useCreateMaterialStoreMutation } from "@/application/hooks/materialStores/useMaterialStores";
import { validateMaterialStore } from "@/domain/materialStores/MaterialStoreValidation";

const INITIAL_VALUES: MaterialStoreFormState["values"] = {
  code: "",
  name: "",
  address: "",
};

export default function MaterialStoreCreate() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const createMutation = useCreateMaterialStoreMutation();

  const [formState, setFormState] = React.useState<MaterialStoreFormState>({
    values: INITIAL_VALUES,
    errors: {},
  });

  const handleFieldChange = React.useCallback(
    (name: string, value: string | number | boolean | null) => {
      setFormState((prev) => {
        const newValues = { ...prev.values, [name]: value };
        const { issues } = validateMaterialStore(newValues as any);
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
    const { issues } = validateMaterialStore(values as any);
    if (issues.length > 0) {
      const newErrors: any = {};
      issues.forEach((i: any) => (newErrors[i.path[0]] = i.message));
      setFormState((prev) => ({ ...prev, errors: newErrors }));
      return;
    }

    try {
      await createMutation.mutateAsync({
        code: values.code!.trim(),
        name: values.name!.trim(),
        address: values.address?.trim() || undefined,
      });
      notifications.show("Material store created successfully.", {
        severity: "success",
      });
      navigate("/material-stores");
    } catch (err) {
      notifications.show(
        `Failed to create material store: ${(err as Error).message}`,
        { severity: "error" },
      );
    }
  }, [formState, createMutation, navigate, notifications]);

  const handleCancel = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/material-stores");
    }
  };

  return (
    <PageContainer
      title="New Material Store"
      breadcrumbs={[
        { title: "Material Stores", path: "/material-stores" },
        { title: "New" },
      ]}
    >
      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <MaterialStoreForm
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

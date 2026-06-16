// MaterialStoreEdit.tsx
import * as React from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { Box, CircularProgress, Alert } from "@mui/material";
import PageContainer from "@/presentation/components/PageContainer";
import MaterialStoreForm, {
  MaterialStoreFormState,
} from "@/presentation/components/materialStores/MaterialStoreForm";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import {
  useMaterialStoreQuery,
  useUpdateMaterialStoreMutation,
} from "@/application/hooks/materialStores/useMaterialStores";
import { validateMaterialStore } from "@/domain/materialStores/MaterialStoreValidation";

export default function MaterialStoreEdit() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = useNotifications();

  const {
    data: store,
    isLoading,
    isError,
    error,
  } = useMaterialStoreQuery(storeId ?? null);
  const updateMutation = useUpdateMaterialStoreMutation();

  const [formState, setFormState] = React.useState<MaterialStoreFormState>({
    values: { name: "", address: "" },
    errors: {},
  });

  React.useEffect(() => {
    if (store) {
      setFormState({
        values: {
          code: store.code,
          name: store.name,
          address: store.address ?? "",
        },
        errors: {},
      });
    }
  }, [store]);

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
      await updateMutation.mutateAsync({
        id: storeId!,
        name: values.name!.trim(),
        address: values.address?.trim() || undefined,
      });
      notifications.show("Material store updated successfully.", {
        severity: "success",
      });
      navigate(`/material-stores/${storeId}`);
    } catch (err) {
      notifications.show(
        `Failed to update material store: ${(err as Error).message}`,
        { severity: "error" },
      );
    }
  }, [formState, storeId, updateMutation, navigate, notifications]);

  const handleCancel = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(`/material-stores/${storeId}`);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return <Alert severity="error">{(error as Error)?.message}</Alert>;
  }

  return (
    <PageContainer
      title={`Edit ${store?.code ?? ""}`}
      breadcrumbs={[
        { title: "Material Stores", path: "/material-stores" },
        { title: store?.code ?? "", path: `/material-stores/${storeId}` },
        { title: "Edit" },
      ]}
    >
      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <MaterialStoreForm
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

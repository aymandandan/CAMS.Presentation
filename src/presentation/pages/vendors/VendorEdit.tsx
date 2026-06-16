import * as React from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { Box, CircularProgress, Alert } from "@mui/material";
import type { CreateVendorRequest } from "@/domain/vendors/VendorTypes";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import {
  useUpdateVendor,
  useVendor,
} from "@/application/hooks/vendors/useVendors";
import VendorForm, {
  VendorFormState,
} from "@/presentation/components/vendors/VendorForm";
import { validateVendor } from "@/domain/vendors/VendorValidation";
import PageContainer from "@/presentation/components/PageContainer";

export default function VendorEdit() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const notifications = useNotifications();

  const { data: vendor, isLoading, error } = useVendor(vendorId);
  const updateMutation = useUpdateVendor();

  const [formState, setFormState] = React.useState<VendorFormState>({
    values: { name: "", email: "", phone: "" },
    errors: {},
  });

  React.useEffect(() => {
    if (vendor) {
      setFormState({
        values: {
          name: vendor.name,
          email: vendor.email ?? "",
          phone: vendor.phone ?? "",
        },
        errors: {},
      });
    }
  }, [vendor]);

  const handleFieldChange = (
    name: keyof CreateVendorRequest,
    value: string | number | boolean | null,
  ) => {
    setFormState((prev) => {
      const newValues = { ...prev.values, [name]: value };
      const { issues } = validateVendor(newValues as any);
      const newErrors = { ...prev.errors };
      const issue = issues.find((i: any) => i.path[0] === name);
      if (issue) newErrors[name] = issue.message;
      else delete newErrors[name];
      return { values: newValues, errors: newErrors };
    });
  };

  const handleSubmit = async () => {
    const { values } = formState;
    const { issues } = validateVendor(values as any);
    if (issues.length > 0) {
      const newErrors: any = {};
      issues.forEach((i: any) => (newErrors[i.path[0]] = i.message));
      setFormState((prev) => ({ ...prev, errors: newErrors }));
      return;
    }

    try {
      await updateMutation.mutateAsync({
        vendorId: vendorId!,
        ...values,
      });
      notifications.show("Vendor updated successfully.", {
        severity: "success",
      });
      navigate(`/vendors/${vendorId}`);
    } catch (err) {
      notifications.show(`Failed to update vendor: ${(err as Error).message}`, {
        severity: "error",
      });
    }
  };

  const handleCancel = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(`/vendors/${vendorId}`);
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
      title={`Edit ${vendor?.name ?? ""}`}
      breadcrumbs={[
        { title: "Vendors", path: "/vendors" },
        { title: vendor?.name ?? "", path: `/vendors/${vendorId}` },
        { title: "Edit" },
      ]}
    >
      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <VendorForm
          formState={formState}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitButtonLabel="Save"
          onCancel={handleCancel}
        />
      </Box>
    </PageContainer>
  );
}

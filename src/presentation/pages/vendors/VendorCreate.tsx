import * as React from "react";
import { useNavigate } from "react-router";
import { Box } from "@mui/material";
import type { CreateVendorRequest } from "@/domain/vendors/VendorTypes";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import { useCreateVendor } from "@/application/hooks/vendors/useVendors";
import VendorForm, {
  VendorFormState,
} from "@/presentation/components/vendors/VendorForm";
import { validateVendor } from "@/domain/vendors/VendorValidation";
import PageContainer from "@/presentation/components/PageContainer";

const INITIAL_VALUES: Partial<CreateVendorRequest> = {
  name: "",
  email: "",
  phone: "",
};

export default function VendorCreate() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const createMutation = useCreateVendor();

  const [formState, setFormState] = React.useState<VendorFormState>({
    values: INITIAL_VALUES,
    errors: {},
  });

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
      await createMutation.mutateAsync(values as CreateVendorRequest);
      notifications.show("Vendor created successfully.", {
        severity: "success",
      });
      navigate("/vendors");
    } catch (err) {
      notifications.show(`Failed to create vendor: ${(err as Error).message}`, {
        severity: "error",
      });
    }
  };

  const handleCancel = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/vendors");
    }
  };

  return (
    <PageContainer
      title="New Vendor"
      breadcrumbs={[{ title: "Vendors", path: "/vendors" }, { title: "New" }]}
    >
      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <VendorForm
          formState={formState}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitButtonLabel="Create"
          onCancel={handleCancel}
        />
      </Box>
    </PageContainer>
  );
}

import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import { useCreateLocation } from "@/application/hooks/locations/useLocations";
import { validateLocation } from "@/domain/locations/LocationValidation";
import LocationForm, {
  type LocationFormState,
} from "@/presentation/components/locations/LocationForm";
import PageContainer from "@/presentation/components/PageContainer";
import { LocationType } from "@/domain/locations/LocationTypes";
import type { CreateLocationRequest } from "@/domain/locations/LocationTypes";

const INITIAL_VALUES: Partial<CreateLocationRequest> = {
  type: LocationType.Room,
};

export default function LocationCreate() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const createMutation = useCreateLocation();

  const [formState, setFormState] = useState<LocationFormState>(() => ({
    values: INITIAL_VALUES,
    errors: {},
  }));

  const handleFieldChange = useCallback(
    (name: keyof CreateLocationRequest, value: any) => {
      setFormState((prev) => {
        const newValues = { ...prev.values, [name]: value };
        const { issues } = validateLocation(newValues);
        const fieldError = issues.find((i) => i.path[0] === name);
        const newErrors = { ...prev.errors };
        if (fieldError) {
          newErrors[name] = fieldError.message;
        } else {
          delete newErrors[name];
        }
        return { values: newValues, errors: newErrors };
      });
    },
    [],
  );

  const handleReset = useCallback(() => {
    setFormState({ values: INITIAL_VALUES, errors: {} });
  }, []);

  const handleSubmit = useCallback(async () => {
    const { issues } = validateLocation(formState.values);
    if (issues.length > 0) {
      const errors: any = {};
      issues.forEach((i) => (errors[i.path[0]] = i.message));
      setFormState((prev) => ({ ...prev, errors }));
      return;
    }
    setFormState((prev) => ({ ...prev, errors: {} }));

    try {
      await createMutation.mutateAsync(
        formState.values as CreateLocationRequest,
      );
      notifications.show("Location created successfully.", {
        severity: "success",
      });
      navigate("/locations");
    } catch (error: any) {
      notifications.show(
        `Failed to create location. Reason: ${error.message}`,
        { severity: "error" },
      );
      // re‑throw to keep the promise rejection in `handleSubmit` if needed
      throw error;
    }
  }, [formState.values, createMutation, navigate, notifications]);

  return (
    <PageContainer
      title="New Location"
      breadcrumbs={[
        { title: "Locations", path: "/locations" },
        { title: "New" },
      ]}
    >
      <LocationForm
        formState={formState}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        onReset={handleReset}
        submitButtonLabel="Create"
        backButtonPath="/locations"
      />
    </PageContainer>
  );
}

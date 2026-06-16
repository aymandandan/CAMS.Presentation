import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { Box, CircularProgress, Alert } from "@mui/material";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import { validateLocation } from "@/domain/locations/LocationValidation";
import LocationForm, {
  type LocationFormState,
} from "@/presentation/components/locations/LocationForm";
import PageContainer from "@/presentation/components/PageContainer";
import { type CreateLocationRequest } from "@/domain/locations/LocationTypes";
import {
  useLocation as useQueryLocation,
  useUpdateLocation,
} from "@/application/hooks/locations/useLocations";

export default function LocationEdit() {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const locationRouter = useLocation(); // from react-router
  const notifications = useNotifications();
  const { data: location, isLoading, error } = useQueryLocation(locationId);
  const updateMutation = useUpdateLocation();

  const [formState, setFormState] = useState<LocationFormState>({
    values: {},
    errors: {},
  });
  const [initialParent, setInitialParent] = useState(location?.parent ?? null);

  useEffect(() => {
    if (location) {
      setFormState({
        values: {
          code: location.code,
          name: location.name,
          type: location.type,
          description: location.description ?? "",
          parentId: location.parentId ?? undefined,
        },
        errors: {},
      });
      setInitialParent(location.parent ?? null);
    }
  }, [location]);

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
    if (location) {
      setFormState({
        values: {
          code: location.code,
          name: location.name,
          type: location.type,
          description: location.description ?? "",
          parentId: location.parentId ?? undefined,
        },
        errors: {},
      });
      setInitialParent(location.parent ?? null);
    }
  }, [location]);

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
      await updateMutation.mutateAsync({
        id: locationId!,
        data: {
          id: locationId!,
          name: formState.values.name,
          description: formState.values.description,
        },
      });
      notifications.show("Location updated successfully.", {
        severity: "success",
      });
      navigate(`/locations/${locationId}`);
    } catch (error: any) {
      notifications.show(
        `Failed to update location. Reason: ${error.message}`,
        { severity: "error" },
      );
    }
  }, [formState.values, locationId, updateMutation, navigate, notifications]);

  // Custom back navigation: use state.from if available
  const goBack = useCallback(() => {
    if (locationRouter.state?.from) {
      navigate(locationRouter.state.from);
    } else {
      navigate(`/locations/${locationId}`);
    }
  }, [navigate, locationRouter.state, locationId]);

  if (isLoading) {
    return (
      <PageContainer title="Edit Location">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
          }}
        >
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error || !location) {
    return (
      <PageContainer title="Edit Location">
        <Alert severity="error">{error?.message || "Location not found"}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`Edit Location ${location.code}`}
      breadcrumbs={[
        { title: "Locations", path: "/locations" },
        { title: location.code, path: `/locations/${location.id}` },
        { title: "Edit" },
      ]}
    >
      <LocationForm
        formState={formState}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        onReset={handleReset}
        submitButtonLabel="Save"
        isEdit
        currentId={location.id}
        initialParent={initialParent}
        onCancel={goBack} // custom navigation for edit
      />
    </PageContainer>
  );
}

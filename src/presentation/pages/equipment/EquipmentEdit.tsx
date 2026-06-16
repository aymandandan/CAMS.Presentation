import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { CircularProgress, Alert, Box } from "@mui/material";
import { validateEquipment } from "@/domain/equipment/EquipmentValidation";
import type { CreateEquipmentRequest } from "@/domain/equipment/EquipmentTypes";
import EquipmentForm, {
  type EquipmentFormState,
} from "@/presentation/components/equipment/EquipmentForm";
import PageContainer from "@/presentation/components/PageContainer";
import {
  useEquipment,
  useUpdateEquipment,
} from "@/application/hooks/equipment/useEquipment";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import type { LocationDto } from "@/domain/locations/LocationTypes";
import type { CategoryDto } from "@/domain/categories/CategoryTypes";
import type { TradeDto } from "@/domain/trades/TradeTypes";
import { LocationType } from "@/domain/locations/LocationTypes";

export default function EquipmentEdit() {
  const { equipmentId } = useParams<{ equipmentId: string }>();
  const navigate = useNavigate();
  const locationRouter = useLocation(); // from react-router
  const notifications = useNotifications();
  const {
    data: equipment,
    isLoading,
    isError,
    error,
  } = useEquipment(equipmentId!);
  const updateMutation = useUpdateEquipment();

  const [formState, setFormState] = useState<EquipmentFormState>({
    values: {},
    errors: {},
  });

  // Controlled picker states
  const [selectedLocation, setSelectedLocation] = useState<LocationDto | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] = useState<CategoryDto | null>(
    null,
  );
  const [selectedTrade, setSelectedTrade] = useState<TradeDto | null>(null);

  // Load equipment data into the form and picker displays
  useEffect(() => {
    if (equipment) {
      setFormState({
        values: {
          code: equipment.code,
          name: equipment.name,
          description: equipment.description,
          locationId: equipment.locationId,
          categoryId: equipment.categoryId,
          tradeId: equipment.tradeId,
          status: equipment.status,
          notes: equipment.notes,
          specifications: equipment.specifications,
        },
        errors: {},
      });

      setSelectedLocation({
        id: equipment.locationId,
        code: "",
        name: equipment.location,
        type: LocationType.Room, // minimal object for display
        description: "",
      } as LocationDto);

      setSelectedCategory({
        id: equipment.categoryId,
        code: "",
        name: equipment.category,
        description: "",
      } as CategoryDto);

      setSelectedTrade({
        id: equipment.tradeId,
        code: "",
        name: equipment.trade,
        description: "",
      } as TradeDto);
    }
  }, [equipment]);

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

  // Pickers callbacks – update both form value and display object
  const handleLocationSelect = useCallback((location: LocationDto) => {
    setSelectedLocation(location);
    setFormState((prev) => ({
      ...prev,
      values: { ...prev.values, locationId: location.id },
    }));
  }, []);

  const handleCategorySelect = useCallback((category: CategoryDto) => {
    setSelectedCategory(category);
    setFormState((prev) => ({
      ...prev,
      values: { ...prev.values, categoryId: category.id },
    }));
  }, []);

  const handleTradeSelect = useCallback((trade: TradeDto) => {
    setSelectedTrade(trade);
    setFormState((prev) => ({
      ...prev,
      values: { ...prev.values, tradeId: trade.id },
    }));
  }, []);

  const handleSubmit = useCallback(
    async (values: Partial<CreateEquipmentRequest>) => {
      const { issues } = validateEquipment(values);
      if (issues.length > 0) {
        const fieldErrors: Record<string, string> = {};
        issues.forEach((i) => (fieldErrors[i.path[0]] = i.message));
        setFormState((prev) => ({ ...prev, errors: fieldErrors }));
        return;
      }

      try {
        await updateMutation.mutateAsync({
          id: equipmentId!,
          data: {
            equipmentId: equipmentId!,
            name: values.name,
            description: values.description,
            locationId: values.locationId,
            categoryId: values.categoryId,
            tradeId: values.tradeId,
            notes: values.notes,
            specifications: values.specifications,
          },
        });
        notifications.show("Equipment updated successfully.", {
          severity: "success",
        });
        navigate(`/equipment/${equipmentId}`);
      } catch (err: any) {
        notifications.show(`Update failed: ${err.message}`, {
          severity: "error",
        });
      }
    },
    [updateMutation, equipmentId, notifications, navigate],
  );

  // Cancel navigation using router state or fallback
  const goBack = useCallback(() => {
    if (locationRouter.state?.from) {
      navigate(locationRouter.state.from);
    } else {
      navigate(`/equipment/${equipmentId}`);
    }
  }, [navigate, locationRouter.state, equipmentId]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !equipment) {
    return (
      <Alert severity="error">
        {(error as Error)?.message || "Equipment not found"}
      </Alert>
    );
  }

  return (
    <PageContainer
      title={`Edit Equipment ${equipment.code}`}
      breadcrumbs={[
        { title: "Equipment", path: "/equipment" },
        { title: equipment.code, path: `/equipment/${equipmentId}` },
        { title: "Edit" },
      ]}
    >
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <EquipmentForm
          formState={formState}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitButtonLabel="Save Changes"
          isSubmitting={updateMutation.isPending}
          isEdit={true}
          selectedLocation={selectedLocation}
          onLocationSelect={handleLocationSelect}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          selectedTrade={selectedTrade}
          onTradeSelect={handleTradeSelect}
          onCancel={goBack}
        />
      </Box>
    </PageContainer>
  );
}

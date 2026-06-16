// EquipmentForm.tsx
import React, { useState, useCallback } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Paper,
  Stack,
  FormHelperText,
} from "@mui/material";
import CategoryPickerDialog from "@/presentation/components/pickers/CategoryPickerDialog";
import TradePickerDialog from "@/presentation/components/pickers/TradePickerDialog";
import EquipmentSpecificationsEditor from "@/presentation/components/equipment/EquipmentSpecificationsEditor";
import type {
  CreateEquipmentRequest,
  EquipmentStatus,
  EquipmentSpecificationsDto,
} from "@/domain/equipment/EquipmentTypes";
import { EquipmentStatus as EqStatus } from "@/domain/equipment/EquipmentTypes";
import type { LocationDto } from "@/domain/locations/LocationTypes";
import type { CategoryDto } from "@/domain/categories/CategoryTypes";
import type { TradeDto } from "@/domain/trades/TradeTypes";
import LocationPickerDialog from "../pickers/LocationPickerDialog";

export interface EquipmentFormState {
  values: Partial<CreateEquipmentRequest>;
  errors: Partial<Record<keyof CreateEquipmentRequest, string>>;
}

export type FormFieldValue =
  | string
  | number
  | boolean
  | EquipmentSpecificationsDto
  | null;

interface EquipmentFormProps {
  formState: EquipmentFormState;
  onFieldChange: (
    name: keyof EquipmentFormState["values"],
    value: FormFieldValue,
  ) => void;
  onSubmit: (values: Partial<CreateEquipmentRequest>) => Promise<void>;
  submitButtonLabel: string;
  isSubmitting?: boolean;
  isEdit?: boolean;
  selectedLocation?: LocationDto | null;
  onLocationSelect?: (location: LocationDto) => void;
  selectedCategory?: CategoryDto | null;
  onCategorySelect?: (category: CategoryDto) => void;
  selectedTrade?: TradeDto | null;
  onTradeSelect?: (trade: TradeDto) => void;
  onCancel?: () => void;
}

export const equipmentStatusOptions: {
  value: EquipmentStatus;
  label: string;
}[] = [
  { value: EqStatus.Operational, label: "Operational" },
  { value: EqStatus.UnderMaintenance, label: "Under Maintenance" },
  { value: EqStatus.Decommissioned, label: "Decommissioned" },
];

export default function EquipmentForm({
  formState,
  onFieldChange,
  onSubmit,
  submitButtonLabel,
  isSubmitting = false,
  isEdit = false,
  selectedLocation: controlledLocation,
  onLocationSelect,
  selectedCategory: controlledCategory,
  onCategorySelect,
  selectedTrade: controlledTrade,
  onTradeSelect,
  onCancel,
}: EquipmentFormProps) {
  const formValues = formState.values;
  const formErrors = formState.errors;

  // Internal uncontrolled state for create mode
  const [localLocation, setLocalLocation] = useState<LocationDto | null>(null);
  const [localCategory, setLocalCategory] = useState<CategoryDto | null>(null);
  const [localTrade, setLocalTrade] = useState<TradeDto | null>(null);

  const location = onLocationSelect ? controlledLocation : localLocation;
  const category = onCategorySelect ? controlledCategory : localCategory;
  const trade = onTradeSelect ? controlledTrade : localTrade;

  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [tradePickerOpen, setTradePickerOpen] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(formValues);
  };

  const handleTextFieldChange = useCallback(
    (field: keyof CreateEquipmentRequest) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onFieldChange(field, event.target.value);
      },
    [onFieldChange],
  );

  const handleLocationPicked = useCallback(
    (picked: LocationDto) => {
      if (onLocationSelect) {
        onLocationSelect(picked);
      } else {
        setLocalLocation(picked);
        onFieldChange("locationId", picked.id);
      }
      setLocationPickerOpen(false);
    },
    [onLocationSelect, onFieldChange],
  );

  const handleCategoryPicked = useCallback(
    (picked: CategoryDto) => {
      if (onCategorySelect) {
        onCategorySelect(picked);
      } else {
        setLocalCategory(picked);
        onFieldChange("categoryId", picked.id);
      }
      setCategoryPickerOpen(false);
    },
    [onCategorySelect, onFieldChange],
  );

  const handleTradePicked = useCallback(
    (picked: TradeDto) => {
      if (onTradeSelect) {
        onTradeSelect(picked);
      } else {
        setLocalTrade(picked);
        onFieldChange("tradeId", picked.id);
      }
      setTradePickerOpen(false);
    },
    [onTradeSelect, onFieldChange],
  );

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
      sx={{ width: "100%" }}
    >
      <Paper sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* ---- Basic Information ---- */}
          <Box>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Code"
                  required
                  fullWidth
                  value={formValues.code ?? ""}
                  onChange={handleTextFieldChange("code")}
                  error={!!formErrors.code}
                  helperText={formErrors.code ?? " "}
                  disabled={isEdit}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Name"
                  required
                  fullWidth
                  value={formValues.name ?? ""}
                  onChange={handleTextFieldChange("name")}
                  error={!!formErrors.name}
                  helperText={formErrors.name ?? " "}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={2}
                  value={formValues.description ?? ""}
                  onChange={handleTextFieldChange("description")}
                  error={!!formErrors.description}
                  helperText={formErrors.description ?? " "}
                />
              </Grid>
            </Grid>
          </Box>

          {/* ---- Classification ---- */}
          <Box>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              Classification
            </Typography>
            <Grid container spacing={2}>
              {/* Location */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Location
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setLocationPickerOpen(true)}
                >
                  {location ? location.name : "Select Location"}
                </Button>
                {formErrors.locationId && (
                  <FormHelperText error sx={{ mt: 0.5 }}>
                    {formErrors.locationId}
                  </FormHelperText>
                )}
              </Grid>

              {/* Category */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Category
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setCategoryPickerOpen(true)}
                >
                  {category ? category.name : "Select Category"}
                </Button>
                {formErrors.categoryId && (
                  <FormHelperText error sx={{ mt: 0.5 }}>
                    {formErrors.categoryId}
                  </FormHelperText>
                )}
              </Grid>

              {/* Trade */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Trade
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => setTradePickerOpen(true)}
                >
                  {trade ? trade.name : "Select Trade"}
                </Button>
                {formErrors.tradeId && (
                  <FormHelperText error sx={{ mt: 0.5 }}>
                    {formErrors.tradeId}
                  </FormHelperText>
                )}
              </Grid>
            </Grid>
          </Box>

          {/* ---- Status & Notes ---- */}
          <Box>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              Status & Notes
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                {isEdit ? (
                  <TextField
                    label="Status"
                    fullWidth
                    value={formValues.status ?? ""}
                    disabled
                    helperText={formErrors.status ?? " "}
                  />
                ) : (
                  <TextField
                    select
                    label="Status"
                    fullWidth
                    value={formValues.status ?? ""}
                    onChange={(e) =>
                      onFieldChange("status", e.target.value as EquipmentStatus)
                    }
                    error={!!formErrors.status}
                    helperText={formErrors.status ?? " "}
                  >
                    {equipmentStatusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Notes"
                  fullWidth
                  multiline
                  rows={2}
                  value={formValues.notes ?? ""}
                  onChange={handleTextFieldChange("notes")}
                  error={!!formErrors.notes}
                  helperText={formErrors.notes ?? " "}
                />
              </Grid>
            </Grid>
          </Box>

          {/* ---- Specifications ---- */}
          <Box>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              Specifications
            </Typography>
            <EquipmentSpecificationsEditor
              value={formValues.specifications}
              onChange={(specs) => onFieldChange("specifications", specs)}
            />
          </Box>
        </Stack>

        {/* Action Buttons */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 3, justifyContent: "flex-end" }}
        >
          {onCancel && (
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitButtonLabel}
          </Button>
        </Stack>
      </Paper>

      {/* Pickers */}
      <LocationPickerDialog
        open={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        onSelect={handleLocationPicked}
      />
      <CategoryPickerDialog
        open={categoryPickerOpen}
        onClose={() => setCategoryPickerOpen(false)}
        onSelect={handleCategoryPicked}
      />
      <TradePickerDialog
        open={tradePickerOpen}
        onClose={() => setTradePickerOpen(false)}
        onSelect={handleTradePicked}
      />
    </Box>
  );
}

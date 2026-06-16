import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router";
import { LocationType } from "@/domain/locations/LocationTypes";
import type {
  CreateLocationRequest,
  LocationDto,
} from "@/domain/locations/LocationTypes";
import LocationPickerDialog from "../pickers/LocationPickerDialog";

export interface LocationFormState {
  values: Partial<CreateLocationRequest>;
  errors: Partial<Record<keyof CreateLocationRequest, string>>;
}

export interface LocationFormProps {
  formState: LocationFormState;
  onFieldChange: (name: keyof CreateLocationRequest, value: any) => void;
  onSubmit: () => Promise<void>;
  onReset?: () => void;
  submitButtonLabel: string;
  backButtonPath?: string;
  isEdit?: boolean;
  currentId?: string;
  initialParent?: LocationDto | null;
  onCancel?: () => void; // optional custom cancel handler
}

const LocationForm: React.FC<LocationFormProps> = ({
  formState,
  onFieldChange,
  onSubmit,
  onReset,
  submitButtonLabel,
  backButtonPath,
  isEdit = false,
  currentId,
  initialParent = null,
  onCancel,
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parentPickerOpen, setParentPickerOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<LocationDto | null>(
    null,
  );

  useEffect(() => {
    setSelectedParent(initialParent);
  }, [initialParent]);

  const formValues = formState.values;
  const formErrors = formState.errors;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    onReset?.();
    setSelectedParent(initialParent);
  };

  const handleParentSelect = useCallback(
    (location: LocationDto) => {
      setSelectedParent(location);
      onFieldChange("parentId", location.id);
      setParentPickerOpen(false);
    },
    [onFieldChange],
  );

  const handleClearParent = useCallback(() => {
    setSelectedParent(null);
    onFieldChange("parentId", undefined);
  }, [onFieldChange]);

  const handleTextFieldChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFieldChange(
        event.target.name as keyof CreateLocationRequest,
        event.target.value,
      );
    },
    [onFieldChange],
  );

  const handleSelectChange = useCallback(
    (event: any) => {
      onFieldChange("type", event.target.value as LocationType);
    },
    [onFieldChange],
  );

  // Cancel action – use custom handler if provided, else navigate back
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else if (backButtonPath) {
      navigate(backButtonPath);
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/locations");
    }
  }, [onCancel, backButtonPath, navigate]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
      onReset={handleReset}
      sx={{ width: "100%" }}
    >
      <FormControl fullWidth sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          {/* Code – always enabled in create, disabled in edit */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              name="code"
              label="Code"
              value={formValues.code ?? ""}
              onChange={handleTextFieldChange}
              error={!!formErrors.code}
              helperText={formErrors.code ?? " "}
              fullWidth
              disabled={isEdit}
            />
          </Grid>
          {/* Name – always editable */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              name="name"
              label="Name"
              value={formValues.name ?? ""}
              onChange={handleTextFieldChange}
              error={!!formErrors.name}
              helperText={formErrors.name ?? " "}
              fullWidth
            />
          </Grid>
          {/* Type – editable only in create */}
          <Grid size={{ xs: 12, sm: 6 }}>
            {isEdit ? (
              <TextField
                label="Type"
                value={formValues.type ?? ""}
                fullWidth
                disabled
                helperText={formErrors.type ?? " "}
              />
            ) : (
              <FormControl fullWidth error={!!formErrors.type}>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formValues.type ?? ""}
                  onChange={handleSelectChange}
                  label="Type"
                >
                  {Object.values(LocationType).map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{formErrors.type ?? " "}</FormHelperText>
              </FormControl>
            )}
          </Grid>
          {/* Description – always editable */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              name="description"
              label="Description"
              value={formValues.description ?? ""}
              onChange={handleTextFieldChange}
              error={!!formErrors.description}
              helperText={formErrors.description ?? " "}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
          {/* Parent – interactive only in create, read-only in edit */}
          <Grid size={{ xs: 12 }}>
            {isEdit ? (
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Typography variant="body2">Parent: </Typography>
                {selectedParent ? (
                  <Typography variant="body1">
                    {selectedParent.code} - {selectedParent.name}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    None
                  </Typography>
                )}
              </Stack>
            ) : (
              <>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <Typography variant="body2">Parent: </Typography>
                  {selectedParent ? (
                    <>
                      <Typography variant="body1">
                        {selectedParent.code} - {selectedParent.name}
                      </Typography>
                      <Button size="small" onClick={handleClearParent}>
                        Clear
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setParentPickerOpen(true)}>
                      Select Parent
                    </Button>
                  )}
                </Stack>
                {formErrors.parentId && (
                  <FormHelperText error>{formErrors.parentId}</FormHelperText>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </FormControl>

      {/* Action buttons – right‑aligned Cancel + Save */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ mt: 2, justifyContent: "flex-end" }}
      >
        <Button variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : submitButtonLabel}
        </Button>
      </Stack>

      {/* Parent picker – only rendered when not in edit mode */}
      {!isEdit && (
        <LocationPickerDialog
          open={parentPickerOpen}
          onClose={() => setParentPickerOpen(false)}
          onSelect={handleParentSelect}
          excludeId={currentId}
        />
      )}
    </Box>
  );
};

export default LocationForm;

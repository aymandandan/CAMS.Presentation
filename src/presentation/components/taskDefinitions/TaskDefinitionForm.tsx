import React, { useCallback, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  CreateTaskDefinitionRequest,
  TimeUnit,
  WorkOrderType,
} from "@/domain/taskDefinitions/TaskDefinitionTypes";

export interface TaskDefinitionFormState {
  values: Partial<CreateTaskDefinitionRequest & { id?: string }>;
  errors: Partial<Record<keyof TaskDefinitionFormState["values"], string>>;
}

export type FormFieldValue = string | number | boolean | null;

interface TaskDefinitionFormProps {
  formState: TaskDefinitionFormState;
  onFieldChange: (
    name: keyof TaskDefinitionFormState["values"],
    value: FormFieldValue,
  ) => void;
  onSubmit: () => Promise<void>;
  onCancel?: () => void;
  onReset?: () => void;
  submitButtonLabel: string;
  backButtonPath?: string;
  isEdit?: boolean;
}

export default function TaskDefinitionForm({
  formState,
  onFieldChange,
  onSubmit,
  onCancel,
  onReset,
  submitButtonLabel,
  backButtonPath = "/task-definitions",
  isEdit = false,
}: TaskDefinitionFormProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formValues = formState.values;
  const formErrors = formState.errors;

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsSubmitting(true);
      try {
        await onSubmit();
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit],
  );

  const handleTextFieldChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFieldChange(event.target.name as any, event.target.value);
    },
    [onFieldChange],
  );

  const handleNumberFieldChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const num = parseFloat(event.target.value);
      onFieldChange(event.target.name as any, isNaN(num) ? 0 : num);
    },
    [onFieldChange],
  );

  const handleSelectChange = useCallback(
    (event: SelectChangeEvent) => {
      onFieldChange(event.target.name as any, event.target.value);
    },
    [onFieldChange],
  );

  // Cancel handler – use custom onCancel or fallback to navigation
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else if (backButtonPath) {
      navigate(backButtonPath);
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/task-definitions");
    }
  }, [onCancel, backButtonPath, navigate]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
      onReset={onReset}
      sx={{ width: "100%" }}
    >
      <Paper sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Basic Information Section */}
          <Box>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="durationValue"
                  label="Duration Value"
                  type="number"
                  value={formValues.durationValue ?? ""}
                  onChange={handleNumberFieldChange}
                  error={!!formErrors.durationValue}
                  helperText={formErrors.durationValue ?? " "}
                  slotProps={{ htmlInput: { min: 0, step: 0.1 } }}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl error={!!formErrors.durationUnit} fullWidth>
                  <InputLabel id="duration-unit-label">
                    Duration Unit
                  </InputLabel>
                  <Select
                    labelId="duration-unit-label"
                    name="durationUnit"
                    value={formValues.durationUnit ?? ""}
                    onChange={handleSelectChange}
                    label="Duration Unit"
                  >
                    {Object.values(TimeUnit).map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.durationUnit && (
                    <FormHelperText>{formErrors.durationUnit}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {/* Type – disabled in edit mode */}
                {isEdit ? (
                  <TextField
                    label="Type"
                    value={formValues.type ?? ""}
                    fullWidth
                    disabled
                    helperText={formErrors.type ?? " "}
                  />
                ) : (
                  <FormControl error={!!formErrors.type} fullWidth>
                    <InputLabel id="type-label">Type</InputLabel>
                    <Select
                      labelId="type-label"
                      name="type"
                      value={formValues.type ?? ""}
                      onChange={handleSelectChange}
                      label="Type"
                    >
                      {Object.values(WorkOrderType).map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                    {formErrors.type && (
                      <FormHelperText>{formErrors.type}</FormHelperText>
                    )}
                  </FormControl>
                )}
              </Grid>
            </Grid>
          </Box>
        </Stack>

        {/* Action Buttons – right aligned */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 3, justifyContent: "flex-end" }}
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
      </Paper>
    </Box>
  );
}

import * as React from "react";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  Stack,
  Typography,
  Paper,
} from "@mui/material";
import StoreIcon from "@mui/icons-material/Store";
import { useNavigate } from "react-router-dom";
import SpecificationsEditor from "@/presentation/components/common/SpecificationsEditor";

export interface MaterialItemFormValues {
  id?: string;
  storeId?: string;
  unitOfMeasureSymbol?: string;
  name: string;
  description?: string;
  reorderLevel: number;
  isStockable?: boolean;
  initialStock?: number;
  unitCostAmount?: number;
  unitCostCurrency?: string;
  specifications?: Record<string, string>;
}

export interface MaterialItemFormState {
  values: Partial<MaterialItemFormValues>;
  errors: Partial<Record<keyof MaterialItemFormValues, string>>;
}

export interface MaterialItemFormProps {
  formState: MaterialItemFormState;
  onFieldChange: (name: keyof MaterialItemFormValues, value: unknown) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  onReset?: () => void;
  submitLabel: string;
  backPath?: string;
  isSubmitting?: boolean;
  selectedStoreName?: string;
  onPickStore?: () => void;
  isEdit?: boolean;
}

export default function MaterialItemForm(props: MaterialItemFormProps) {
  const {
    formState,
    onFieldChange,
    onSubmit,
    onCancel,
    submitLabel,
    backPath,
    isSubmitting = false,
    selectedStoreName,
    onPickStore,
    isEdit = false,
  } = props;

  const navigate = useNavigate();
  const { values, errors } = formState;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (backPath) {
      navigate(backPath);
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/material-items");
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{ width: "100%" }}
    >
      <Paper sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* ── Basic Information ── */}
          <Box>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              {/* Store picker – only in create mode */}
              {!isEdit && onPickStore && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth error={!!errors.storeId}>
                    <Button
                      variant="outlined"
                      startIcon={<StoreIcon />}
                      onClick={onPickStore}
                      fullWidth
                      sx={{
                        justifyContent: "flex-start",
                        textTransform: "none",
                      }}
                    >
                      {selectedStoreName || "Select a store"}
                    </Button>
                    {errors.storeId && (
                      <FormHelperText error>{errors.storeId}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              )}

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Name *"
                  value={values.name ?? ""}
                  onChange={(e) => onFieldChange("name", e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name ?? " "}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={values.description ?? ""}
                  onChange={(e) => onFieldChange("description", e.target.value)}
                  error={!!errors.description}
                  helperText={errors.description ?? " "}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Reorder Level"
                  value={values.reorderLevel ?? ""}
                  onChange={(e) =>
                    onFieldChange("reorderLevel", Number(e.target.value))
                  }
                  error={!!errors.reorderLevel}
                  helperText={errors.reorderLevel ?? " "}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={"Unit of Measure" + (isEdit ? "" : " *")}
                  value={values.unitOfMeasureSymbol ?? ""}
                  onChange={(e) =>
                    onFieldChange("unitOfMeasureSymbol", e.target.value)
                  }
                  error={!!errors.unitOfMeasureSymbol}
                  helperText={errors.unitOfMeasureSymbol ?? " "}
                  disabled={isEdit} // locked in edit
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Unit Cost Amount"
                  value={values.unitCostAmount ?? ""}
                  onChange={(e) =>
                    onFieldChange("unitCostAmount", Number(e.target.value))
                  }
                  error={!!errors.unitCostAmount}
                  helperText={errors.unitCostAmount ?? " "}
                  // disabled={isEdit} // locked in edit
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Unit Cost Currency"
                  value={values.unitCostCurrency ?? "USD"}
                  onChange={(e) =>
                    onFieldChange("unitCostCurrency", e.target.value)
                  }
                  error={!!errors.unitCostCurrency}
                  helperText={errors.unitCostCurrency ?? " "}
                  disabled={isEdit} // locked in edit
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.isStockable ?? false}
                      onChange={(e) =>
                        onFieldChange("isStockable", e.target.checked)
                      }
                      disabled={isEdit} // locked in edit
                    />
                  }
                  label="Is Stockable"
                />
              </Grid>

              {values.isStockable && !isEdit && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Initial Stock"
                    value={values.initialStock ?? ""}
                    onChange={(e) =>
                      onFieldChange("initialStock", Number(e.target.value))
                    }
                    error={!!errors.initialStock}
                    helperText={errors.initialStock ?? " "}
                    disabled={isEdit}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
          {/* ── Specifications ── */}
          <Box>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              Specifications
            </Typography>
            <SpecificationsEditor
              key={values.id ?? "create"}
              value={values.specifications}
              onChange={(specs) => onFieldChange("specifications", specs)}
            />
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
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitLabel}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

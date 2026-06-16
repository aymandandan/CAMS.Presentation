// MaterialStoreForm.tsx
import * as React from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export interface MaterialStoreFormState {
  values: { code?: string; name?: string; address?: string };
  errors: Partial<Record<string, string>>;
}

export type FormFieldValue = string | number | boolean | null;

export interface MaterialStoreFormProps {
  formState: MaterialStoreFormState;
  onFieldChange: (name: string, value: FormFieldValue) => void;
  onSubmit: () => Promise<void>;
  onCancel?: () => void;
  submitButtonLabel: string;
  backButtonPath?: string;
  isEdit?: boolean;
}

export default function MaterialStoreForm(props: MaterialStoreFormProps) {
  const {
    formState,
    onFieldChange,
    onSubmit,
    onCancel,
    submitButtonLabel,
    backButtonPath,
    isEdit = false,
  } = props;

  const { values, errors } = formState;
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextFieldChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onFieldChange(event.target.name, event.target.value);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (backButtonPath) {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = backButtonPath;
      }
    } else {
      window.history.back();
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
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold" }}
              gutterBottom
            >
              Store Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="code"
                  label="Code"
                  value={values.code ?? ""}
                  onChange={handleTextFieldChange}
                  error={!!errors.code}
                  helperText={errors.code ?? " "}
                  fullWidth
                  disabled={isEdit}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="name"
                  label="Name"
                  value={values.name ?? ""}
                  onChange={handleTextFieldChange}
                  error={!!errors.name}
                  helperText={errors.name ?? " "}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  name="address"
                  label="Address (optional)"
                  value={values.address ?? ""}
                  onChange={handleTextFieldChange}
                  error={!!errors.address}
                  helperText={errors.address ?? " "}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 3, justifyContent: "flex-end" }}
        >
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : submitButtonLabel}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

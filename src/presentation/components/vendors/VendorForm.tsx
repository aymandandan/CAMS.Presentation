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
import type { CreateVendorRequest } from "@/domain/vendors/VendorTypes";

export interface VendorFormState {
  values: Partial<CreateVendorRequest>;
  errors: Partial<Record<keyof CreateVendorRequest, string>>;
}

export type FormFieldValue = string | number | boolean | null;

interface VendorFormProps {
  formState: VendorFormState;
  onFieldChange: (
    name: keyof CreateVendorRequest,
    value: FormFieldValue,
  ) => void;
  onSubmit: () => Promise<void>;
  onCancel?: () => void;
  submitButtonLabel: string;
  backButtonPath?: string;
}

export default function VendorForm(props: VendorFormProps) {
  const {
    formState,
    onFieldChange,
    onSubmit,
    onCancel,
    submitButtonLabel,
    backButtonPath,
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

  const handleChange =
    (field: keyof CreateVendorRequest) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFieldChange(field, event.target.value);
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
              Vendor Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  value={values.name ?? ""}
                  onChange={handleChange("name")}
                  name="name"
                  label="Name"
                  error={!!errors.name}
                  helperText={errors.name ?? " "}
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  value={values.email ?? ""}
                  onChange={handleChange("email")}
                  name="email"
                  label="Email"
                  type="email"
                  error={!!errors.email}
                  helperText={errors.email ?? " "}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  value={values.phone ?? ""}
                  onChange={handleChange("phone")}
                  name="phone"
                  label="Phone"
                  placeholder="+1234567890"
                  error={!!errors.phone}
                  helperText={errors.phone ?? " "}
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

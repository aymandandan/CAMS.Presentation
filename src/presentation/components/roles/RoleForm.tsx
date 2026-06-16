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
import type {
  CreateRoleRequest,
  UpdateRoleRequest,
} from "@/domain/roles/RoleTypes";

export interface RoleFormState {
  values: Partial<CreateRoleRequest & UpdateRoleRequest>;
  errors: Partial<
    Record<keyof (CreateRoleRequest & UpdateRoleRequest), string>
  >;
}

interface RoleFormProps {
  formState: RoleFormState;
  onFieldChange: (name: keyof RoleFormState["values"], value: string) => void;
  onSubmit: () => Promise<void>;
  onCancel?: () => void;
  submitButtonLabel: string;
  backButtonPath?: string;
  isEdit?: boolean;
}

export default function RoleForm({
  formState,
  onFieldChange,
  onSubmit,
  onCancel,
  submitButtonLabel,
  backButtonPath,
  isEdit = false,
}: RoleFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { values, errors } = formState;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange(
      e.target.name as keyof RoleFormState["values"],
      e.target.value,
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
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
              Role Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="name"
                  label="Name"
                  value={values.name ?? ""}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name ?? " "}
                  fullWidth
                  required
                  disabled={isEdit}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="description"
                  label="Description"
                  value={values.description ?? ""}
                  onChange={handleChange}
                  error={!!errors.description}
                  helperText={errors.description ?? " "}
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

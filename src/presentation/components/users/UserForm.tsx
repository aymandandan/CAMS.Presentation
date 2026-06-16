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
  CreateUserRequest,
  UpdateUserRequest,
} from "@/domain/users/UserTypes";

export interface UserFormState {
  values: Partial<
    CreateUserRequest & UpdateUserRequest & { password?: string }
  >;
  errors: Partial<
    Record<
      keyof (CreateUserRequest & UpdateUserRequest & { password?: string }),
      string
    >
  >;
}

interface UserFormProps {
  formState: UserFormState;
  onFieldChange: (name: keyof UserFormState["values"], value: string) => void;
  onSubmit: () => Promise<void>;
  onCancel?: () => void;
  submitButtonLabel: string;
  backButtonPath?: string;
  showPasswordField?: boolean;
  isEdit?: boolean;
}

export default function UserForm({
  formState,
  onFieldChange,
  onSubmit,
  onCancel,
  submitButtonLabel,
  backButtonPath,
  showPasswordField = false,
  isEdit = false,
}: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { values, errors } = formState;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange(
      e.target.name as keyof UserFormState["values"],
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
              User Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="fullName"
                  label="Full Name"
                  value={values.fullName ?? ""}
                  onChange={handleChange}
                  error={!!errors.fullName}
                  helperText={errors.fullName ?? " "}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  value={values.email ?? ""}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email ?? " "}
                  fullWidth
                  disabled={isEdit} // email is immutable after creation
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="phoneNumber"
                  label="Phone Number"
                  value={values.phoneNumber ?? ""}
                  onChange={handleChange}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber ?? " "}
                  fullWidth
                />
              </Grid>
              {showPasswordField && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name="password"
                    label="Password"
                    type="password"
                    value={(values as any).password ?? ""}
                    onChange={handleChange}
                    error={!!(errors as any).password}
                    helperText={
                      (errors as any).password ?? "At least 8 characters"
                    }
                    fullWidth
                  />
                </Grid>
              )}
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

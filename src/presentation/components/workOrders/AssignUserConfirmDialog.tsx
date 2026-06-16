import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Avatar,
  Box,
  CircularProgress,
  Grid,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import type { UserListItemDto } from "@/domain/users/UserTypes";

interface AssignUserConfirmDialogProps {
  open: boolean;
  user: UserListItemDto | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const AssignUserConfirmDialog: React.FC<AssignUserConfirmDialogProps> = ({
  open,
  user,
  onConfirm,
  onCancel,
  loading,
}) => {
  if (!user) return null;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Assign Employee to Work Order</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              mx: "auto",
              mb: 1,
              bgcolor: "primary.main",
            }}
          >
            <PersonIcon fontSize="large" />
          </Avatar>
          <Typography variant="h6">{user.fullName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user.roles.join(", ")}
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="overline">Email</Typography>
            <Typography>{user.email}</Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} /> : null}
        >
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignUserConfirmDialog;

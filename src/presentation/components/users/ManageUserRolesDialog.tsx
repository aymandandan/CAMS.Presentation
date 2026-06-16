import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormControl,
  FormLabel,
  CircularProgress,
  Alert,
} from "@mui/material";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import { useRoles, useUpdateUserRoles } from "@/application/hooks/roles/useRoles";

interface ManageUserRolesDialogProps {
  userId: string;
  open: boolean;
  initialRoles: string[]; // role names currently assigned
  onClose: () => void;
  onRolesUpdated: () => void; // callback to refresh user data
}

export default function ManageUserRolesDialog({
  userId,
  open,
  initialRoles,
  onClose,
  onRolesUpdated,
}: ManageUserRolesDialogProps) {
  const { data: allRoles, isLoading, error } = useRoles();
  const { mutate: updateRoles, isPending: isUpdating } = useUpdateUserRoles();
  const notifications = useNotifications();

  // Local state: set of selected role names
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set(initialRoles));

  // Sync when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedRoles(new Set(initialRoles));
    }
  }, [open, initialRoles]);

  const handleToggle = (roleName: string) => {
    setSelectedRoles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(roleName)) {
        newSet.delete(roleName);
      } else {
        newSet.add(roleName);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    if (!allRoles) return;

    // Map selected role names to IDs
    const roleIds = allRoles
      .filter((role) => selectedRoles.has(role.name))
      .map((role) => role.id);

    updateRoles(
      { userId, roleIds },
      {
        onSuccess: () => {
          notifications.show("Roles updated successfully", { severity: "success" });
          onRolesUpdated();
          onClose();
        },
        onError: (err: any) => {
          notifications.show(`Failed to update roles: ${err.message}`, { severity: "error" });
        },
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Manage User Roles</DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">Failed to load roles</Alert>
        ) : (
          <FormControl component="fieldset">
            <FormLabel component="legend">Select roles</FormLabel>
            <FormGroup>
              {allRoles?.map((role) => (
                <FormControlLabel
                  key={role.id}
                  control={
                    <Checkbox
                      checked={selectedRoles.has(role.name)}
                      onChange={() => handleToggle(role.name)}
                    />
                  }
                  label={role.name}
                />
              ))}
            </FormGroup>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isUpdating}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isLoading || !!error || isUpdating}
        >
          {isUpdating ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
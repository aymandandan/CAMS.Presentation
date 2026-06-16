import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import {
  useUserPermissions,
  useBatchGrantUserPermission,
  useBatchRevokeUserPermission,
} from "@/application/hooks/permissions/usePermissions";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import { allPermissions } from "@/domain/shared/PermissionCatalog";

interface Props {
  userId: string;
  open: boolean;
  onClose: () => void;
  onPermissionsChanged: () => void;
}

export default function ManageUserPermissionsDialog({
  userId,
  open,
  onClose,
  onPermissionsChanged,
}: Props) {
  const {
    data: currentPerms = [],
    isLoading,
    error,
  } = useUserPermissions(userId);
  const batchGrant = useBatchGrantUserPermission();
  const batchRevoke = useBatchRevokeUserPermission();
  const notifications = useNotifications();

  const currentPermNames = React.useMemo(
    () => currentPerms.map((p) => p.name),
    [currentPerms],
  );

  const [pendingChanges, setPendingChanges] = React.useState<
    Record<string, boolean>
  >({});

  React.useEffect(() => {
    setPendingChanges({});
  }, [open]);

  const handleToggle = (permissionName: string) => {
    const currentlyHas = currentPermNames.includes(permissionName);
    const pending = pendingChanges[permissionName];
    const newState = pending !== undefined ? !pending : !currentlyHas;
    setPendingChanges((prev) => ({ ...prev, [permissionName]: newState }));
  };

  const handleSave = async () => {
    const grantList: string[] = [];
    const revokeList: string[] = [];
    Object.entries(pendingChanges).forEach(([perm, shouldHave]) => {
      const currentlyHas = currentPermNames.includes(perm);
      if (shouldHave && !currentlyHas) grantList.push(perm);
      else if (!shouldHave && currentlyHas) revokeList.push(perm);
    });

    try {
      const requests: Promise<void>[] = [];
      if (grantList.length) {
        requests.push(
          batchGrant.mutateAsync({ userId, permissionNames: grantList }),
        );
      }
      if (revokeList.length) {
        requests.push(
          batchRevoke.mutateAsync({ userId, permissionNames: revokeList }),
        );
      }
      if (requests.length) await Promise.all(requests);

      notifications.show("Permissions updated", { severity: "success" });
      onPermissionsChanged();
      onClose();
    } catch (err) {
      notifications.show(`Failed: ${(err as Error).message}`, {
        severity: "error",
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage User Permissions</DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{(error as Error).message}</Alert>
        ) : (
          <FormGroup>
            <Stack spacing={1}>
              {allPermissions.map((perm) => {
                const currentlyHas = currentPermNames.includes(perm.name);
                const toggled =
                  pendingChanges[perm.name] !== undefined
                    ? pendingChanges[perm.name]
                    : currentlyHas;
                return (
                  <FormControlLabel
                    key={perm.name}
                    control={
                      <Checkbox
                        checked={toggled}
                        onChange={() => handleToggle(perm.name)}
                        disabled={batchGrant.isPending || batchRevoke.isPending}
                      />
                    }
                    label={
                      <Box>
                        {/* <Typography variant="body2">{perm.name}</Typography> */}
                        <Typography variant="caption" color="text.secondary">
                          {perm.description}
                        </Typography>
                      </Box>
                    }
                  />
                );
              })}
            </Stack>
          </FormGroup>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={batchGrant.isPending || batchRevoke.isPending}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

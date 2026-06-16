import { useState, useCallback } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Alert,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import KeyIcon from "@mui/icons-material/Key";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import PageContainer from "@/presentation/components/PageContainer";
import { useDialogs } from "@/application/hooks/useDialogs/useDialogs";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import { useRole, useDeleteRole } from "@/application/hooks/roles/useRoles";
import {
  useRolePermissions,
  useRevokeRolePermission,
} from "@/application/hooks/permissions/usePermissions";
import ManageRolePermissionsDialog from "@/presentation/components/roles/ManageRolePermissionsDialog";
import { permissionDescriptionMap } from "@/domain/shared/PermissionCatalog";

export default function RoleShow() {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const {
    data: role,
    isLoading: roleLoading,
    isError: roleError,
    error: roleErrorData,
  } = useRole(roleId!);
  const {
    data: permissions = [],
    isLoading: permsLoading,
    refetch: refetchPerms,
  } = useRolePermissions(role?.name ?? "");

  const deleteMutation = useDeleteRole();
  const revokeMutation = useRevokeRolePermission();

  const [manageOpen, setManageOpen] = useState(false);

  const goBack = useCallback(() => {
    const from = location.state?.from;

    const isEditOrCreatePage = (path: string): boolean => {
      return (
        /\/roles\/create$/.test(path) ||
        /\/roles\/.+\/edit$/.test(path)
      );
    };

    if (from && typeof from === "string" && !isEditOrCreatePage(from)) {
      navigate(from);
    } else {
      navigate("/roles");
    }
  }, [navigate, location.state]);

  const handleEdit = useCallback(() => {
    navigate(`/roles/${roleId}/edit`);
  }, [navigate, roleId]);

  const handleDelete = useCallback(async () => {
    if (!role) return;
    const confirmed = await dialogs.confirm(`Delete role "${role.name}"?`, {
      title: "Delete role",
      severity: "error",
      okText: "Delete",
    });
    if (!confirmed) return;
    deleteMutation.mutate(role.id, {
      onSuccess: () => {
        notifications.show("Role deleted", { severity: "success" });
        navigate("/roles");
      },
      onError: (err) =>
        notifications.show(`Error: ${(err as Error).message}`, {
          severity: "error",
        }),
    });
  }, [role, dialogs, deleteMutation, notifications, navigate]);

  const handleRevoke = useCallback(
    async (permissionName: string) => {
      if (!role) return;
      const confirmed = await dialogs.confirm(
        `Revoke "${permissionName}" from ${role.name}?`,
        {
          title: "Revoke permission",
          severity: "warning",
          okText: "Revoke",
        },
      );
      if (!confirmed) return;
      revokeMutation.mutate(
        { roleName: role.name, permissionName },
        {
          onSuccess: () => {
            notifications.show("Permission revoked", { severity: "success" });
            refetchPerms();
          },
          onError: (err) =>
            notifications.show(`Error: ${(err as Error).message}`, {
              severity: "error",
            }),
        },
      );
    },
    [role, dialogs, revokeMutation, notifications, refetchPerms],
  );

  if (roleLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (roleError || !role) {
    return (
      <Alert severity="error">
        {(roleErrorData as Error)?.message || "Role not found"}
      </Alert>
    );
  }

  return (
    <PageContainer
      title={role.name}
      breadcrumbs={[{ title: "Roles", path: "/roles" }, { title: role.name }]}
    >
      {/* Top action bar */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 3, justifyContent: "space-between", flexWrap: "wrap" }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={goBack}
        >
          Back
        </Button>
        <Stack direction="row" spacing={2}>
          <Can requiredPermissions={[Permissions.Roles.Update]}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit
            </Button>
          </Can>
        </Stack>
      </Stack>

      {/* Main role card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={<KeyIcon color="primary" />}
          title={
            <Typography variant="h5" component="span">
              {role.name}
            </Typography>
          }
        />
        <CardContent>
          <Box>
            <Typography variant="overline" color="textSecondary">
              Description
            </Typography>
            <Typography variant="body1">
              {role.description || "No description"}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Permissions card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={<AdminPanelSettingsIcon color="primary" />}
          title="Permissions"
          action={
            <Can requiredPermissions={[Permissions.Roles.GrantPermission]}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setManageOpen(true)}
                size="small"
              >
                Manage
              </Button>
            </Can>
          }
        />
        <CardContent>
          {permsLoading ? (
            <CircularProgress size={24} />
          ) : permissions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No permissions assigned.
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, pt: 1 }}>
              {permissions.map((perm) => (
                <Tooltip
                  key={perm.id}
                  title={permissionDescriptionMap[perm.name] || perm.name}
                  arrow
                >
                  <Chip
                    label={permissionDescriptionMap[perm.name] || perm.name}
                    onDelete={() => handleRevoke(perm.name)}
                    color="primary"
                    variant="outlined"
                  />
                </Tooltip>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* Bottom action bar */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ justifyContent: "flex-end", flexWrap: "wrap" }}
      >
        <Can requiredPermissions={[Permissions.Roles.Delete]}>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </Can>
      </Stack>

      {manageOpen && (
        <ManageRolePermissionsDialog
          roleName={role.name}
          open={manageOpen}
          onClose={() => setManageOpen(false)}
          onPermissionsChanged={refetchPerms}
        />
      )}
    </PageContainer>
  );
}

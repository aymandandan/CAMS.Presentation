import { useState, useCallback } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Chip,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";
import PasswordIcon from "@mui/icons-material/Password";
import EmailIcon from "@mui/icons-material/Email";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import PageContainer from "@/presentation/components/PageContainer";
import { useDialogs } from "@/application/hooks/useDialogs/useDialogs";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import {
  useUser,
  useDeleteUser,
  useActivateUser,
  useDeactivateUser,
} from "@/application/hooks/users/useUsers";
import ManageUserPermissionsDialog from "@/presentation/components/users/ManageUserPermissionsDialog";
import UserChangePasswordDialog from "@/presentation/components/users/UserChangePasswordDialog";
import ManageUserRolesDialog from "@/presentation/components/users/ManageUserRolesDialog";

export default function UserShow() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const { data: user, isLoading, isError, error, refetch } = useUser(userId!);
  const deleteMutation = useDeleteUser();
  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [managePermsOpen, setManagePermsOpen] = useState(false);
  const [manageRolesOpen, setManageRolesOpen] = useState(false);

  const goBack = useCallback(() => {
    const from = location.state?.from;

    const isEditOrCreatePage = (path: string): boolean => {
      return /\/users\/create$/.test(path) || /\/users\/.+\/edit$/.test(path);
    };

    if (from && typeof from === "string" && !isEditOrCreatePage(from)) {
      navigate(from);
    } else {
      navigate("/users");
    }
  }, [navigate, location.state]);

  const handleEdit = useCallback(() => {
    navigate(`/users/${userId}/edit`);
  }, [navigate, userId]);

  const handleDelete = useCallback(async () => {
    if (!user) return;
    const confirmed = await dialogs.confirm(`Delete user ${user.fullName}?`, {
      title: "Delete user",
      severity: "error",
      okText: "Delete",
    });
    if (!confirmed) return;
    deleteMutation.mutate(user.id, {
      onSuccess: () => {
        notifications.show("User deleted", { severity: "success" });
        navigate("/users");
      },
      onError: (err) =>
        notifications.show(`Error: ${(err as Error).message}`, {
          severity: "error",
        }),
    });
  }, [user, dialogs, deleteMutation, notifications, navigate]);

  const toggleActive = useCallback(async () => {
    if (!user) return;
    const action = user.isActive ? "deactivate" : "activate";
    const confirmed = await dialogs.confirm(`${action} this user?`, {
      title: `${action} user`,
      severity: "warning",
      okText: action,
    });
    if (!confirmed) return;
    const mutation = user.isActive ? deactivateMutation : activateMutation;
    mutation.mutate(user.id, {
      onSuccess: () => {
        notifications.show(`User ${action}d`, { severity: "success" });
        refetch();
      },
      onError: (err) =>
        notifications.show(`Error: ${(err as Error).message}`, {
          severity: "error",
        }),
    });
  }, [
    user,
    activateMutation,
    deactivateMutation,
    dialogs,
    notifications,
    refetch,
  ]);

  const handleSendPasswordReset = useCallback(async () => {
    if (!user) return;
    const confirmed = await dialogs.confirm(
      `Send password reset email to ${user.email}?`,
      {
        title: "Send password reset",
        severity: "info",
        okText: "Send",
      },
    );
    if (!confirmed) return;
    try {
      const { forgotPassword } = await import("@/infrastructure/api/userApi");
      await forgotPassword({ email: user.email });
      notifications.show("Password reset email sent", { severity: "success" });
    } catch (err) {
      notifications.show(`Failed: ${(err as Error).message}`, {
        severity: "error",
      });
    }
  }, [user, dialogs, notifications]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !user) {
    return (
      <Alert severity="error">
        {(error as Error)?.message || "User not found"}
      </Alert>
    );
  }

  return (
    <PageContainer
      title={`User ${user.fullName}`}
      breadcrumbs={[
        { title: "Users", path: "/users" },
        { title: user.fullName },
      ]}
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
          <Can requiredPermissions={[Permissions.Users.Update]}>
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

      {/* Main user card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={<PersonIcon color="primary" />}
          title={
            <Typography variant="h5" component="span">
              {user.fullName}
            </Typography>
          }
          action={
            <Chip
              label={user.isActive ? "Active" : "Inactive"}
              color={user.isActive ? "success" : "default"}
              size="medium"
            />
          }
        />
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="overline" color="textSecondary">
                Email
              </Typography>
              <Typography variant="body1">{user.email}</Typography>
            </Box>
            {/* <Box>
              <Typography variant="overline" color="textSecondary">
                Application User ID
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                {user.applicationUserId}
              </Typography>
            </Box> */}
            <Box>
              <Typography variant="overline" color="textSecondary">
                Phone Number
              </Typography>
              <Typography variant="body1">{user.phoneNumber}</Typography>
            </Box>
            <Box>
              <Typography variant="overline" color="textSecondary">
                Roles
              </Typography>
              <Typography variant="body1">
                {user.roles?.length ? user.roles.join(", ") : "None"}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap" }}>
        <Button
          startIcon={<PasswordIcon />}
          variant="outlined"
          onClick={() => setChangePasswordOpen(true)}
        >
          Change Password
        </Button>
        <Button
          startIcon={<EmailIcon />}
          variant="outlined"
          onClick={handleSendPasswordReset}
        >
          Send Password Reset
        </Button>
        <Can
          requiredPermissions={[
            Permissions.Users.GrantPermission,
            Permissions.Users.RevokePermission,
          ]}
        >
          <Button
            startIcon={<AdminPanelSettingsIcon />}
            variant="outlined"
            onClick={() => setManagePermsOpen(true)}
          >
            Manage Permissions
          </Button>
        </Can>
        <Can requiredPermissions={[Permissions.Roles.Assign]}>
          <Button
            startIcon={<AdminPanelSettingsIcon />}
            variant="outlined"
            onClick={() => setManageRolesOpen(true)}
          >
            Manage Roles
          </Button>
        </Can>
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Bottom action bar */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ justifyContent: "flex-end", flexWrap: "wrap" }}
      >
        <Can
          requiredPermissions={[
            user.isActive
              ? Permissions.Users.Deactivate
              : Permissions.Users.Activate,
          ]}
        >
          <Button
            startIcon={user.isActive ? <LockIcon /> : <LockOpenIcon />}
            variant="outlined"
            color={user.isActive ? "warning" : "success"}
            onClick={toggleActive}
          >
            {user.isActive ? "Deactivate" : "Activate"}
          </Button>
        </Can>
        <Can requiredPermissions={[Permissions.Users.Delete]}>
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

      {/* Dialogs */}
      {changePasswordOpen && (
        <UserChangePasswordDialog
          userId={user.id}
          open={changePasswordOpen}
          onClose={() => setChangePasswordOpen(false)}
        />
      )}
      {managePermsOpen && (
        <ManageUserPermissionsDialog
          userId={user.id}
          open={managePermsOpen}
          onClose={() => setManagePermsOpen(false)}
          onPermissionsChanged={() => refetch()}
        />
      )}
      {manageRolesOpen && (
        <ManageUserRolesDialog
          userId={user.id}
          open={manageRolesOpen}
          initialRoles={user.roles}
          onClose={() => setManageRolesOpen(false)}
          onRolesUpdated={() => refetch()}
        />
      )}
    </PageContainer>
  );
}

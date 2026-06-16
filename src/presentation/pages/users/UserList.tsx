import { useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
  gridClasses,
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";
import PasswordIcon from "@mui/icons-material/Password";
import SearchIcon from "@mui/icons-material/Search";
import { useDialogs } from "@/application/hooks/useDialogs/useDialogs";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import PageContainer from "@/presentation/components/PageContainer";
import {
  useUsers,
  useDeleteUser,
  useActivateUser,
  useDeactivateUser,
} from "@/application/hooks/users/useUsers";
import UserChangePasswordDialog from "@/presentation/components/users/UserChangePasswordDialog";
import { useHasPermissions } from "@/application/hooks/usePermission/usePermission";
import { UsersQueryRequest } from "@/domain/users/UserTypes";

const SERVER_SIDE_SORT = true; // toggle for client‑side sorting
const INITIAL_PAGE_SIZE = 10;

export default function UserList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const { hasPermission } = useHasPermissions();

  // URL‑driven state
  const page = Number(searchParams.get("page") || "0");
  const pageSize = Number(
    searchParams.get("pageSize") || String(INITIAL_PAGE_SIZE),
  );
  const appliedSearch = searchParams.get("search") || "";
  const appliedSortBy = searchParams.get("sortBy") || "";
  const appliedSortDirection = searchParams.get("sortDirection") as
    | "asc"
    | "desc"
    | "";

  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [changePasswordUserId, setChangePasswordUserId] = useState<
    string | null
  >(null);

  // URL helpers
  const setFilters = useCallback(
    (updates: Record<string, string | undefined>) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        Object.entries(updates).forEach(([key, value]) => {
          if (value) newParams.set(key, value);
          else newParams.delete(key);
        });
        newParams.set("page", "0");
        return newParams;
      });
    },
    [setSearchParams],
  );

  // Query params
  const params: UsersQueryRequest = useMemo(
    () => ({
      page: page + 1,
      pageSize,
      searchTerm: appliedSearch || undefined,
      sortBy: SERVER_SIDE_SORT ? appliedSortBy || undefined : undefined,
      sortDirection: SERVER_SIDE_SORT
        ? appliedSortDirection || undefined
        : undefined,
    }),
    [page, pageSize, appliedSearch, appliedSortBy, appliedSortDirection],
  );

  const { data, isLoading, error, refetch } = useUsers(params);

  // Mutations
  const deleteMutation = useDeleteUser();
  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();

  // Pagination
  const handlePaginationModelChange = useCallback(
    (model: GridPaginationModel) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("page", String(model.page));
        newParams.set("pageSize", String(model.pageSize));
        return newParams;
      });
    },
    [setSearchParams],
  );

  // Sorting
  const handleSortModelChange = useCallback(
    (model: GridSortModel) => {
      setSortModel(model);
      if (SERVER_SIDE_SORT) {
        const first = model[0];
        setFilters({
          sortBy: first?.field || undefined,
          sortDirection: first?.sort || undefined,
        });
      }
    },
    [SERVER_SIDE_SORT, setFilters],
  );

  // Search
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters({ search: e.target.value || undefined });
    },
    [setFilters],
  );

  // Row actions
  const handleEdit = useCallback(
    (userId: string) => () => navigate(`/users/${userId}/edit`),
    [navigate],
  );

  const executeDelete = useCallback(
    async (id: string) => {
      const confirmed = await dialogs.confirm("Delete this user?", {
        title: "Delete user",
        severity: "error",
        okText: "Delete",
      });
      if (!confirmed) return;
      deleteMutation.mutate(id, {
        onSuccess: () =>
          notifications.show("User deleted", { severity: "success" }),
        onError: (err) =>
          notifications.show(`Deletion failed: ${(err as Error).message}`, {
            severity: "error",
          }),
      });
    },
    [dialogs, deleteMutation, notifications],
  );

  const toggleActive = useCallback(
    async (id: string, currentlyActive: boolean) => {
      const action = currentlyActive ? "deactivate" : "activate";
      const confirmed = await dialogs.confirm(`${action} this user?`, {
        title: `${action} user`,
        severity: "warning",
        okText: action,
      });
      if (!confirmed) return;
      const mutation = currentlyActive ? deactivateMutation : activateMutation;
      mutation.mutate(id, {
        onSuccess: () =>
          notifications.show(`User ${action}d`, { severity: "success" }),
        onError: (err) =>
          notifications.show(`Operation failed: ${(err as Error).message}`, {
            severity: "error",
          }),
      });
    },
    [dialogs, activateMutation, deactivateMutation, notifications],
  );

  // Columns
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "fullName",
        headerName: "Full Name",
        flex: 1,
        minWidth: 180,
        sortable: true,
      },
      {
        field: "email",
        headerName: "Email",
        flex: 1,
        minWidth: 200,
        sortable: true,
      },
      {
        field: "roles",
        headerName: "Roles",
        width: 120,
        sortable: false,
        valueGetter: (_, row) => row.roles?.join(", ") ?? "",
      },
      {
        field: "isActive",
        headerName: "Active",
        width: 60,
        type: "boolean",
        sortable: true,
      },
      { field: "phoneNumber", headerName: "Phone", flex: 1, sortable: true },
      {
        field: "actions",
        type: "actions",
        flex: 0.7,
        align: "right",
        sortable: false,
        getActions: ({ row }) => {
          const items = [
            <GridActionsCellItem
              key="edit"
              icon={<EditIcon fontSize="small" />}
              label="Edit"
              onClick={handleEdit(row.id)}
              showInMenu
            />,
          ];

          if (hasPermission(Permissions.Users.Delete)) {
            items.push(
              <GridActionsCellItem
                key="delete"
                icon={<DeleteIcon fontSize="small" />}
                label="Delete"
                onClick={() => executeDelete(row.id)}
                showInMenu
              />,
            );
          }

          if (hasPermission(Permissions.Users.Activate) && !row.isActive) {
            items.push(
              <GridActionsCellItem
                key="activate"
                icon={<LockOpenIcon fontSize="small" />}
                label="Activate"
                onClick={() => toggleActive(row.id, false)}
                showInMenu
              />,
            );
          }

          if (hasPermission(Permissions.Users.Deactivate) && row.isActive) {
            items.push(
              <GridActionsCellItem
                key="deactivate"
                icon={<LockIcon fontSize="small" />}
                label="Deactivate"
                onClick={() => toggleActive(row.id, true)}
                showInMenu
              />,
            );
          }

          items.push(
            <GridActionsCellItem
              key="change-password"
              icon={<PasswordIcon fontSize="small" />}
              label="Change Password"
              onClick={() => setChangePasswordUserId(row.id)}
              showInMenu
            />,
          );

          return items;
        },
      },
    ],
    [executeDelete, toggleActive, handleEdit, hasPermission],
  );

  return (
    <Can
      requiredPermissions={[Permissions.Users.View]}
      fallback={
        <PageContainer title="Users">
          <Alert severity="error">
            You do not have permission to view users.
          </Alert>
        </PageContainer>
      }
    >
      <PageContainer
        title="Users"
        breadcrumbs={[{ title: "Users" }]}
        actions={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Tooltip title="Refresh">
              <IconButton
                size="small"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Can requiredPermissions={[Permissions.Users.Create]}>
              <Button
                variant="contained"
                startIcon={<AddIcon fontSize="small" />}
                onClick={() => navigate("/users/new")}
              >
                Create
              </Button>
            </Can>
          </Stack>
        }
      >
        <Box sx={{ flex: 1, width: "100%" }}>
          {/* Search */}
          <TextField
            size="small"
            placeholder="Search by name or email…"
            value={appliedSearch}
            onChange={handleSearchChange}
            sx={{ mb: 2, width: 300 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />

          {error ? (
            <Alert severity="error">{(error as Error).message}</Alert>
          ) : (
            <DataGrid
              rows={data?.items ?? []}
              rowCount={data?.totalCount ?? 0}
              columns={columns}
              paginationMode="server"
              sortingMode={SERVER_SIDE_SORT ? "server" : "client"}
              paginationModel={{ page, pageSize }}
              onPaginationModelChange={handlePaginationModelChange}
              sortModel={sortModel}
              onSortModelChange={handleSortModelChange}
              loading={isLoading}
              pageSizeOptions={[5, 10, 25]}
              onRowClick={({ row }) => navigate(`/users/${row.id}`)}
              disableRowSelectionOnClick
              sx={{
                [`& .${gridClasses.row}:hover`]: { cursor: "pointer" },
              }}
            />
          )}
        </Box>

        {changePasswordUserId && (
          <UserChangePasswordDialog
            userId={changePasswordUserId}
            open={!!changePasswordUserId}
            onClose={() => setChangePasswordUserId(null)}
          />
        )}
      </PageContainer>
    </Can>
  );
}

import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  gridClasses,
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import PageContainer from "@/presentation/components/PageContainer";
import { useRoles, useDeleteRole } from "@/application/hooks/roles/useRoles";
import { useDialogs } from "@/application/hooks/useDialogs/useDialogs";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import { useHasPermissions } from "@/application/hooks/usePermission/usePermission";

const INITIAL_PAGE_SIZE = 10;

export default function RolesList() {
  const navigate = useNavigate();
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const { hasPermission } = useHasPermissions();

  const { data: roles = [], isLoading, error, refetch } = useRoles();
  const deleteMutation = useDeleteRole();

  // Client‑side search
  const [searchTerm, setSearchTerm] = useState("");

  // Filtered rows
  const filteredRoles = useMemo(() => {
    if (!searchTerm.trim()) return roles;
    const lower = searchTerm.toLowerCase();
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(lower) ||
        (role.description && role.description.toLowerCase().includes(lower)),
    );
  }, [roles, searchTerm]);

  const handleDelete = useCallback(
    async (roleId: string, roleName: string) => {
      const confirmed = await dialogs.confirm(`Delete role "${roleName}"?`, {
        title: "Delete role",
        severity: "error",
        okText: "Delete",
      });
      if (!confirmed) return;
      deleteMutation.mutate(roleId, {
        onSuccess: () =>
          notifications.show("Role deleted", { severity: "success" }),
        onError: (err) =>
          notifications.show(`Error: ${(err as Error).message}`, {
            severity: "error",
          }),
      });
    },
    [dialogs, deleteMutation, notifications],
  );

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "name", headerName: "Name", flex: 1, minWidth: 180 },
      {
        field: "description",
        headerName: "Description",
        flex: 2,
        minWidth: 250,
      },
      {
        field: "actions",
        type: "actions",
        flex: 0.7,
        align: "right",
        getActions: ({ row }) => {
          const items = [
            <GridActionsCellItem
              key="view"
              icon={<VisibilityIcon fontSize="small" />}
              label="View"
              onClick={() => navigate(`/roles/${row.id}`)}
              showInMenu
            />,
          ];

          if (hasPermission(Permissions.Roles.Update)) {
            items.push(
              <GridActionsCellItem
                key="edit"
                icon={<EditIcon fontSize="small" />}
                label="Edit"
                onClick={() => navigate(`/roles/${row.id}/edit`)}
                showInMenu
              />,
            );
          }

          if (hasPermission(Permissions.Roles.Delete)) {
            items.push(
              <GridActionsCellItem
                key="delete"
                icon={<DeleteIcon fontSize="small" />}
                label="Delete"
                onClick={() => handleDelete(row.id, row.name)}
                showInMenu
              />,
            );
          }

          return items;
        },
      },
    ],
    [handleDelete, navigate, hasPermission],
  );

  return (
    <Can
      requiredPermissions={[Permissions.Roles.Read]}
      fallback={
        <PageContainer title="Roles">
          <Alert severity="error">
            You do not have permission to view roles.
          </Alert>
        </PageContainer>
      }
    >
      <PageContainer
        title="Roles"
        breadcrumbs={[{ title: "Roles" }]}
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
            <Can requiredPermissions={[Permissions.Roles.Create]}>
              <Button
                variant="contained"
                startIcon={<AddIcon fontSize="small" />}
                onClick={() => navigate("/roles/new")}
              >
                Create
              </Button>
            </Can>
          </Stack>
        }
      >
        <Box sx={{ flex: 1, width: "100%" }}>
          {/* Client‑side search */}
          <TextField
            size="small"
            placeholder="Search by name or description…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2, width: 350 }}
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
              rows={filteredRoles}
              columns={columns}
              getRowId={(row) => row.id}
              loading={isLoading}
              onRowClick={({ row }) => navigate(`/roles/${row.id}`)}
              disableRowSelectionOnClick
              pageSizeOptions={[5, 10, 25]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: INITIAL_PAGE_SIZE },
                },
              }}
              sx={{
                [`& .${gridClasses.row}:hover`]: { cursor: "pointer" },
              }}
            />
          )}
        </Box>
      </PageContainer>
    </Can>
  );
}

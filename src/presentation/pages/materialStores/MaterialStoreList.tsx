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
import SearchIcon from "@mui/icons-material/Search";
import { useDialogs } from "@/application/hooks/useDialogs/useDialogs";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import type { MaterialStoreDto } from "@/domain/materialStores/MaterialStoreTypes";
import { Permissions } from "@/domain/shared/Permissions";
import PageContainer from "@/presentation/components/PageContainer";
import {
  useDeleteMaterialStoreMutation,
  useMaterialStoresQuery,
} from "@/application/hooks/materialStores/useMaterialStores";
import { Can } from "@/presentation/components/Can";

const SERVER_SIDE_SORT = true; // toggle for client‑side sorting
const INITIAL_PAGE_SIZE = 10;

export default function MaterialStoreList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dialogs = useDialogs();
  const notifications = useNotifications();

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

  // Sorting model for UI
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  // Query
  const queryParams = useMemo(
    () => ({
      page: page + 1,
      pageSize,
      searchTerm: appliedSearch || undefined,
      sortBy: SERVER_SIDE_SORT ? appliedSortBy || undefined : undefined,
      sortDirection: SERVER_SIDE_SORT ? appliedSortDirection || "asc" : "asc",
    }),
    [page, pageSize, appliedSearch, appliedSortBy, appliedSortDirection],
  );

  const { data, isLoading, isError, error, refetch } =
    useMaterialStoresQuery(queryParams);
  const deleteMutation = useDeleteMaterialStoreMutation();

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
    (store: MaterialStoreDto) => () =>
      navigate(`/material-stores/${store.id}/edit`),
    [navigate],
  );

  const handleDelete = useCallback(
    (store: MaterialStoreDto) => async () => {
      const confirmed = await dialogs.confirm(
        `Do you wish to delete ${store.name}?`,
        {
          title: "Delete material store?",
          severity: "error",
          okText: "Delete",
          cancelText: "Cancel",
        },
      );
      if (confirmed) {
        try {
          await deleteMutation.mutateAsync(store.id);
          notifications.show("Material store deleted successfully.", {
            severity: "success",
            autoHideDuration: 3000,
          });
        } catch (deleteError) {
          notifications.show(
            `Failed to delete material store. Reason: ${(deleteError as Error).message}`,
            { severity: "error", autoHideDuration: 3000 },
          );
        }
      }
    },
    [dialogs, deleteMutation, notifications],
  );

  // Columns
  const columns: GridColDef<MaterialStoreDto>[] = useMemo(
    () => [
      { field: "code", headerName: "Code", flex: 1, sortable: true },
      { field: "name", headerName: "Name", flex: 2, sortable: true },
      { field: "address", headerName: "Address", flex: 2, sortable: true },
      {
        field: "actions",
        type: "actions",
        flex: 1,
        align: "right",
        sortable: false,
        getActions: ({ row }) => [
          <Can
            key="edit"
            requiredPermissions={[Permissions.MaterialStores.Edit]}
          >
            <GridActionsCellItem
              icon={<EditIcon fontSize="small" />}
              label="Edit"
              onClick={handleEdit(row)}
            />
          </Can>,
          <Can
            key="delete"
            requiredPermissions={[Permissions.MaterialStores.Delete]}
          >
            <GridActionsCellItem
              icon={<DeleteIcon fontSize="small" />}
              label="Delete"
              onClick={handleDelete(row)}
            />
          </Can>,
        ],
      },
    ],
    [handleEdit, handleDelete],
  );

  return (
    <PageContainer
      title="Material Stores"
      breadcrumbs={[{ title: "Material Stores" }]}
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
          <Can requiredPermissions={[Permissions.MaterialStores.Create]}>
            <Button
              variant="contained"
              startIcon={<AddIcon fontSize="small" />}
              onClick={() => navigate("/material-stores/new")}
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
          fullWidth
          placeholder="Search by code or name…"
          value={appliedSearch}
          onChange={handleSearchChange}
          sx={{ mb: 2 }}
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

        {isError ? (
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
            disableRowSelectionOnClick
            onRowClick={({ row }) => navigate(`/material-stores/${row.id}`)}
            pageSizeOptions={[5, 10, 25]}
            sx={{
              [`& .${gridClasses.row}:hover`]: { cursor: "pointer" },
            }}
          />
        )}
      </Box>
    </PageContainer>
  );
}

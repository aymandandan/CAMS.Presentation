import { useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Stack,
  TextField,
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
import PageContainer from "@/presentation/components/PageContainer";
import { useDialogs } from "@/application/hooks/useDialogs/useDialogs";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import {
  useCategories,
  useDeleteCategory,
} from "@/application/hooks/categories/useCategories";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import type { CategoriesQueryParams } from "@/domain/categories/CategoryTypes";

const SERVER_SIDE_SORT = true; // set to false for client-side sorting
const INITIAL_PAGE_SIZE = 10;

export default function CategoryList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dialogs = useDialogs();
  const notifications = useNotifications();
  const deleteMutation = useDeleteCategory();

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

  // Local UI state
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  // Build query params
  const queryParams: CategoriesQueryParams = useMemo(
    () => ({
      searchTerm: appliedSearch || undefined,
      page: page + 1,
      pageSize,
      isPagingEnabled: true,
      sortBy: SERVER_SIDE_SORT ? appliedSortBy || undefined : undefined,
      sortDirection: SERVER_SIDE_SORT
        ? appliedSortDirection || undefined
        : undefined,
    }),
    [page, pageSize, appliedSearch, appliedSortBy, appliedSortDirection],
  );

  const { data, isLoading, isError, error, refetch } =
    useCategories(queryParams);

  // Pagination handler
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

  // Sort handler
  const handleSortModelChange = useCallback(
    (model: GridSortModel) => {
      setSortModel(model);
      if (SERVER_SIDE_SORT) {
        const first = model[0];
        setSearchParams((prev) => {
          const newParams = new URLSearchParams(prev);
          if (first?.field) {
            newParams.set("sortBy", first.field);
            newParams.set("sortDirection", first.sort || "");
          } else {
            newParams.delete("sortBy");
            newParams.delete("sortDirection");
          }
          return newParams;
        });
      }
    },
    [SERVER_SIDE_SORT, setSearchParams],
  );

  // Search handler
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        if (e.target.value) {
          newParams.set("search", e.target.value);
        } else {
          newParams.delete("search");
        }
        newParams.set("page", "0"); // reset page on search
        return newParams;
      });
    },
    [setSearchParams],
  );

  // Delete handler
  const handleDelete = useCallback(
    async (id: string, name: string) => {
      const confirmed = await dialogs.confirm(
        `Do you wish to delete category "${name}"?`,
        {
          title: "Delete category?",
          severity: "error",
          okText: "Delete",
          cancelText: "Cancel",
        },
      );
      if (confirmed) {
        try {
          await deleteMutation.mutateAsync(id);
          notifications.show("Category deleted successfully.", {
            severity: "success",
            autoHideDuration: 3000,
          });
        } catch (err) {
          notifications.show(
            `Failed to delete category. Reason: ${(err as Error).message}`,
            { severity: "error", autoHideDuration: 3000 },
          );
        }
      }
    },
    [deleteMutation, dialogs, notifications],
  );

  // Columns
  const columns: GridColDef[] = useMemo(
    () => [
      { field: "code", headerName: "Code", flex: 1, sortable: true },
      { field: "name", headerName: "Name", flex: 2, sortable: true },
      {
        field: "description",
        headerName: "Description",
        flex: 2,
        sortable: true,
      },
      {
        field: "actions",
        type: "actions",
        flex: 1,
        sortable: false,
        getActions: ({ row }) => [
          <Can key="edit" requiredPermissions={[Permissions.Categories.Edit]}>
            <GridActionsCellItem
              icon={<EditIcon fontSize="small" />}
              label="Edit"
              onClick={() => navigate(`/categories/${row.id}/edit`)}
            />
          </Can>,
          <Can
            key="delete"
            requiredPermissions={[Permissions.Categories.Delete]}
          >
            <GridActionsCellItem
              icon={<DeleteIcon fontSize="small" />}
              label="Delete"
              onClick={() => handleDelete(row.id, row.name)}
            />
          </Can>,
        ],
      },
    ],
    [handleDelete, navigate],
  );

  return (
    <PageContainer
      title="Categories"
      breadcrumbs={[{ title: "Categories" }]}
      actions={
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Tooltip title="Refresh" enterDelay={1000}>
            <IconButton
              size="small"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Can requiredPermissions={[Permissions.Categories.Create]}>
            <Button
              variant="contained"
              startIcon={<AddIcon fontSize="small" />}
              onClick={() => navigate("/categories/new")}
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
          <Alert severity="error">{(error as Error)?.message}</Alert>
        ) : (
          <DataGrid
            rows={data?.items ?? []}
            columns={columns}
            rowCount={data?.totalCount ?? 0}
            paginationMode="server"
            sortingMode={SERVER_SIDE_SORT ? "server" : "client"}
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={handlePaginationModelChange}
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            loading={isLoading}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            onRowClick={({ row }) => navigate(`/categories/${row.id}`)}
            sx={{
              [`& .${gridClasses.row}:hover`]: { cursor: "pointer" },
            }}
          />
        )}
      </Box>
    </PageContainer>
  );
}

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
import type { VendorDto } from "@/domain/vendors/VendorTypes";
import { Permissions } from "@/domain/shared/Permissions";
import { Can } from "@/presentation/components/Can";
import { useDialogs } from "@/application/hooks/useDialogs/useDialogs";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import {
  useDeleteVendor,
  useVendors,
} from "@/application/hooks/vendors/useVendors";
import PageContainer from "@/presentation/components/PageContainer";

const SERVER_SIDE_SORT = true; // set to false for client-side sorting
const INITIAL_PAGE_SIZE = 20;

export default function VendorList() {
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

  // Sort model for UI
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  // Query params
  const queryParams = useMemo(
    () => ({
      page: page + 1,
      pageSize,
      searchTerm: appliedSearch || undefined,
      sortField: SERVER_SIDE_SORT ? appliedSortBy || undefined : undefined,
      sortDirection: SERVER_SIDE_SORT
        ? appliedSortDirection || undefined
        : undefined,
    }),
    [page, pageSize, appliedSearch, appliedSortBy, appliedSortDirection],
  );

  const { data, isLoading, error, refetch } = useVendors(queryParams);
  const deleteMutation = useDeleteVendor();

  // Pagination
  const handlePaginationModelChange = useCallback(
    (model: GridPaginationModel) => {
      setSearchParams((prev) => {
        prev.set("page", String(model.page));
        prev.set("pageSize", String(model.pageSize));
        return prev;
      });
    },
    [setSearchParams],
  );

  // Sort
  const handleSortModelChange = useCallback(
    (model: GridSortModel) => {
      setSortModel(model);
      if (SERVER_SIDE_SORT) {
        const first = model[0];
        setSearchParams((prev) => {
          if (first?.field) {
            prev.set("sortBy", first.field);
            prev.set("sortDirection", first.sort || "");
          } else {
            prev.delete("sortBy");
            prev.delete("sortDirection");
          }
          return prev;
        });
      }
    },
    [SERVER_SIDE_SORT, setSearchParams],
  );

  // Search
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchParams((prev) => {
        if (e.target.value) {
          prev.set("search", e.target.value);
        } else {
          prev.delete("search");
        }
        prev.set("page", "0");
        return prev;
      });
    },
    [setSearchParams],
  );

  // Row actions
  const handleEdit = (vendor: VendorDto) => () =>
    navigate(`/vendors/${vendor.id}/edit`);
  const handleDelete = (vendor: VendorDto) => async () => {
    const confirmed = await dialogs.confirm(
      `Do you wish to delete ${vendor.name}?`,
      {
        title: "Delete vendor?",
        severity: "error",
        okText: "Delete",
        cancelText: "Cancel",
      },
    );
    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(vendor.id);
        notifications.show("Vendor deleted successfully.", {
          severity: "success",
          autoHideDuration: 3000,
        });
      } catch (deleteError) {
        notifications.show(
          `Failed to delete vendor. Reason: ${(deleteError as Error).message}`,
          {
            severity: "error",
            autoHideDuration: 3000,
          },
        );
      }
    }
  };

  // Columns
  const columns: GridColDef<VendorDto>[] = useMemo(
    () => [
      { field: "name", headerName: "Name", flex: 1, sortable: true },
      { field: "email", headerName: "Email", flex: 1, sortable: true },
      { field: "phone", headerName: "Phone", flex: 1, sortable: true },
      {
        field: "actions",
        type: "actions",
        flex: 1,
        sortable: false,
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon fontSize="small" />}
            label="Edit"
            onClick={handleEdit(row)}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon fontSize="small" />}
            label="Delete"
            onClick={handleDelete(row)}
          />,
        ],
      },
    ],
    [],
  );

  return (
    <PageContainer
      title="Vendors"
      breadcrumbs={[{ title: "Vendors" }]}
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
          <Can requiredPermissions={[Permissions.Vendors.Create]}>
            <Button
              variant="contained"
              startIcon={<AddIcon fontSize="small" />}
              onClick={() => navigate("/vendors/new")}
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
          placeholder="Search by name, email, or phone…"
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
            pageSizeOptions={[10, 20, 50]}
            disableRowSelectionOnClick
            onRowClick={({ row }) => navigate(`/vendors/${row.id}`)}
            sx={{
              [`& .${gridClasses.row}:hover`]: { cursor: "pointer" },
            }}
          />
        )}
      </Box>
    </PageContainer>
  );
}

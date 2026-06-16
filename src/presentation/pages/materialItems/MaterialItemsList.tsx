import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Popover,
  Badge,
  Divider,
  FormControlLabel,
  Checkbox,
  TextField,
  InputAdornment,
  Stack,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
  gridClasses,
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import StoreIcon from "@mui/icons-material/Store";
import SearchIcon from "@mui/icons-material/Search";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterListIcon from "@mui/icons-material/FilterList";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import PageContainer from "@/presentation/components/PageContainer";
import type { MaterialItemListItemDto } from "@/domain/materialItems/MaterialItemTypes";
import type { MaterialStoreDto } from "@/domain/materialStores/MaterialStoreTypes";
import {
  toQueryParams,
  useMaterialItemsList,
  useDeleteMaterialItem,
} from "@/application/hooks/materialItems/useMaterialItems";
import { useDialogs } from "@/application/hooks/useDialogs/useDialogs";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import MaterialStorePickerDialog from "@/presentation/components/pickers/MaterialStorePickerDialog";

const SERVER_SIDE_SORT = false;
const INITIAL_PAGE_SIZE = 10;

const ALL_COLUMNS = [
  { field: "sku", label: "SKU" },
  { field: "name", label: "Name" },
  { field: "storeName", label: "Store" },
  { field: "available", label: "Availability" },
  { field: "actions", label: "Actions" },
];

// Color logic for availability chip
function getAvailabilityColor(available: number, reorderLevel: number): string {
  if (reorderLevel <= 0) return "green";
  const ratio = available / reorderLevel;
  if (ratio <= 1) return "red";
  if (ratio <= 1.2) return "orange";
  if (ratio <= 1.5) return "#f4c542";
  return "green";
}

// ── Actions cell with three‑dot menu ──
function ActionsCell({
  row,
  onDelete,
  navigate,
}: {
  row: MaterialItemListItemDto;
  onDelete: (item: MaterialItemListItemDto) => () => Promise<void>;
  navigate: (path: string) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton size="small" onClick={handleMenuOpen}>
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <Can requiredPermissions={[Permissions.MaterialItems.Update]}>
          <MenuItem
            onClick={() => {
              navigate(`/material-items/${row.id}/edit`);
              handleMenuClose();
            }}
          >
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
        </Can>
        <Can requiredPermissions={[Permissions.MaterialItems.Delete]}>
          <MenuItem
            onClick={() => {
              onDelete(row)();
              handleMenuClose();
            }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Can>
      </Menu>
    </>
  );
}

// ── Main list component ──
export default function MaterialItemsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const page = Number(searchParams.get("page") || "0");
  const pageSize = Number(
    searchParams.get("pageSize") || String(INITIAL_PAGE_SIZE),
  );
  const appliedSearch = searchParams.get("search") || "";
  const appliedStoreId = searchParams.get("storeId") || "";
  const appliedLowStock = searchParams.get("lowStock") === "true";
  const appliedSortBy = searchParams.get("sortBy") || "";
  const appliedSortDirection = searchParams.get("sortDirection") as
    | "asc"
    | "desc"
    | "";

  const [storeDisplayName, setStoreDisplayName] = useState("");

  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
  const [localStoreId, setLocalStoreId] = useState(appliedStoreId);
  const [localStoreDisplayName, setLocalStoreDisplayName] =
    useState(storeDisplayName);
  const [localLowStock, setLocalLowStock] = useState(appliedLowStock);

  useEffect(() => {
    if (filterAnchor) {
      setLocalStoreId(appliedStoreId);
      setLocalStoreDisplayName(storeDisplayName);
      setLocalLowStock(appliedLowStock);
    }
  }, [filterAnchor, appliedStoreId, storeDisplayName, appliedLowStock]);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState<
    Record<string, boolean>
  >(() => {
    const model: Record<string, boolean> = {};
    ALL_COLUMNS.forEach((col) => (model[col.field] = true));
    return model;
  });
  const [columnAnchor, setColumnAnchor] = useState<HTMLElement | null>(null);

  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const [storePickerOpen, setStorePickerOpen] = useState(false);

  const setFilters = useCallback(
    (updates: Record<string, string | undefined>) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        Object.entries(updates).forEach(([key, value]) => {
          if (value !== undefined && value !== "") {
            newParams.set(key, value);
          } else {
            newParams.delete(key);
          }
        });
        newParams.set("page", "0");
        return newParams;
      });
    },
    [setSearchParams],
  );

  const queryParams = useMemo(
    () =>
      toQueryParams(
        { page, pageSize },
        { items: [], quickFilterValues: appliedSearch ? [appliedSearch] : [] },
        {
          storeId: appliedStoreId || undefined,
          lowStockOnly: appliedLowStock || undefined,
          sortBy: appliedSortBy || undefined,
          sortDirection: appliedSortDirection || undefined,
        },
      ),
    [
      page,
      pageSize,
      appliedSearch,
      appliedStoreId,
      appliedLowStock,
      appliedSortBy,
      appliedSortDirection,
    ],
  );

  const { data, isLoading, isError, error, refetch } =
    useMaterialItemsList(queryParams);
  const deleteMutation = useDeleteMaterialItem();

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

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters({ search: e.target.value || undefined });
    },
    [setFilters],
  );

  const handleFilterPopoverOpen = (event: React.MouseEvent<HTMLElement>) =>
    setFilterAnchor(event.currentTarget);
  const handleFilterPopoverClose = () => setFilterAnchor(null);

  const applyAdvancedFilters = () => {
    setFilters({
      storeId: localStoreId || undefined,
      lowStock: localLowStock ? "true" : undefined,
    });
    setStoreDisplayName(localStoreDisplayName);
    handleFilterPopoverClose();
  };

  const clearAdvancedFilters = () => {
    setLocalStoreId("");
    setLocalStoreDisplayName("");
    setLocalLowStock(false);
    setFilters({
      storeId: undefined,
      lowStock: undefined,
    });
    setStoreDisplayName("");
    handleFilterPopoverClose();
  };

  const handleStoreSelect = (store: MaterialStoreDto) => {
    setLocalStoreId(store.id);
    setLocalStoreDisplayName(`${store.code} - ${store.name}`);
    setStorePickerOpen(false);
  };

  const toggleLowStock = () => setLocalLowStock((prev) => !prev);

  const handleDelete = useCallback(
    (item: MaterialItemListItemDto) => async () => {
      const confirmed = await dialogs.confirm(
        `Do you wish to delete ${item.name} (${item.sku})?`,
        {
          title: "Delete material item?",
          severity: "error",
          okText: "Delete",
          cancelText: "Cancel",
        },
      );
      if (confirmed) {
        try {
          await deleteMutation.mutateAsync(item.id);
          notifications.show("Material item deleted successfully.", {
            severity: "success",
            autoHideDuration: 3000,
          });
        } catch (err) {
          notifications.show(
            `Failed to delete material item: ${(err as Error).message}`,
            { severity: "error", autoHideDuration: 3000 },
          );
        }
      }
    },
    [dialogs, deleteMutation, notifications],
  );

  const columns: GridColDef<MaterialItemListItemDto>[] = useMemo(
    () => [
      { field: "sku", headerName: "SKU", width: 130, sortable: true },
      {
        field: "name",
        headerName: "Name",
        flex: 1,
        minWidth: 180,
        sortable: true,
      },
      { field: "storeName", headerName: "Store", width: 140, sortable: true },
      {
        field: "available",
        headerName: "Availability",
        width: 100,
        type: "number",
        sortable: true,
        renderCell: (params) => {
          const available = params.value as number;
          const reorderLevel = params.row.reorderLevel;
          const unit = params.row.unit;
          const color = getAvailabilityColor(available, reorderLevel);
          return (
            <Chip
              label={`${available} ${unit}`}
              size="small"
              sx={{
                backgroundColor: color,
                color: color === "#f4c542" ? "black" : "white",
                fontWeight: "bold",
              }}
              variant="filled"
            />
          );
        },
      },
      {
        field: "actions",
        headerName: "",
        width: 60,
        sortable: false,
        renderCell: (params) => (
          <ActionsCell
            row={params.row}
            onDelete={handleDelete}
            navigate={navigate}
          />
        ),
      },
    ],
    [navigate, handleDelete],
  );

  const toggleColumn = (field: string) => {
    setColumnVisibilityModel((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleExport = () => {
    if (!data?.items?.length) return;
    const visibleColumns = columns
      .filter(
        (col) =>
          col.field !== "actions" && columnVisibilityModel[col.field] !== false,
      )
      .map((col) => ({ field: col.field, headerName: col.headerName }));
    const header = visibleColumns.map((c) => c.headerName).join(",");
    const rows = data.items.map((row) =>
      visibleColumns
        .map((c) => {
          const value = (row as any)[c.field];
          return value == null ? "" : `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "material-items.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isFilterActive = !!(appliedStoreId || appliedLowStock);

  return (
    <PageContainer
      title="Material Items"
      breadcrumbs={[{ title: "Material Items" }]}
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
          <Can requiredPermissions={[Permissions.MaterialItems.Create]}>
            <Button
              variant="contained"
              startIcon={<AddIcon fontSize="small" />}
              onClick={() => navigate("/material-items/new")}
            >
              Add Item
            </Button>
          </Can>
        </Stack>
      }
    >
      <Box sx={{ flex: 1, width: "100%" }}>
        <Stack
          direction="row"
          sx={{ flexWrap: "wrap", gap: 2, mb: 2, alignItems: "center" }}
        >
          <TextField
            label="Search"
            size="small"
            value={appliedSearch}
            onChange={handleSearchChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: 200, flexGrow: 1 }}
          />
          <Badge color="primary" variant="dot" invisible={!isFilterActive}>
            <Tooltip title="Advanced Filters">
              <IconButton onClick={handleFilterPopoverOpen} size="small">
                <FilterListIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Badge>
          <Tooltip title="Show/hide columns">
            <IconButton
              onClick={(e) => setColumnAnchor(e.currentTarget)}
              size="small"
            >
              <ViewColumnIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export to CSV">
            <IconButton onClick={handleExport} size="small">
              <FileDownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

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
            onRowClick={({ row }) => navigate(`/material-items/${row.id}`)}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={setColumnVisibilityModel}
            pageSizeOptions={[5, 10, 25]}
            sx={{
              [`& .${gridClasses.row}:hover`]: { cursor: "pointer" },
            }}
          />
        )}
      </Box>

      <Popover
        open={Boolean(filterAnchor)}
        anchorEl={filterAnchor}
        onClose={handleFilterPopoverClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Box sx={{ p: 2, minWidth: 280, maxWidth: 320 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Advanced Filters
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={2}>
            <Box>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                startIcon={<StoreIcon />}
                onClick={() => setStorePickerOpen(true)}
                sx={{ justifyContent: "flex-start" }}
              >
                {localStoreId
                  ? `Store: ${localStoreDisplayName || localStoreId}`
                  : "Select Store"}
              </Button>
              {localStoreId && (
                <Chip
                  label={localStoreDisplayName || localStoreId}
                  size="small"
                  onDelete={() => {
                    setLocalStoreId("");
                    setLocalStoreDisplayName("");
                  }}
                  sx={{ mt: 0.5 }}
                />
              )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={localLowStock}
                    onChange={toggleLowStock}
                    size="small"
                  />
                }
                label="Low Stock Only"
                sx={{ ml: 0 }}
              />
            </Box>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: "flex-end" }}
          >
            <Button size="small" onClick={clearAdvancedFilters}>
              Clear All
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={applyAdvancedFilters}
            >
              Apply
            </Button>
          </Stack>
        </Box>
      </Popover>

      <Popover
        open={Boolean(columnAnchor)}
        anchorEl={columnAnchor}
        onClose={() => setColumnAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Show Columns
          </Typography>
          <Divider />
          {ALL_COLUMNS.map((col) => (
            <FormControlLabel
              key={col.field}
              control={
                <Checkbox
                  checked={columnVisibilityModel[col.field] ?? true}
                  onChange={() => toggleColumn(col.field)}
                  size="small"
                />
              }
              label={col.label}
              sx={{ display: "flex", ml: 0 }}
            />
          ))}
        </Box>
      </Popover>

      <MaterialStorePickerDialog
        open={storePickerOpen}
        onClose={() => setStorePickerOpen(false)}
        onSelect={handleStoreSelect}
      />
    </PageContainer>
  );
}

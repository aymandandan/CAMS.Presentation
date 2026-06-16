import { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  IconButton,
  Chip,
  Typography,
  Popover,
  Badge,
  Divider,
  Checkbox,
  FormControlLabel,
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
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate as useRouterNavigate } from "react-router-dom";
import PageContainer from "@/presentation/components/PageContainer";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import type { MaintenancePlanListItemDto } from "@/domain/maintenancePlans/MaintenancePlanTypes";
import type { CategoryDto } from "@/domain/categories/CategoryTypes";
import CategoryPickerDialog from "@/presentation/components/pickers/CategoryPickerDialog";
import {
  useDeleteMaintenancePlan,
  useMaintenancePlans,
} from "@/application/hooks/maintenancePlans/useMaintenancePlans";

// Toggle for server‑side sorting (client‑side by default)
const SERVER_SIDE_SORT = false;
const INITIAL_PAGE_SIZE = 10;

const ALL_COLUMNS = [
  { field: "code", label: "Code" },
  { field: "description", label: "Description" },
  { field: "cycleDays", label: "Cycle Days" },
  { field: "categoryName", label: "Category" },
  { field: "isActive", label: "Active" },
  { field: "actions", label: "Actions" },
];

export default function MaintenancePlanList() {
  const navigate = useRouterNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL‑driven applied filters
  const page = Number(searchParams.get("page") || "0");
  const pageSize = Number(
    searchParams.get("pageSize") || String(INITIAL_PAGE_SIZE),
  );
  const appliedSearch = searchParams.get("search") || "";
  const appliedCategoryId = searchParams.get("categoryId") || "";
  const appliedIsActive = searchParams.get("isActive") || "all"; // "all", "true", "false"
  const appliedSortBy = searchParams.get("sortBy") || "";
  const appliedSortDirection = searchParams.get("sortDirection") as
    | "asc"
    | "desc"
    | "";

  // Display names (not in URL)
  const [categoryName, setCategoryName] = useState("");

  // Advanced filter popover local state
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
  const [localCategoryId, setLocalCategoryId] = useState(appliedCategoryId);
  const [localCategoryName, setLocalCategoryName] = useState(categoryName);
  const [localIsActive, setLocalIsActive] = useState(appliedIsActive);

  // Sync local state when popover opens
  useEffect(() => {
    if (filterAnchor) {
      setLocalCategoryId(appliedCategoryId);
      setLocalCategoryName(categoryName);
      setLocalIsActive(appliedIsActive);
    }
  }, [filterAnchor, appliedCategoryId, categoryName, appliedIsActive]);

  // Column visibility
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<
    Record<string, boolean>
  >(() => {
    const model: Record<string, boolean> = {};
    ALL_COLUMNS.forEach((col) => (model[col.field] = true));
    return model;
  });
  const [columnAnchor, setColumnAnchor] = useState<HTMLElement | null>(null);

  // Sorting model
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  // Helper to update URL filters
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

  // Build query parameters
  const queryParams = useMemo(
    () => ({
      page: page + 1,
      pageSize,
      searchTerm: appliedSearch || undefined,
      categoryId: appliedCategoryId || undefined,
      isActive:
        appliedIsActive === "all" ? undefined : appliedIsActive === "true",
      sortBy: SERVER_SIDE_SORT ? appliedSortBy || undefined : undefined,
      sortDirection: SERVER_SIDE_SORT
        ? (appliedSortDirection as "asc" | "desc") || undefined
        : undefined,
    }),
    [
      page,
      pageSize,
      appliedSearch,
      appliedCategoryId,
      appliedIsActive,
      appliedSortBy,
      appliedSortDirection,
    ],
  );

  const { data, isLoading, isError, error, refetch } =
    useMaintenancePlans(queryParams);
  const deleteMutation = useDeleteMaintenancePlan();

  // Row actions
  const handleEdit = useCallback(
    (plan: MaintenancePlanListItemDto) => () =>
      navigate(`/maintenance-plans/${plan.id}/edit`),
    [navigate],
  );

  const handleDelete = useCallback(
    (plan: MaintenancePlanListItemDto) => async () => {
      if (window.confirm(`Delete plan ${plan.code}?`)) {
        await deleteMutation.mutateAsync(plan.id);
        refetch();
      }
    },
    [deleteMutation, refetch],
  );

  // Pagination model from URL
  const paginationModel: GridPaginationModel = { page, pageSize };

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

  // Sort model change
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

  // Advanced filter popover actions
  const handleFilterPopoverOpen = (event: React.MouseEvent<HTMLElement>) =>
    setFilterAnchor(event.currentTarget);
  const handleFilterPopoverClose = () => setFilterAnchor(null);

  const applyAdvancedFilters = () => {
    setFilters({
      categoryId: localCategoryId || undefined,
      isActive: localIsActive === "all" ? undefined : localIsActive,
    });
    setCategoryName(localCategoryName);
    handleFilterPopoverClose();
  };

  const clearAdvancedFilters = () => {
    setLocalCategoryId("");
    setLocalCategoryName("");
    setLocalIsActive("all");
    setFilters({
      categoryId: undefined,
      isActive: undefined,
    });
    setCategoryName("");
    handleFilterPopoverClose();
  };

  // Category picker handlers
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const handleSelectCategory = (cat: CategoryDto) => {
    setLocalCategoryId(cat.id);
    setLocalCategoryName(cat.name);
    setCategoryPickerOpen(false);
  };

  // Active filter indicator
  const isFilterActive = !!(appliedCategoryId || appliedIsActive !== "all");

  // Columns definition
  const columns: GridColDef[] = useMemo(
    () => [
      { field: "code", headerName: "Code", flex: 1, sortable: true },
      {
        field: "description",
        headerName: "Description",
        flex: 2,
        sortable: true,
      },
      {
        field: "cycleDays",
        headerName: "Cycle Days",
        width: 120,
        sortable: true,
      },
      {
        field: "categoryName",
        headerName: "Category",
        flex: 1,
        sortable: true,
      },
      {
        field: "isActive",
        headerName: "Active",
        width: 100,
        sortable: true,
        renderCell: (params) => (
          <Chip
            label={params.value ? "Active" : "Inactive"}
            color={params.value ? "success" : "default"}
            size="small"
          />
        ),
      },
      {
        field: "actions",
        type: "actions",
        width: 100,
        sortable: false,
        getActions: ({ row }) => [
          <Can
            key="edit"
            requiredPermissions={[Permissions.MaintenancePlans.Update]}
          >
            <GridActionsCellItem
              icon={<EditIcon fontSize="small" />}
              label="Edit"
              onClick={handleEdit(row)}
            />
          </Can>,
          <Can
            key="delete"
            requiredPermissions={[Permissions.MaintenancePlans.Delete]}
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

  // Column visibility toggle
  const toggleColumn = (field: string) => {
    setColumnVisibilityModel((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <PageContainer
      title="Maintenance Plans"
      breadcrumbs={[{ title: "Maintenance Plans" }]}
      actions={
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh">
            <IconButton
              size="small"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Can requiredPermissions={[Permissions.MaintenancePlans.Create]}>
            <Button
              variant="contained"
              startIcon={<AddIcon fontSize="small" />}
              onClick={() => navigate("/maintenance-plans/new")}
            >
              Create Plan
            </Button>
          </Can>
        </Stack>
      }
    >
      {/* Search & filter bar */}
      <Stack
        direction="row"
        sx={{ flexWrap: "wrap", gap: 2, mb: 2, alignItems: "center" }}
      >
        <TextField
          label="Search"
          size="small"
          value={appliedSearch}
          onChange={(e) => setFilters({ search: e.target.value })}
          slotProps={{
            input: {
              startAdornment: (
                <SearchIcon
                  fontSize="small"
                  sx={{ mr: 1, color: "action.active" }}
                />
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
      </Stack>

      {isError && (
        <Box sx={{ color: "error.main", mb: 2 }}>
          {(error as Error)?.message}
        </Box>
      )}

      <DataGrid
        rows={data?.items ?? []}
        columns={columns}
        rowCount={data?.totalCount ?? 0}
        loading={isLoading}
        paginationMode="server"
        sortingMode={SERVER_SIDE_SORT ? "server" : "client"}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        pageSizeOptions={[5, 10, 25, 50]}
        disableRowSelectionOnClick
        onRowClick={(params) => navigate(`/maintenance-plans/${params.id}`)}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={setColumnVisibilityModel}
        sx={{
          height: 500,
          [`& .${gridClasses.row}:hover`]: { cursor: "pointer" },
        }}
      />

      {/* Advanced Filters Popover */}
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
            {/* Category picker */}
            <Box>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => setCategoryPickerOpen(true)}
                sx={{ justifyContent: "flex-start" }}
              >
                {localCategoryId
                  ? `Category: ${localCategoryName || localCategoryId}`
                  : "Select Category"}
              </Button>
              {localCategoryId && (
                <Chip
                  label={localCategoryName || localCategoryId}
                  size="small"
                  onDelete={() => {
                    setLocalCategoryId("");
                    setLocalCategoryName("");
                  }}
                  sx={{ mt: 0.5 }}
                />
              )}
            </Box>

            {/* Active filter */}
            <FormControl size="small" fullWidth>
              <InputLabel>Active</InputLabel>
              <Select
                value={localIsActive}
                label="Active"
                onChange={(e) => setLocalIsActive(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={1} sx={{justifyContent:"flex-end"}}>
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

      {/* Column Visibility Popover */}
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

      {/* Category picker dialog */}
      <CategoryPickerDialog
        open={categoryPickerOpen}
        onClose={() => setCategoryPickerOpen(false)}
        onSelect={handleSelectCategory}
      />
    </PageContainer>
  );
}

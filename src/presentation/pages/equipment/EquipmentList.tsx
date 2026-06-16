import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Stack,
  TextField,
  Typography,
  Popover,
  Badge,
  Chip,
  Divider,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BuildIcon from "@mui/icons-material/Build";
import CancelIcon from "@mui/icons-material/Cancel";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
  gridClasses,
} from "@mui/x-data-grid";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import CategoryPickerDialog from "@/presentation/components/pickers/CategoryPickerDialog";
import TradePickerDialog from "@/presentation/components/pickers/TradePickerDialog";
import type { LocationDto } from "@/domain/locations/LocationTypes";
import type { CategoryDto } from "@/domain/categories/CategoryTypes";
import type { TradeDto } from "@/domain/trades/TradeTypes";
import {
  EquipmentStatus,
  type EquipmentListItemDto,
  type EquipmentSearchParams,
} from "@/domain/equipment/EquipmentTypes";
import PageContainer from "@/presentation/components/PageContainer";
import {
  useEquipmentList,
  useDeleteEquipment,
  useMarkUnderMaintenance,
  useDecommissionEquipment,
} from "@/application/hooks/equipment/useEquipment";
import { useDialogs } from "@/application/hooks/useDialogs/useDialogs";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import LocationPickerDialog from "@/presentation/components/pickers/LocationPickerDialog";
import EquipmentStatusChip from "@/presentation/components/equipment/EquipmentStatusChip";

// Toggle for server‑side sorting (false = client side, true = sends sort params to API)
const SERVER_SIDE_SORT = false;
const INITIAL_PAGE_SIZE = 20;

const ALL_COLUMNS = [
  { field: "code", label: "Code" },
  { field: "name", label: "Name" },
  { field: "location", label: "Location" },
  { field: "status", label: "Status" },
  { field: "actions", label: "Actions" },
];

export default function EquipmentList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  // URL‑driven applied filters
  const page = Number(searchParams.get("page") || "0");
  const pageSize = Number(
    searchParams.get("pageSize") || String(INITIAL_PAGE_SIZE),
  );
  const appliedLocationId = searchParams.get("locationId") || "";
  const appliedCategoryId = searchParams.get("categoryId") || "";
  const appliedTradeId = searchParams.get("tradeId") || "";
  const appliedSearchTerm = searchParams.get("search") || "";
  const appliedSortBy = searchParams.get("sortBy") || "";
  const appliedSortDirection = searchParams.get("sortDirection") as
    | "asc"
    | "desc"
    | "";

  // Display names for selection (not in URL)
  const [locationName, setLocationName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [tradeName, setTradeName] = useState("");

  // Advanced filter popover local state
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
  const [localLocationId, setLocalLocationId] = useState(appliedLocationId);
  const [localLocationName, setLocalLocationName] = useState(locationName);
  const [localCategoryId, setLocalCategoryId] = useState(appliedCategoryId);
  const [localCategoryName, setLocalCategoryName] = useState(categoryName);
  const [localTradeId, setLocalTradeId] = useState(appliedTradeId);
  const [localTradeName, setLocalTradeName] = useState(tradeName);

  // Sync local state when popover opens
  useEffect(() => {
    if (filterAnchor) {
      setLocalLocationId(appliedLocationId);
      setLocalLocationName(locationName);
      setLocalCategoryId(appliedCategoryId);
      setLocalCategoryName(categoryName);
      setLocalTradeId(appliedTradeId);
      setLocalTradeName(tradeName);
    }
  }, [
    filterAnchor,
    appliedLocationId,
    appliedCategoryId,
    appliedTradeId,
    locationName,
    categoryName,
    tradeName,
  ]);

  // Column visibility
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<
    Record<string, boolean>
  >(() => {
    const model: Record<string, boolean> = {};
    ALL_COLUMNS.forEach((col) => (model[col.field] = true));
    return model;
  });
  const [columnAnchor, setColumnAnchor] = useState<HTMLElement | null>(null);

  // Picker open states
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [tradePickerOpen, setTradePickerOpen] = useState(false);

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
        newParams.set("page", "0"); // reset to first page
        return newParams;
      });
    },
    [setSearchParams],
  );

  // Build query params
  const queryParams: EquipmentSearchParams = useMemo(
    () => ({
      page: page + 1,
      pageSize,
      locationId: appliedLocationId || undefined,
      categoryId: appliedCategoryId || undefined,
      tradeId: appliedTradeId || undefined,
      searchTerm: appliedSearchTerm || undefined,
      sortBy: SERVER_SIDE_SORT ? appliedSortBy || undefined : undefined,
      sortDirection: SERVER_SIDE_SORT
        ? (appliedSortDirection as "asc" | "desc") || undefined
        : undefined,
    }),
    [
      page,
      pageSize,
      appliedLocationId,
      appliedCategoryId,
      appliedTradeId,
      appliedSearchTerm,
      appliedSortBy,
      appliedSortDirection,
    ],
  );

  const { data, isLoading, isError, error, refetch } =
    useEquipmentList(queryParams);

  const deleteMutation = useDeleteEquipment();
  const maintenanceMutation = useMarkUnderMaintenance();
  const decommissionMutation = useDecommissionEquipment();

  // Handlers for row actions
  const handleDelete = useCallback(
    async (equipment: EquipmentListItemDto) => {
      const confirmed = await dialogs.confirm(
        `Delete equipment ${equipment.code}?`,
        { title: "Delete Equipment", severity: "error", okText: "Delete" },
      );
      if (!confirmed) return;
      try {
        await deleteMutation.mutateAsync(equipment.id);
        notifications.show("Deleted successfully.", { severity: "success" });
        refetch();
      } catch (err: any) {
        notifications.show(`Failed: ${err.message}`, { severity: "error" });
      }
    },
    [dialogs, deleteMutation, notifications, refetch],
  );

  const handleMaintenance = useCallback(
    async (equipment: EquipmentListItemDto) => {
      const confirmed = await dialogs.confirm(
        `Mark ${equipment.code} as under maintenance?`,
        { title: "Change Status", severity: "warning", okText: "Confirm" },
      );
      if (!confirmed) return;
      try {
        await maintenanceMutation.mutateAsync(equipment.id);
        notifications.show("Status updated.", { severity: "success" });
        refetch();
      } catch (err: any) {
        notifications.show(`Failed: ${err.message}`, { severity: "error" });
      }
    },
    [dialogs, maintenanceMutation, notifications, refetch],
  );

  const handleDecommission = useCallback(
    async (equipment: EquipmentListItemDto) => {
      const confirmed = await dialogs.confirm(
        `Decommission ${equipment.code}?`,
        { title: "Decommission", severity: "error", okText: "Decommission" },
      );
      if (!confirmed) return;
      try {
        await decommissionMutation.mutateAsync(equipment.id);
        notifications.show("Equipment decommissioned.", {
          severity: "success",
        });
        refetch();
      } catch (err: any) {
        notifications.show(`Failed: ${err.message}`, { severity: "error" });
      }
    },
    [dialogs, decommissionMutation, notifications, refetch],
  );

  // Pagination model
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
      locationId: localLocationId || undefined,
      categoryId: localCategoryId || undefined,
      tradeId: localTradeId || undefined,
    });
    setLocationName(localLocationName);
    setCategoryName(localCategoryName);
    setTradeName(localTradeName);
    handleFilterPopoverClose();
  };

  const clearAdvancedFilters = () => {
    setLocalLocationId("");
    setLocalLocationName("");
    setLocalCategoryId("");
    setLocalCategoryName("");
    setLocalTradeId("");
    setLocalTradeName("");
    setFilters({
      locationId: undefined,
      categoryId: undefined,
      tradeId: undefined,
    });
    setLocationName("");
    setCategoryName("");
    setTradeName("");
    handleFilterPopoverClose();
  };

  // Picker selection handlers (set local state)
  const handleSelectLocation = (loc: LocationDto) => {
    setLocalLocationId(loc.id);
    setLocalLocationName(loc.name);
    setLocationPickerOpen(false);
  };
  const handleSelectCategory = (cat: CategoryDto) => {
    setLocalCategoryId(cat.id);
    setLocalCategoryName(cat.name);
    setCategoryPickerOpen(false);
  };
  const handleSelectTrade = (trade: TradeDto) => {
    setLocalTradeId(trade.id);
    setLocalTradeName(trade.name);
    setTradePickerOpen(false);
  };

  // Check if any advanced filter is active
  const isFilterActive = !!(
    appliedLocationId ||
    appliedCategoryId ||
    appliedTradeId
  );

  // Columns definition
  const columns: GridColDef[] = useMemo(
    () => [
      { field: "code", headerName: "Code", width: 130, sortable: true },
      {
        field: "name",
        headerName: "Name",
        flex: 1,
        minWidth: 200,
        sortable: true,
      },
      {
        field: "location",
        headerName: "Location",
        flex: 1,
        minWidth: 150,
        sortable: true,
      },
      {
        field: "status",
        headerName: "Status",
        width: 160,
        sortable: true,
        renderCell: (params) => <EquipmentStatusChip status={params.value} />,
      },
      {
        field: "actions",
        type: "actions",
        width: 100,
        sortable: false,
        getActions: ({ row }) => {
          const equipment = row as EquipmentListItemDto;
          const items = [];
          if (
            equipment.status !== EquipmentStatus.Decommissioned &&
            equipment.status !== EquipmentStatus.UnderMaintenance
          ) {
            items.push(
              <GridActionsCellItem
                icon={<BuildIcon fontSize="small" />}
                label="Maintenance"
                onClick={() => handleMaintenance(equipment)}
                showInMenu
              />,
            );
          }
          if (equipment.status !== EquipmentStatus.Decommissioned) {
            items.push(
              <GridActionsCellItem
                icon={<CancelIcon fontSize="small" />}
                label="Decommission"
                onClick={() => handleDecommission(equipment)}
                showInMenu
              />,
            );
          }
          items.push(
            <GridActionsCellItem
              icon={<EditIcon fontSize="small" />}
              label="Edit"
              onClick={() => navigate(`/equipment/${equipment.id}/edit`)}
              showInMenu
            />,
            <GridActionsCellItem
              icon={<DeleteIcon fontSize="small" />}
              label="Delete"
              onClick={() => handleDelete(equipment)}
              showInMenu
            />,
          );
          return items;
        },
      },
    ],
    [navigate, handleDelete, handleMaintenance, handleDecommission],
  );

  // Column visibility toggle
  const toggleColumn = (field: string) => {
    setColumnVisibilityModel((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // CSV export
  const handleExport = () => {
    if (!data?.items?.length) return;
    const visibleColumns = columns
      .filter(
        (col) =>
          columnVisibilityModel[col.field] !== false && col.field !== "actions",
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
    link.setAttribute("download", "equipment.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <PageContainer
      title="Equipment"
      breadcrumbs={[{ title: "Equipment" }]}
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
          <Can requiredPermissions={[Permissions.Equipment.Create]}>
            <Button
              variant="contained"
              startIcon={<AddIcon fontSize="small" />}
              onClick={() => navigate("/equipment/new")}
            >
              Add Equipment
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
          label="Search by name"
          size="small"
          value={appliedSearchTerm}
          onChange={(e) => setFilters({ search: e.target.value })}
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

      {/* Error display */}
      {isError && <Alert severity="error">{(error as Error).message}</Alert>}

      {/* Data grid */}
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
        pageSizeOptions={[5, 10, 20, 50]}
        disableRowSelectionOnClick
        onRowClick={(params) => navigate(`/equipment/${params.id}`)}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={setColumnVisibilityModel}
        sx={{
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
            {/* Location picker */}
            <Box>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => setLocationPickerOpen(true)}
                sx={{ justifyContent: "flex-start" }}
              >
                {localLocationId
                  ? `Location: ${localLocationName || localLocationId}`
                  : "Select Location"}
              </Button>
              {localLocationId && (
                <Chip
                  label={localLocationName || localLocationId}
                  size="small"
                  onDelete={() => {
                    setLocalLocationId("");
                    setLocalLocationName("");
                  }}
                  sx={{ mt: 0.5 }}
                />
              )}
            </Box>

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

            {/* Trade picker */}
            <Box>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => setTradePickerOpen(true)}
                sx={{ justifyContent: "flex-start" }}
              >
                {localTradeId
                  ? `Trade: ${localTradeName || localTradeId}`
                  : "Select Trade"}
              </Button>
              {localTradeId && (
                <Chip
                  label={localTradeName || localTradeId}
                  size="small"
                  onDelete={() => {
                    setLocalTradeId("");
                    setLocalTradeName("");
                  }}
                  sx={{ mt: 0.5 }}
                />
              )}
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

      {/* Picker Dialogs (lazy loaded via enabled: open) */}
      <LocationPickerDialog
        open={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        onSelect={handleSelectLocation}
      />
      <CategoryPickerDialog
        open={categoryPickerOpen}
        onClose={() => setCategoryPickerOpen(false)}
        onSelect={handleSelectCategory}
      />
      <TradePickerDialog
        open={tradePickerOpen}
        onClose={() => setTradePickerOpen(false)}
        onSelect={handleSelectTrade}
      />
    </PageContainer>
  );
}

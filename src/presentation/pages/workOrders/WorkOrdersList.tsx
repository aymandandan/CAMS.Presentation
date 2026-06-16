import { useCallback, useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridActionsCellItem,
  GridSortModel,
  gridClasses,
} from "@mui/x-data-grid";
import {
  Button,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Stack,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  Popover,
  Checkbox,
  FormControlLabel,
  Divider,
  Badge,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import { useWorkOrders } from "@/application/hooks/workOrders/useWorkOrders";
import type { GetFilteredWorkOrdersQuery } from "@/domain/workOrders/WorkOrderTypes";
import { WorkOrderStatus, Priority } from "@/domain/workOrders/WorkOrderTypes";
import WorkOrderStatusChip from "@/presentation/components/workOrders/WorkOrderStatusChip";
import WorkOrderPriorityChip from "@/presentation/components/workOrders/WorkOrderPriorityChip";
import PageContainer from "@/presentation/components/PageContainer";
import { useHasPermissions } from "@/application/hooks/usePermission/usePermission";
import EquipmentPickerDialog from "@/presentation/components/pickers/EquipmentPickerDialog";
import MaintenancePlanPickerDialog from "@/presentation/components/pickers/MaintenancePlanPickerDialog";

// Toggle to true for server‑side sorting
const SERVER_SIDE_SORT = false;
const INITIAL_PAGE_SIZE = 10;

const TYPE_TABS = [
  { label: "All", value: "all" },
  { label: "Corrective", value: "Corrective" },
  { label: "Preventive", value: "PlannedPreventive" },
] as const;

const ALL_COLUMNS = [
  { field: "code", label: "Code" },
  { field: "description", label: "Description" },
  { field: "equipment", label: "Equipment" },
  { field: "status", label: "Status" },
  { field: "scheduledDate", label: "Scheduled Date" },
  { field: "priority", label: "Priority" },
  { field: "type", label: "Type" },
  { field: "actions", label: "Actions" },
];

function downloadCsv(
  rows: any[],
  columns: { field: string; headerName: string }[],
) {
  const header = columns.map((c) => c.headerName).join(",");
  const data = rows.map((row) =>
    columns
      .map((c) => {
        const value = row[c.field];
        if (value == null) return "";
        const stringValue =
          typeof value === "object" ? JSON.stringify(value) : String(value);
        return `"${stringValue.replace(/"/g, '""')}"`;
      })
      .join(","),
  );
  const csv = [header, ...data].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "work-orders.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function WorkOrderList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermission } = useHasPermissions();

  // URL‑driven applied filters (single source of truth)
  const page = Number(searchParams.get("page") || "0");
  const pageSize = Number(
    searchParams.get("pageSize") || String(INITIAL_PAGE_SIZE),
  );
  const typeFilter = searchParams.get("type") || undefined;
  const appliedFromDate = searchParams.get("fromDate") || "";
  const appliedToDate = searchParams.get("toDate") || "";
  const appliedStatus = searchParams.get("status") || "";
  const appliedPriority = searchParams.get("priority") || "";
  const appliedSearch = searchParams.get("search") || "";
  const appliedEquipmentId = searchParams.get("equipmentId") || "";
  const appliedPlanId = searchParams.get("planId") || "";
  const appliedSortBy = searchParams.get("sortBy") || "";
  const appliedSortDirection = searchParams.get("sortDirection") as
    | "asc"
    | "desc"
    | "";

  // Display names for equipment/plan (not stored in URL)
  const [equipmentName, setEquipmentName] = useState("");
  const [planName, setPlanName] = useState("");

  // Local filter state for popover – initialized from URL when popover opens
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
  const [localFromDate, setLocalFromDate] = useState(appliedFromDate);
  const [localToDate, setLocalToDate] = useState(appliedToDate);
  const [localStatus, setLocalStatus] = useState(appliedStatus);
  const [localPriority, setLocalPriority] = useState(appliedPriority);
  const [localEquipmentId, setLocalEquipmentId] = useState(appliedEquipmentId);
  const [localEquipmentName, setLocalEquipmentName] = useState(equipmentName);
  const [localPlanId, setLocalPlanId] = useState(appliedPlanId);
  const [localPlanName, setLocalPlanName] = useState(planName);

  // Sync local state when popover opens (so changes outside popover are reflected)
  useEffect(() => {
    if (filterAnchor) {
      setLocalFromDate(appliedFromDate);
      setLocalToDate(appliedToDate);
      setLocalStatus(appliedStatus);
      setLocalPriority(appliedPriority);
      setLocalEquipmentId(appliedEquipmentId);
      setLocalEquipmentName(equipmentName);
      setLocalPlanId(appliedPlanId);
      setLocalPlanName(planName);
    }
  }, [
    filterAnchor,
    appliedFromDate,
    appliedToDate,
    appliedStatus,
    appliedPriority,
    appliedEquipmentId,
    appliedPlanId,
    equipmentName,
    planName,
  ]);

  // Column visibility (local state only)
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<
    Record<string, boolean>
  >(() => {
    const model: Record<string, boolean> = {};
    ALL_COLUMNS.forEach((col) => (model[col.field] = true));
    return model;
  });
  const [columnAnchor, setColumnAnchor] = useState<HTMLElement | null>(null);

  // Pickers
  const [equipmentPickerOpen, setEquipmentPickerOpen] = useState(false);
  const [planPickerOpen, setPlanPickerOpen] = useState(false);

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
        // Reset to first page when filters change
        newParams.set("page", "0");
        return newParams;
      });
    },
    [setSearchParams],
  );

  // Build query object
  const query: GetFilteredWorkOrdersQuery = useMemo(
    () => ({
      page: page + 1,
      pageSize,
      searchTerm: appliedSearch || undefined,
      type: typeFilter as any,
      status: appliedStatus ? (appliedStatus as WorkOrderStatus) : undefined,
      priority: appliedPriority ? (appliedPriority as Priority) : undefined,
      fromDate: appliedFromDate || undefined,
      toDate: appliedToDate || undefined,
      equipmentId: appliedEquipmentId || undefined,
      planId: appliedPlanId || undefined,
      sortBy: SERVER_SIDE_SORT ? appliedSortBy || undefined : undefined,
      sortDirection: SERVER_SIDE_SORT
        ? (appliedSortDirection as "asc" | "desc") || undefined
        : undefined,
      isPaginated: true,
    }),
    [
      page,
      pageSize,
      appliedSearch,
      typeFilter,
      appliedStatus,
      appliedPriority,
      appliedFromDate,
      appliedToDate,
      appliedEquipmentId,
      appliedPlanId,
      appliedSortBy,
      appliedSortDirection,
    ],
  );

  const { data, isLoading, isError, error, refetch } = useWorkOrders(query);

  // Pagination change → update URL
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

  // Sorting model
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
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

  // Popover open/close
  const handleFilterPopoverOpen = (event: React.MouseEvent<HTMLElement>) =>
    setFilterAnchor(event.currentTarget);
  const handleFilterPopoverClose = () => setFilterAnchor(null);

  // Apply local filter state to URL
  const applyAdvancedFilters = () => {
    setFilters({
      fromDate: localFromDate || undefined,
      toDate: localToDate || undefined,
      status: localStatus || undefined,
      priority: localPriority || undefined,
      equipmentId: localEquipmentId || undefined,
      planId: localPlanId || undefined,
    });
    // Update names (from local state)
    setEquipmentName(localEquipmentName);
    setPlanName(localPlanName);
    handleFilterPopoverClose();
  };

  // Clear all advanced filters (local + URL)
  const clearAdvancedFilters = () => {
    setLocalFromDate("");
    setLocalToDate("");
    setLocalStatus("");
    setLocalPriority("");
    setLocalEquipmentId("");
    setLocalEquipmentName("");
    setLocalPlanId("");
    setLocalPlanName("");
    // Also clear URL and names
    setFilters({
      fromDate: undefined,
      toDate: undefined,
      status: undefined,
      priority: undefined,
      equipmentId: undefined,
      planId: undefined,
    });
    setEquipmentName("");
    setPlanName("");
    handleFilterPopoverClose();
  };

  // Equipment/plan picker handlers: set local state only
  const handleSelectEquipment = (eq: any) => {
    setLocalEquipmentId(eq.id);
    setLocalEquipmentName(eq.name || eq.code || "");
    setEquipmentPickerOpen(false);
  };

  const handleSelectPlan = (plan: any) => {
    setLocalPlanId(plan.id);
    setLocalPlanName(plan.code || plan.description || "");
    setPlanPickerOpen(false);
  };

  // Determine if any advanced filter is active (for badge)
  const isFilterActive = !!(
    appliedFromDate ||
    appliedToDate ||
    appliedStatus ||
    appliedPriority ||
    appliedEquipmentId ||
    appliedPlanId
  );

  // Columns definition
  const columns: GridColDef[] = useMemo(() => {
    const baseColumns: GridColDef[] = [
      { field: "code", headerName: "Code", width: 120, sortable: true },
      {
        field: "description",
        headerName: "Description",
        flex: 1,
        minWidth: 200,
        sortable: true,
      },
      {
        field: "equipment",
        headerName: "Equipment",
        width: 160,
        sortable: true,
      },
      {
        field: "status",
        headerName: "Status",
        width: 140,
        sortable: true,
        renderCell: (params) => <WorkOrderStatusChip status={params.value} />,
      },
      {
        field: "scheduledDate",
        headerName: "Scheduled Date",
        width: 140,
        type: "date",
        sortable: true,
        valueGetter: (value) => value && new Date(value),
        renderCell: (params) => {
          const date = params.value;
          if (!date) return null;
          const isOverdue =
            params.row.status === WorkOrderStatus.Scheduled &&
            new Date(date) < new Date(new Date().setHours(0, 0, 0, 0));
          return (
            <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
              <Typography
                variant="body2"
                sx={{ color: isOverdue ? "error.main" : "inherit" }}
              >
                {new Date(date).toLocaleDateString()}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: "priority",
        headerName: "Priority",
        width: 110,
        sortable: true,
        renderCell: (params) => (
          <WorkOrderPriorityChip priority={params.value} />
        ),
      },
    ];

    if (!typeFilter) {
      baseColumns.push({
        field: "type",
        headerName: "Type",
        width: 150,
        sortable: true,
      });
    }

    baseColumns.push({
      field: "actions",
      type: "actions",
      width: 100,
      sortable: false,
      getActions: ({ row }) => {
        const actions = [
          <GridActionsCellItem
            key="view"
            icon={<VisibilityIcon fontSize="small" />}
            label="View"
            onClick={() => navigate(`/work-orders/${row.id}`)}
            showInMenu
          />,
        ];
        if (
          (row.status === WorkOrderStatus.Draft ||
            row.status === WorkOrderStatus.Scheduled) &&
          hasPermission(Permissions.WorkOrders.Update)
        ) {
          actions.push(
            <GridActionsCellItem
              key="edit"
              icon={<EditIcon fontSize="small" />}
              label="Edit"
              onClick={() => navigate(`/work-orders/${row.id}/edit`)}
              showInMenu
            />,
          );
        }
        return actions;
      },
    });

    return baseColumns;
  }, [navigate, hasPermission, typeFilter]);

  // Column visibility
  const toggleColumn = (field: string) => {
    setColumnVisibilityModel((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Export
  const handleExport = () => {
    if (data?.items?.length) {
      const exportColumns = columns
        .filter(
          (col): col is { field: string; headerName: string } =>
            !!col.headerName,
        )
        .map((col) => ({ field: col.field, headerName: col.headerName }));
      downloadCsv(data.items, exportColumns);
    }
  };

  return (
    <PageContainer
      title="Work Orders"
      breadcrumbs={[{ title: "Work Orders" }]}
      actions={
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Tooltip title="Refresh" enterDelay={1000}>
            <IconButton size="small" onClick={() => refetch()}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Can requiredPermissions={[Permissions.WorkOrders.Create]}>
            <Button
              variant="contained"
              startIcon={<AddIcon fontSize="small" />}
              onClick={() => navigate("/work-orders/new")}
            >
              Create
            </Button>
          </Can>
        </Stack>
      }
    >
      <Box sx={{ flex: 1, width: "100%" }}>
        {/* Type tabs */}
        <Tabs
          value={typeFilter ?? "all"}
          onChange={(_, newValue: string) => {
            setFilters({ type: newValue === "all" ? undefined : newValue });
          }}
          sx={{ mb: 2 }}
        >
          {TYPE_TABS.map((tab) => (
            <Tab key={tab.label} label={tab.label} value={tab.value} />
          ))}
        </Tabs>

        {/* Main filter bar */}
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
          <Tooltip title="Export to CSV">
            <IconButton onClick={handleExport} size="small">
              <FileDownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Data grid */}
        {isError ? (
          <Box sx={{ flexGrow: 1 }}>
            <Typography color="error">{(error as Error)?.message}</Typography>
          </Box>
        ) : (
          <DataGrid
            rows={data?.items ?? []}
            columns={columns}
            rowCount={data?.totalCount ?? 0}
            paginationModel={{ page, pageSize }}
            onPaginationModelChange={handlePaginationModelChange}
            paginationMode="server"
            loading={isLoading}
            pageSizeOptions={[5, 10, 25, 50]}
            disableRowSelectionOnClick
            onRowClick={(params) => navigate(`/work-orders/${params.id}`)}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={setColumnVisibilityModel}
            sortingMode={SERVER_SIDE_SORT ? "server" : "client"}
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            sx={{
              [`& .${gridClasses.row}:hover`]: { cursor: "pointer" },
            }}
          />
        )}
      </Box>

      {/* Advanced Filters Popover */}
      <Popover
        open={Boolean(filterAnchor)}
        anchorEl={filterAnchor}
        onClose={handleFilterPopoverClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Box sx={{ p: 2, minWidth: 300, maxWidth: 360 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Advanced Filters
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={2}>
            <TextField
              label="From Date"
              type="date"
              size="small"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={localFromDate}
              onChange={(e) => setLocalFromDate(e.target.value)}
            />
            <TextField
              label="To Date"
              type="date"
              size="small"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={localToDate}
              onChange={(e) => setLocalToDate(e.target.value)}
            />
            <TextField
              select
              label="Priority"
              size="small"
              fullWidth
              value={localPriority}
              onChange={(e) => setLocalPriority(e.target.value)}
              slotProps={{ select: { displayEmpty: true } }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value={Priority.Normal}>Normal</MenuItem>
              <MenuItem value={Priority.Urgent}>Urgent</MenuItem>
              <MenuItem value={Priority.Critical}>Critical</MenuItem>
            </TextField>
            <TextField
              select
              label="Status"
              size="small"
              fullWidth
              value={localStatus}
              onChange={(e) => setLocalStatus(e.target.value)}
              slotProps={{ select: { displayEmpty: true } }}
            >
              <MenuItem value="">All</MenuItem>
              {Object.values(WorkOrderStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>

            {/* Equipment picker */}
            <Box>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => setEquipmentPickerOpen(true)}
                sx={{ justifyContent: "flex-start" }}
              >
                {localEquipmentId
                  ? `Equipment: ${localEquipmentName || localEquipmentId}`
                  : "Select Equipment"}
              </Button>
              {localEquipmentId && (
                <Chip
                  label={localEquipmentName || localEquipmentId}
                  size="small"
                  onDelete={() => {
                    setLocalEquipmentId("");
                    setLocalEquipmentName("");
                  }}
                  sx={{ mt: 0.5 }}
                />
              )}
            </Box>

            {/* Plan picker */}
            <Box>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => setPlanPickerOpen(true)}
                sx={{ justifyContent: "flex-start" }}
              >
                {localPlanId
                  ? `Plan: ${localPlanName || localPlanId}`
                  : "Select Maintenance Plan"}
              </Button>
              {localPlanId && (
                <Chip
                  label={localPlanName || localPlanId}
                  size="small"
                  onDelete={() => {
                    setLocalPlanId("");
                    setLocalPlanName("");
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

      {/* Column visibility popover */}
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

      {/* Picker dialogs */}
      <EquipmentPickerDialog
        open={equipmentPickerOpen}
        onClose={() => setEquipmentPickerOpen(false)}
        onSelect={handleSelectEquipment}
      />
      <MaintenancePlanPickerDialog
        open={planPickerOpen}
        onClose={() => setPlanPickerOpen(false)}
        onSelect={handleSelectPlan}
      />
    </PageContainer>
  );
}

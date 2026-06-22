import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
  GridActionsCellItem,
  gridClasses,
} from "@mui/x-data-grid";
import {
  Button,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Stack,
  TextField,
  Popover,
  Checkbox,
  FormControlLabel,
  Divider,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Badge,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterListIcon from "@mui/icons-material/FilterList";
import StorefrontIcon from "@mui/icons-material/Storefront";
import EditIcon from "@mui/icons-material/Edit";
import { useHasPermissions } from "@/application/hooks/usePermission/usePermission";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import { usePurchaseOrders } from "@/application/hooks/purchaseOrders/usePurchaseOrders";
import type { GetPurchaseOrdersQueryParams } from "@/domain/purchaseOrders/PurchaseOrderTypes";
import { PurchaseOrderStatus } from "@/domain/purchaseOrders/PurchaseOrderTypes";
import PurchaseOrderStatusChip from "@/presentation/components/purchaseOrders/PurchaseOrderStatusChip";
import PageContainer from "@/presentation/components/PageContainer";
import VendorPickerDialog from "@/presentation/components/pickers/VendorPickerDialog";

const SERVER_SIDE_SORT = false; // toggle to true for server‑side sorting
const INITIAL_PAGE_SIZE = 10;

const ALL_COLUMNS = [
  { field: "vendorName", label: "Vendor" },
  { field: "orderDate", label: "Order Date" },
  { field: "status", label: "Status" },
  { field: "totalLines", label: "Lines" },
  { field: "totalAmount", label: "Amount" },
  { field: "currency", label: "Currency" },
  { field: "receivedAt", label: "Received At" },
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
  link.setAttribute("download", "purchase-orders.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function PurchaseOrderList() {
  const navigate = useNavigate();
  const { hasPermission } = useHasPermissions();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL‑driven applied filters
  const page = Number(searchParams.get("page") || "0");
  const pageSize = Number(
    searchParams.get("pageSize") || String(INITIAL_PAGE_SIZE),
  );
  const appliedSearch = searchParams.get("search") || "";
  const appliedVendorId = searchParams.get("vendorId") || "";
  const appliedStatus = searchParams.get("status") || "All";
  const appliedFromDate = searchParams.get("fromDate") || "";
  const appliedToDate = searchParams.get("toDate") || "";
  const appliedSortBy = searchParams.get("sortBy") || "";
  const appliedSortDirection = searchParams.get("sortDirection") as
    | "asc"
    | "desc"
    | "";

  // Display names (not in URL)
  const [vendorName, setVendorName] = useState(
    searchParams.get("vendorName") || "",
  );

  // Advanced filter popover local state
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
  const [localVendorId, setLocalVendorId] = useState(appliedVendorId);
  const [localVendorName, setLocalVendorName] = useState(vendorName);
  const [localStatus, setLocalStatus] = useState(appliedStatus);
  const [localFromDate, setLocalFromDate] = useState(appliedFromDate);
  const [localToDate, setLocalToDate] = useState(appliedToDate);

  // Sync local state when popover opens
  useEffect(() => {
    if (filterAnchor) {
      setLocalVendorId(appliedVendorId);
      setLocalVendorName(vendorName);
      setLocalStatus(appliedStatus);
      setLocalFromDate(appliedFromDate);
      setLocalToDate(appliedToDate);
    }
  }, [
    filterAnchor,
    appliedVendorId,
    vendorName,
    appliedStatus,
    appliedFromDate,
    appliedToDate,
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

  // Sorting model
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  // Vendor picker dialog
  const [vendorPickerOpen, setVendorPickerOpen] = useState(false);

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

  // Query params
  const query: GetPurchaseOrdersQueryParams = useMemo(
    () => ({
      page: page + 1,
      pageSize,
      vendorId: appliedVendorId || undefined,
      status:
        appliedStatus !== "All"
          ? (appliedStatus as PurchaseOrderStatus)
          : undefined,
      fromDate: appliedFromDate || undefined,
      toDate: appliedToDate || undefined,
      searchTerm: appliedSearch || undefined,
      sortBy: SERVER_SIDE_SORT ? appliedSortBy || undefined : undefined,
      sortDirection: SERVER_SIDE_SORT
        ? appliedSortDirection || undefined
        : undefined,
    }),
    [
      page,
      pageSize,
      appliedVendorId,
      appliedStatus,
      appliedFromDate,
      appliedToDate,
      appliedSearch,
      appliedSortBy,
      appliedSortDirection,
    ],
  );

  const { data, isLoading, isError, error, refetch } = usePurchaseOrders(query);

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

  // Advanced filter popover
  const handleFilterPopoverOpen = (event: React.MouseEvent<HTMLElement>) =>
    setFilterAnchor(event.currentTarget);
  const handleFilterPopoverClose = () => setFilterAnchor(null);

  const applyAdvancedFilters = () => {
    setFilters({
      vendorId: localVendorId || undefined,
      vendorName: localVendorName || undefined,
      status: localStatus !== "All" ? localStatus : undefined,
      fromDate: localFromDate || undefined,
      toDate: localToDate || undefined,
    });
    setVendorName(localVendorName);
    handleFilterPopoverClose();
  };

  const clearAdvancedFilters = () => {
    setLocalVendorId("");
    setLocalVendorName("");
    setLocalStatus("All");
    setLocalFromDate("");
    setLocalToDate("");
    setFilters({
      vendorId: undefined,
      vendorName: undefined,
      status: undefined,
      fromDate: undefined,
      toDate: undefined,
    });
    setVendorName("");
    handleFilterPopoverClose();
  };

  // Vendor selection from picker (local)
  const handleVendorSelected = (vendor: any) => {
    setLocalVendorId(vendor.id);
    setLocalVendorName(vendor.name);
    setVendorPickerOpen(false);
  };

  // Check if any advanced filter is active
  const isFilterActive = !!(
    appliedVendorId ||
    appliedStatus !== "All" ||
    appliedFromDate ||
    appliedToDate
  );

  // Columns
  const columns: GridColDef[] = useMemo(
    () => [
      { field: "vendorName", headerName: "Vendor", flex: 1.5, sortable: true },
      {
        field: "orderDate",
        headerName: "Order Date",
        width: 130,
        type: "date",
        sortable: true,
        valueGetter: (value) => value && new Date(value),
      },
      {
        field: "status",
        headerName: "Status",
        width: 120,
        sortable: true,
        renderCell: (params) => (
          <PurchaseOrderStatusChip status={params.value} />
        ),
      },
      { field: "totalLines", headerName: "Lines", width: 80, sortable: true },
      {
        field: "totalAmount",
        headerName: "Amount",
        width: 120,
        sortable: true,
        valueFormatter: (value, row) =>
          value != null ? `${value} ${row.currency ?? ""}` : "",
      },
      { field: "currency", headerName: "Currency", width: 100, sortable: true },
      {
        field: "receivedAt",
        headerName: "Received",
        width: 130,
        type: "date",
        sortable: true,
        valueGetter: (value) => value && new Date(value),
      },
      {
        field: "actions",
        type: "actions",
        width: 80,
        sortable: false,
        getActions: ({ row }) => {
          const actions = [
            <GridActionsCellItem
              key="view"
              icon={<VisibilityIcon fontSize="small" />}
              label="View"
              onClick={() => navigate(`/purchase-orders/${row.id}`)}
              showInMenu
            />,
          ];

          // ★ Add Edit action for Draft orders with permission
          if (
            row.status === "Draft" &&
            hasPermission(Permissions.PurchaseOrders.Update)
          ) {
            actions.push(
              <GridActionsCellItem
                key="edit"
                icon={<EditIcon fontSize="small" />}
                label="Edit"
                onClick={() => navigate(`/purchase-orders/${row.id}/edit`)}
                showInMenu
              />,
            );
          }

          return actions;
        },
      },
    ],
    [navigate, hasPermission],
  );

  // Column visibility toggle
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
      title="Purchase Orders"
      breadcrumbs={[{ title: "Purchase Orders" }]}
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
          <Can requiredPermissions={[Permissions.PurchaseOrders.Create]}>
            <Button
              variant="contained"
              startIcon={<AddIcon fontSize="small" />}
              onClick={() => navigate("/purchase-orders/new")}
            >
              New Order
            </Button>
          </Can>
        </Stack>
      }
    >
      <Box sx={{ flex: 1, width: "100%" }}>
        {/* Search + action icons */}
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
                    <SearchIcon
                      fontSize="small"
                      sx={{ color: "action.active" }}
                    />
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

        {/* Data grid */}
        {isError ? (
          <Typography color="error">{(error as Error)?.message}</Typography>
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
            pageSizeOptions={[5, 10, 25, 50]}
            disableRowSelectionOnClick
            onRowClick={(params) => navigate(`/purchase-orders/${params.id}`)}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={setColumnVisibilityModel}
            sx={{ [`& .${gridClasses.row}:hover`]: { cursor: "pointer" } }}
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
            {/* Vendor picker */}
            <Box>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                startIcon={<StorefrontIcon />}
                onClick={() => setVendorPickerOpen(true)}
                sx={{ justifyContent: "flex-start" }}
              >
                {localVendorId
                  ? `Vendor: ${localVendorName || localVendorId}`
                  : "Select Vendor"}
              </Button>
              {localVendorId && (
                <Chip
                  label={localVendorName || localVendorId}
                  size="small"
                  onDelete={() => {
                    setLocalVendorId("");
                    setLocalVendorName("");
                  }}
                  sx={{ mt: 0.5 }}
                />
              )}
            </Box>

            {/* Status filter */}
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={localStatus}
                label="Status"
                onChange={(e) => setLocalStatus(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                {Object.values(PurchaseOrderStatus).map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Date filters */}
            <TextField
              label="From Date"
              type="date"
              size="small"
              fullWidth
              value={localFromDate}
              onChange={(e) => setLocalFromDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="To Date"
              type="date"
              size="small"
              fullWidth
              value={localToDate}
              onChange={(e) => setLocalToDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
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

      {/* Vendor Picker Dialog */}
      <VendorPickerDialog
        open={vendorPickerOpen}
        onClose={() => setVendorPickerOpen(false)}
        onSelect={handleVendorSelected}
      />
    </PageContainer>
  );
}

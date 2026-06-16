import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
  gridClasses,
} from "@mui/x-data-grid";
import {
  Button,
  Typography,
  IconButton,
  Tooltip,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Popover,
  Badge,
  Divider,
  Checkbox,
  FormControlLabel,
  Chip,
  InputAdornment,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InventoryIcon from "@mui/icons-material/Inventory";
import StoreIcon from "@mui/icons-material/Store";
import SearchIcon from "@mui/icons-material/Search";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import FilterListIcon from "@mui/icons-material/FilterList";
import PageContainer from "@/presentation/components/PageContainer";
// import { Can } from "@/presentation/components/Can";
// import { Permissions } from "@/domain/shared/Permissions";
import { useStockTransactions } from "@/application/hooks/stockTransactions/useStockTransactions";
import { TransactionType } from "@/domain/stockTransactions/StockTransactionTypes";
import type { GetStockTransactionsQueryParams } from "@/domain/stockTransactions/StockTransactionTypes";
import MaterialItemPickerDialog from "@/presentation/components/pickers/MaterialItemPickerDialog";
import MaterialStorePickerDialog from "@/presentation/components/pickers/MaterialStorePickerDialog";

const SERVER_SIDE_SORT = false; // toggle for server‑side sorting
const INITIAL_PAGE_SIZE = 10;

const ALL_COLUMNS = [
  { field: "transactionDate", label: "Date" },
  { field: "type", label: "Type" },
  { field: "itemName", label: "Item" },
  { field: "storeName", label: "Store" },
  { field: "signedQuantity", label: "Qty" },
  { field: "referenceName", label: "Reference" },
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
  link.setAttribute("download", "stock-transactions.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function StockTransactionList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL‑driven applied filters
  const page = Number(searchParams.get("page") || "0");
  const pageSize = Number(
    searchParams.get("pageSize") || String(INITIAL_PAGE_SIZE),
  );
  const appliedItemId = searchParams.get("itemId") || "";
  const appliedItemName = searchParams.get("itemName") || "";
  const appliedStoreId = searchParams.get("storeId") || "";
  const appliedStoreName = searchParams.get("storeName") || "";
  const appliedType = searchParams.get("type") || "All";
  const appliedFromDate = searchParams.get("fromDate") || "";
  const appliedToDate = searchParams.get("toDate") || "";
  const appliedSearch = searchParams.get("search") || "";
  const appliedSortBy = searchParams.get("sortBy") || "";
  const appliedSortDirection = searchParams.get("sortDirection") as
    | "asc"
    | "desc"
    | "";

  // Display names (not in URL)
  // const [itemName, setItemName] = useState(appliedItemName);
  // const [storeName, setStoreName] = useState(appliedStoreName);

  // Advanced filter popover local state
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
  const [localItemId, setLocalItemId] = useState(appliedItemId);
  const [localItemName, setLocalItemName] = useState(appliedItemName);
  const [localStoreId, setLocalStoreId] = useState(appliedStoreId);
  const [localStoreName, setLocalStoreName] = useState(appliedStoreName);
  const [localType, setLocalType] = useState(appliedType);
  const [localFromDate, setLocalFromDate] = useState(appliedFromDate);
  const [localToDate, setLocalToDate] = useState(appliedToDate);

  // Sync local state when popover opens
  useEffect(() => {
    if (filterAnchor) {
      setLocalItemId(appliedItemId);
      setLocalItemName(appliedItemName);
      setLocalStoreId(appliedStoreId);
      setLocalStoreName(appliedStoreName);
      setLocalType(appliedType);
      setLocalFromDate(appliedFromDate);
      setLocalToDate(appliedToDate);
    }
  }, [
    filterAnchor,
    appliedItemId,
    appliedItemName,
    appliedStoreId,
    appliedStoreName,
    appliedType,
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

  // Picker open states
  const [itemPickerOpen, setItemPickerOpen] = useState(false);
  const [storePickerOpen, setStorePickerOpen] = useState(false);

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
  const queryParams: GetStockTransactionsQueryParams = useMemo(
    () => ({
      page: page + 1,
      pageSize,
      itemId: appliedItemId || undefined,
      storeId: appliedStoreId || undefined,
      type:
        appliedType !== "All" ? (appliedType as TransactionType) : undefined,
      fromDate: appliedFromDate
        ? new Date(appliedFromDate).toISOString()
        : undefined,
      toDate: appliedToDate ? new Date(appliedToDate).toISOString() : undefined,
      searchTerm: appliedSearch || undefined,
      sortBy: SERVER_SIDE_SORT ? appliedSortBy || undefined : undefined,
      sortDirection: SERVER_SIDE_SORT
        ? appliedSortDirection || undefined
        : undefined,
    }),
    [
      page,
      pageSize,
      appliedItemId,
      appliedStoreId,
      appliedType,
      appliedFromDate,
      appliedToDate,
      appliedSearch,
      appliedSortBy,
      appliedSortDirection,
    ],
  );

  const { data, isLoading, isError, error, refetch } =
    useStockTransactions(queryParams);

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
      itemId: localItemId || undefined,
      itemName: localItemName || undefined,
      storeId: localStoreId || undefined,
      storeName: localStoreName || undefined,
      type: localType !== "All" ? localType : undefined,
      fromDate: localFromDate || undefined,
      toDate: localToDate || undefined,
    });
    // setItemName(localItemName);
    // setStoreName(localStoreName);
    handleFilterPopoverClose();
  };

  const clearAdvancedFilters = () => {
    setLocalItemId("");
    setLocalItemName("");
    setLocalStoreId("");
    setLocalStoreName("");
    setLocalType("All");
    setLocalFromDate("");
    setLocalToDate("");
    setFilters({
      itemId: undefined,
      itemName: undefined,
      storeId: undefined,
      storeName: undefined,
      type: undefined,
      fromDate: undefined,
      toDate: undefined,
    });
    // setItemName("");
    // setStoreName("");
    handleFilterPopoverClose();
  };

  // Picker selection handlers (local state)
  const handleItemSelected = (item: any) => {
    setLocalItemId(item.id);
    setLocalItemName(item.name);
    setItemPickerOpen(false);
  };

  const handleStoreSelected = (store: any) => {
    setLocalStoreId(store.id);
    setLocalStoreName(store.name);
    setStorePickerOpen(false);
  };

  // Check if any advanced filter is active
  const isFilterActive = !!(
    appliedItemId ||
    appliedStoreId ||
    appliedType !== "All" ||
    appliedFromDate ||
    appliedToDate
  );

  // Columns
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "transactionDate",
        headerName: "Date",
        width: 165,
        valueGetter: (value) => value && new Date(value),
        type: "dateTime",
        sortable: true,
      },
      { field: "type", headerName: "Type", width: 130, sortable: true },
      {
        field: "itemName",
        headerName: "Item",
        flex: 1,
        minWidth: 150,
        sortable: true,
      },
      {
        field: "storeName",
        headerName: "Store",
        flex: 1,
        minWidth: 150,
        sortable: true,
      },
      {
        field: "signedQuantity",
        headerName: "Qty",
        width: 100,
        align: "center",
        sortable: true,
        renderCell: (params) => (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Typography
              variant="body2"
              color={params.value >= 0 ? "success" : "error"}
            >
              {params.value} {params.row.unit}
            </Typography>
          </Box>
        ),
      },
      {
        field: "referenceName",
        headerName: "Reference",
        width: 150,
        sortable: true,
      },
      {
        field: "actions",
        type: "actions",
        width: 80,
        sortable: false,
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="view"
            icon={<VisibilityIcon fontSize="small" />}
            label="View"
            onClick={() => navigate(`/stock-transactions/${row.id}`)}
            showInMenu
          />,
        ],
      },
    ],
    [navigate],
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
      title="Stock Transactions"
      breadcrumbs={[{ title: "Stock Transactions" }]}
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
            onRowClick={(params) =>
              navigate(`/stock-transactions/${params.id}`)
            }
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
            {/* Item picker */}
            <Box>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                startIcon={<InventoryIcon />}
                onClick={() => setItemPickerOpen(true)}
                sx={{ justifyContent: "flex-start" }}
              >
                {localItemId
                  ? `Item: ${localItemName || localItemId}`
                  : "Select Item"}
              </Button>
              {localItemId && (
                <Chip
                  label={localItemName || localItemId}
                  size="small"
                  onDelete={() => {
                    setLocalItemId("");
                    setLocalItemName("");
                  }}
                  sx={{ mt: 0.5 }}
                />
              )}
            </Box>

            {/* Store picker */}
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
                  ? `Store: ${localStoreName || localStoreId}`
                  : "Select Store"}
              </Button>
              {localStoreId && (
                <Chip
                  label={localStoreName || localStoreId}
                  size="small"
                  onDelete={() => {
                    setLocalStoreId("");
                    setLocalStoreName("");
                  }}
                  sx={{ mt: 0.5 }}
                />
              )}
            </Box>

            {/* Type filter */}
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={localType}
                label="Type"
                onChange={(e) => setLocalType(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                {Object.values(TransactionType).map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
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

      {/* Picker dialogs */}
      <MaterialItemPickerDialog
        open={itemPickerOpen}
        onClose={() => setItemPickerOpen(false)}
        onSelect={handleItemSelected}
        aggregateAcrossStores={true}
      />
      <MaterialStorePickerDialog
        open={storePickerOpen}
        onClose={() => setStorePickerOpen(false)}
        onSelect={handleStoreSelected}
      />
    </PageContainer>
  );
}

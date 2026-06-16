import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import type { MaterialItemListItemDto } from "@/domain/materialItems/MaterialItemTypes";
import { useMaterialItemsList } from "@/application/hooks/materialItems/useMaterialItems";

const columns: GridColDef<MaterialItemListItemDto>[] = [
  { field: "sku", headerName: "SKU", width: 130 },
  { field: "name", headerName: "Name", flex: 1, minWidth: 180 },
  { field: "storeName", headerName: "Store", width: 150 },
  {
    field: "available",
    headerName: "Available",
    width: 100,
    type: "number",
    renderCell: (params) => `${params.value} ${params.row.unit}`,
  },
];

interface MaterialItemPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: MaterialItemListItemDto) => void;
  /** If provided, only items from this store are shown */
  storeId?: string;
  /** Optional: exclude a specific item ID from selection */
  excludeId?: string;
  aggregateAcrossStores?: boolean;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

const MaterialItemPickerDialog: React.FC<MaterialItemPickerDialogProps> = ({
  open,
  onClose,
  onSelect,
  storeId,
  excludeId,
  aggregateAcrossStores,
  sortBy,
  sortDirection,
}) => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [searchText, setSearchText] = useState("");

  // Build query params directly (bypassing the helper that expects a filter model)
  const queryParams = {
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    searchTerm: searchText || undefined,
    sortBy,
    sortDirection: sortDirection as "asc" | "desc" | undefined,
    storeId,
    lowStockOnly: false,
    aggregateAcrossStores: aggregateAcrossStores ?? false,
  };

  const { data, isLoading, isError, error } = useMaterialItemsList(
    queryParams,
    {
      enabled: open,
    },
  );

  const handleRowClick = useCallback(
    (params: any) => {
      if (excludeId && params.row.id === excludeId) return;
      onSelect(params.row as MaterialItemListItemDto);
      onClose();
    },
    [onSelect, onClose, excludeId],
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Select Material Item</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by name or SKU..."
          />
        </Box>
        <DataGrid
          rows={data?.items ?? []}
          columns={columns}
          rowCount={data?.totalCount ?? 0}
          loading={isLoading}
          paginationMode="server"
          sortingMode="client"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 25]}
          getRowId={(row) => row.id}
          onRowClick={handleRowClick}
          disableRowSelectionOnClick
          autoHeight
          sx={{ cursor: "pointer" }}
        />
        {isError && (
          <Box sx={{ color: "error.main", mt: 1 }}>
            {(error as Error)?.message || "Failed to load material items."}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaterialItemPickerDialog;

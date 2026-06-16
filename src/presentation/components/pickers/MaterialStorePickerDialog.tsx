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
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
} from "@mui/x-data-grid";
import type { MaterialStoreDto } from "@/domain/materialStores/MaterialStoreTypes";
import { useMaterialStoresQuery } from "@/application/hooks/materialStores/useMaterialStores";

const columns: GridColDef[] = [
  { field: "code", headerName: "Code", flex: 1 },
  { field: "name", headerName: "Name", flex: 2 },
];

interface MaterialStorePickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (store: MaterialStoreDto) => void;
  excludeId?: string;
}

const MaterialStorePickerDialog: React.FC<MaterialStorePickerDialogProps> = ({
  open,
  onClose,
  onSelect,
  excludeId,
}) => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [searchText, setSearchText] = useState("");

  const queryParams = {
    page: paginationModel.page + 1, // hook expects 1-based page
    pageSize: paginationModel.pageSize,
    searchTerm: searchText || undefined,
    sortBy: sortModel[0]?.field,
    sortDirection: sortModel[0]?.sort as "asc" | "desc" | undefined,
  };

  const { data, isLoading, isError, error } = useMaterialStoresQuery(
    queryParams,
    {
      enabled: open,
    },
  );

  const handleRowClick = useCallback(
    (params: any) => {
      if (excludeId && params.row.id === excludeId) return;
      onSelect(params.row as MaterialStoreDto);
      onClose();
    },
    [onSelect, onClose, excludeId],
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Select Material Store</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by code or name..."
          />
        </Box>
        <DataGrid
          rows={data?.items ?? []}
          columns={columns}
          rowCount={data?.totalCount ?? 0}
          loading={isLoading}
          paginationMode="server"
          sortingMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          pageSizeOptions={[5, 10, 25]}
          getRowId={(row) => row.id}
          onRowClick={handleRowClick}
          disableRowSelectionOnClick
          autoHeight
          sx={{ cursor: "pointer" }}
        />
        {isError && (
          <Box sx={{ color: "error.main", mt: 1 }}>
            {(error as Error)?.message || "Failed to load material stores."}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaterialStorePickerDialog;

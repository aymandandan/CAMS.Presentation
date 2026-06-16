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
import type { EquipmentListItemDto } from "@/domain/equipment/EquipmentTypes";
import { useEquipmentList } from "@/application/hooks/equipment/useEquipment";

const columns: GridColDef[] = [
  { field: "code", headerName: "Code", flex: 1 },
  { field: "name", headerName: "Name", flex: 2 },
  { field: "location", headerName: "Location", flex: 1 },
  { field: "status", headerName: "Status", width: 140 },
];

interface EquipmentPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (equipment: EquipmentListItemDto) => void;
  excludeId?: string;
  filterCategoryId?: string; // New prop
}

const EquipmentPickerDialog: React.FC<EquipmentPickerDialogProps> = ({
  open,
  onClose,
  onSelect,
  excludeId,
  filterCategoryId,
}) => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [searchText, setSearchText] = useState("");

  const queryParams = {
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    searchTerm: searchText || undefined,
    sortBy: sortModel[0]?.field,
    sortDirection: sortModel[0]?.sort as "asc" | "desc" | undefined,
    isPagingEnabled: true,
    categoryId: filterCategoryId, // pass category filter if provided
  };

  const { data, isLoading, error } = useEquipmentList(queryParams, {
    enabled: open,
  });

  const handleRowClick = useCallback(
    (params: any) => {
      if (excludeId && params.row.id === excludeId) return;
      onSelect(params.row);
      onClose();
    },
    [onSelect, onClose, excludeId],
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Select Equipment</DialogTitle>
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
        {error && (
          <Box sx={{ color: "error.main", mt: 1 }}>
            Failed to load equipment.
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EquipmentPickerDialog;

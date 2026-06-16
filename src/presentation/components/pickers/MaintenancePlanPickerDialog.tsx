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
import type { MaintenancePlanListItemDto } from "@/domain/maintenancePlans/MaintenancePlanTypes";
import { useMaintenancePlans } from "@/application/hooks/maintenancePlans/useMaintenancePlans";

const columns: GridColDef[] = [
  { field: "code", headerName: "Code", flex: 1 },
  { field: "description", headerName: "Description", flex: 2 },
  { field: "cycleDays", headerName: "Cycle Days", flex: 1 },
];

interface MaintenancePlanPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (plan: MaintenancePlanListItemDto) => void;
  excludeId?: string;
  activeOnly?: boolean;
}

const MaintenancePlanPickerDialog: React.FC<
  MaintenancePlanPickerDialogProps
> = ({ open, onClose, onSelect, excludeId, activeOnly = false }) => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [searchText, setSearchText] = useState("");

  // Build query params matching MaintenancePlansQueryParams
  const queryParams = {
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    searchTerm: searchText || undefined,
    isActive: activeOnly ? true : undefined,
  };

  const { data, isLoading, isError, error } = useMaintenancePlans(queryParams, {
    enabled: open,
  });

  const handleRowClick = useCallback(
    (params: any) => {
      if (excludeId && params.row.id === excludeId) return;
      onSelect(params.row as MaintenancePlanListItemDto);
      onClose();
    },
    [onSelect, onClose, excludeId],
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Select Maintenance Plan</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by code or description..."
          />
        </Box>
        <DataGrid
          rows={data?.items ?? []}
          columns={columns}
          rowCount={data?.totalCount ?? 0}
          loading={isLoading}
          paginationMode="server"
          sortingMode="client" // client‑side sorting
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
            {(error as Error)?.message || "Failed to load maintenance plans."}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaintenancePlanPickerDialog;

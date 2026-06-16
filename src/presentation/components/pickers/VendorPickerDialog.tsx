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
import { useVendors } from "@/application/hooks/vendors/useVendors";
import type { VendorDto } from "@/domain/vendors/VendorTypes";

const columns: GridColDef[] = [
  { field: "name", headerName: "Name", flex: 1 },
  { field: "email", headerName: "Email", width: 200 },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (vendor: VendorDto) => void;
}

const VendorPickerDialog: React.FC<Props> = ({ open, onClose, onSelect }) => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [searchText, setSearchText] = useState("");

  const queryParams = {
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    searchTerm: searchText || undefined,
  };

  const { data, isLoading, isError, error } = useVendors(queryParams, {
    enabled: open,
  });

  const handleRowClick = useCallback(
    (params: any) => {
      onSelect(params.row as VendorDto);
      onClose();
    },
    [onSelect, onClose],
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Select Vendor</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by name..."
          />
        </Box>
        <DataGrid
          rows={data?.items ?? []}
          columns={columns}
          rowCount={data?.totalCount ?? 0}
          loading={isLoading}
          paginationMode="server"
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
            {(error as Error)?.message || "Failed to load vendors."}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default VendorPickerDialog;

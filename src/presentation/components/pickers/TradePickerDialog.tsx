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
} from "@mui/x-data-grid";
import type { TradeDto } from "@/domain/trades/TradeTypes";
import { useTradesQuery } from "@/application/hooks/trades/useTrades";

const columns: GridColDef[] = [
  { field: "code", headerName: "Code", flex: 1 },
  { field: "name", headerName: "Name", flex: 2 },
];

interface TradePickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (trade: TradeDto) => void;
  excludeId?: string;
}

const TradePickerDialog: React.FC<TradePickerDialogProps> = ({
  open,
  onClose,
  onSelect,
  excludeId,
}) => {
  const [searchText, setSearchText] = useState("");
  const { data: allTrades, isLoading, isError, error } = useTradesQuery();

  // Client‑side filter
  const filteredTrades = allTrades?.filter(
    (t) =>
      !searchText ||
      t.code.toLowerCase().includes(searchText.toLowerCase()) ||
      t.name.toLowerCase().includes(searchText.toLowerCase())
  ) ?? [];

  const handleRowClick = useCallback(
    (params: any) => {
      if (excludeId && params.row.id === excludeId) return;
      onSelect(params.row as TradeDto);
      onClose();
    },
    [onSelect, onClose, excludeId],
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Select Trade</DialogTitle>
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
          rows={filteredTrades}
          columns={columns}
          loading={isLoading}
          paginationMode="client"   // all data loaded, paginate locally
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          getRowId={(row) => row.id}
          onRowClick={handleRowClick}
          disableRowSelectionOnClick
          autoHeight
          sx={{ cursor: "pointer" }}
        />
        {isError && (
          <Box sx={{ color: "error.main", mt: 1 }}>
            {(error as Error)?.message || "Failed to load trades."}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TradePickerDialog;
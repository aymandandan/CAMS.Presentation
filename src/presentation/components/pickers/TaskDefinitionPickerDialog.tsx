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
import { useSearchTaskDefinitions } from "@/application/hooks/taskDefinitions/useTaskDefinitions";
import { TaskDefinition } from "@/domain/taskDefinitions/TaskDefinitionTypes";
import { WorkOrderType } from "@/domain/workOrders/WorkOrderTypes";

const columns: GridColDef<TaskDefinition>[] = [
  { field: "description", headerName: "Description", flex: 2 },
  { field: "estimatedDuration", headerName: "Duration", flex: 1 },
  { field: "type", headerName: "Type", width: 180 },
];

interface TaskDefinitionPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (taskDefinition: TaskDefinition) => void;
  excludeId?: string;
  filterType?: WorkOrderType;
}

const TaskDefinitionPickerDialog: React.FC<TaskDefinitionPickerDialogProps> = ({
  open,
  onClose,
  onSelect,
  excludeId,
  filterType,
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
    type: filterType, // filter by Corrective or Preventive
  };

  const { data, isLoading, isError, error } = useSearchTaskDefinitions(
    queryParams,
    {
      enabled: open,
    },
  );

  const handleRowClick = useCallback(
    (params: any) => {
      if (excludeId && params.row.id === excludeId) return;
      onSelect(params.row as TaskDefinition);
      onClose();
    },
    [onSelect, onClose, excludeId],
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Select Task Definition</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by description..."
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
            {(error as Error)?.message || "Failed to load task definitions."}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDefinitionPickerDialog;

import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Stack,
  Chip,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
} from "@mui/x-data-grid";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useActiveUsers } from "@/application/hooks/users/useUsers";
import RolePickerDialog from "./RolePickerDialog";
import type {
  UserListItemDto,
  UsersQueryRequest,
} from "@/domain/users/UserTypes";
import type { RoleDto } from "@/domain/roles/RoleTypes";

const columns: GridColDef<UserListItemDto>[] = [
  { field: "fullName", headerName: "Name", flex: 2 },
  { field: "email", headerName: "Email", flex: 2 },
  {
    field: "roles",
    headerName: "Roles",
    flex: 1,
    valueGetter: (_, row) =>
      Array.isArray(row.roles) ? row.roles.join(", ") : row.roles,
  },
];

interface ActiveUserPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (user: UserListItemDto) => void;
  excludeUserId?: string;
  filterParams?: Partial<UsersQueryRequest>;
  closeOnSelect?: boolean;
}

const ActiveUserPickerDialog: React.FC<ActiveUserPickerDialogProps> = ({
  open,
  onClose,
  onSelect,
  excludeUserId,
  filterParams,
  closeOnSelect = true,
}) => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [searchText, setSearchText] = useState("");

  // Role filter state
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);
  const [rolePickerOpen, setRolePickerOpen] = useState(false);

  // Combine external filters with internal role filter
  const queryParams: UsersQueryRequest = {
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    searchTerm: searchText || undefined,
    sortBy: sortModel[0]?.field,
    sortDirection: sortModel[0]?.sort as "asc" | "desc" | undefined,
    ...filterParams,
    // If internal role is selected, it overrides any external rolesFilter
    rolesFilter: selectedRole ? [selectedRole.name] : filterParams?.rolesFilter,
  };

  const { data, isLoading, isError, error } = useActiveUsers(queryParams, {
    enabled: open,
  });

  const handleRowClick = useCallback(
    (params: any) => {
      if (excludeUserId && params.row.id === excludeUserId) return;
      onSelect(params.row as UserListItemDto);
      if (closeOnSelect) {
        onClose();
      }
    },
    [onSelect, onClose, excludeUserId, closeOnSelect],
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Select User</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <TextField
              label="Search"
              variant="outlined"
              fullWidth
              size="small"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by name, email..."
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterListIcon />}
              onClick={() => setRolePickerOpen(true)}
            >
              {selectedRole ? "Role" : "Role"}
            </Button>
          </Stack>
          {selectedRole && (
            <Box>
              <Chip
                label={`Role: ${selectedRole.name}`}
                size="small"
                onDelete={() => setSelectedRole(null)}
              />
            </Box>
          )}
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
              {(error as Error)?.message || "Failed to load users."}
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>

      <RolePickerDialog
        open={rolePickerOpen}
        onClose={() => setRolePickerOpen(false)}
        onSelect={(role) => setSelectedRole(role)}
      />
    </Dialog>
  );
};

export default ActiveUserPickerDialog;

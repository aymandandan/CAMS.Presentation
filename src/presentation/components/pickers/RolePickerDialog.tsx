import { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItemButton,
  ListItemText,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useRoles } from "@/application/hooks/roles/useRoles";
import type { RoleDto } from "@/domain/roles/RoleTypes";

interface RolePickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (role: RoleDto) => void;
}

export default function RolePickerDialog({
  open,
  onClose,
  onSelect,
}: RolePickerDialogProps) {
  const { data: roles = [], isLoading } = useRoles();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return roles;
    const lower = search.toLowerCase();
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(lower) ||
        (r.description && r.description.toLowerCase().includes(lower)),
    );
  }, [roles, search]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Select Role</DialogTitle>
      <DialogContent dividers>
        <TextField
          size="small"
          placeholder="Search roles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          sx={{ mb: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <List dense sx={{ maxHeight: 300, overflow: "auto" }}>
          {filtered.map((role) => (
            <ListItemButton
              key={role.id}
              onClick={() => {
                onSelect(role);
                onClose();
              }}
            >
              <ListItemText primary={role.name} secondary={role.description} />
            </ListItemButton>
          ))}
          {filtered.length === 0 && !isLoading && (
            <ListItemText primary="No roles found" />
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}

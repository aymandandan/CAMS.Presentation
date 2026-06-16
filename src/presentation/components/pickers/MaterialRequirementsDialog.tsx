import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  IconButton,
  Paper,
  TextField,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import MaterialItemPickerDialog from "./MaterialItemPickerDialog";

// ── Local entry type (used inside the dialog) ──
export interface MaterialRequirementEntry {
  id: string; // unique temporary key (e.g. `mat-${itemId}-${Date.now()}`)
  itemId: string;
  itemName: string; // for display
  quantity: number;
  unitOfMeasure: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  requirements: MaterialRequirementEntry[]; // initial list from parent
  onConfirm: (requirements: MaterialRequirementEntry[]) => void; // called with final list on Save
  title?: string;
  readOnly?: boolean; // if true, only display (no add/remove/edit)
}

export default function MaterialRequirementsDialog({
  open,
  onClose,
  requirements,
  onConfirm,
  title = "Material Requirements",
  readOnly = false,
}: Props) {
  // Local copy that we modify; reset when dialog opens with new initial requirements
  const [localRequirements, setLocalRequirements] = useState<
    MaterialRequirementEntry[]
  >([]);
  const [itemPickerOpen, setItemPickerOpen] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalRequirements(requirements.map((r) => ({ ...r })));
      setDirty(false);
    }
  }, [open, requirements]);

  const handleAddItem = useCallback((item: any) => {
    // item comes from picker: { id, name, unit? }
    const newEntry: MaterialRequirementEntry = {
      id: `mat-${item.id}-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      quantity: 1,
      unitOfMeasure: item.unit ?? "pcs",
    };
    setLocalRequirements((prev) => [...prev, newEntry]);
    setDirty(true);
    setItemPickerOpen(false);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setLocalRequirements((prev) => prev.filter((r) => r.id !== id));
    setDirty(true);
  }, []);

  const handleUpdate = useCallback(
    (id: string, field: keyof MaterialRequirementEntry, value: any) => {
      setLocalRequirements((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
      );
      setDirty(true);
    },
    [],
  );

  const handleSave = useCallback(() => {
    // Validate
    const invalid = localRequirements.some(
      (r) => !r.itemId || r.quantity <= 0 || isNaN(r.quantity),
    );
    if (invalid) {
      // Could show inline error, but for simplicity rely on parent validation or show alert
      return;
    }
    onConfirm(localRequirements);
    onClose();
  }, [localRequirements, onConfirm, onClose]);

  const handleCancel = useCallback(() => {
    // Discard changes
    setLocalRequirements(requirements);
    setDirty(false);
    onClose();
  }, [requirements, onClose]);

  return (
    <>
      <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent dividers>
          {localRequirements.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No materials added yet.
            </Typography>
          ) : (
            <Stack spacing={1} sx={{ mb: 2 }}>
              {localRequirements.map((req) => (
                <Paper
                  key={req.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography variant="body2" sx={{ minWidth: 120, flex: 1 }}>
                    {req.itemName || "Unknown item"}
                  </Typography>
                  <TextField
                    label="Qty"
                    type="number"
                    size="small"
                    value={req.quantity}
                    onChange={(e) =>
                      handleUpdate(
                        req.id,
                        "quantity",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    slotProps={{ htmlInput: { min: 0, step: 0.1 } }}
                    sx={{ width: 90 }}
                    disabled={readOnly}
                  />
                  <TextField
                    label="Unit"
                    size="small"
                    value={req.unitOfMeasure}
                    onChange={(e) =>
                      handleUpdate(req.id, "unitOfMeasure", e.target.value)
                    }
                    sx={{ width: 90 }}
                    disabled={readOnly}
                  />
                  {!readOnly && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemove(req.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Paper>
              ))}
            </Stack>
          )}

          {!readOnly && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setItemPickerOpen(true)}
              fullWidth
            >
              Add Material
            </Button>
          )}
          {dirty && (
            <Alert severity="info" sx={{ mt: 2 }}>
              You have unsaved changes.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          {!readOnly && (
            <Button onClick={handleSave} variant="contained" disabled={!dirty}>
              Save
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <MaterialItemPickerDialog
        open={itemPickerOpen}
        onClose={() => setItemPickerOpen(false)}
        onSelect={handleAddItem}
      />
    </>
  );
}

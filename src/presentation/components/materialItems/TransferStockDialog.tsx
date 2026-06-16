import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import type { TransferStockRequest } from "@/domain/materialItems/MaterialItemTypes";
import { useTransferStock } from "@/application/hooks/materialItems/useMaterialItems";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import MaterialStorePickerDialog from "@/presentation/components/pickers/MaterialStorePickerDialog";

interface TransferStockDialogProps {
  open: boolean;
  materialItemId: string;
  sourceName: string;
  availableQuantity: number;
  unit: string;
  sourceStoreId: string;
  onClose: () => void;
}

export default function TransferStockDialog({
  open,
  materialItemId,
  sourceName,
  availableQuantity,
  unit,
  sourceStoreId,
  onClose,
}: TransferStockDialogProps) {
  const [destinationStoreId, setDestinationStoreId] = useState("");
  const [destinationStoreName, setDestinationStoreName] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState("");
  const [destStoreError, setDestStoreError] = useState<string | null>(null);
  const [qtyError, setQtyError] = useState<string | null>(null);
  const [storePickerOpen, setStorePickerOpen] = useState(false);

  const transferMutation = useTransferStock();
  const notifications = useNotifications();

  const handleStoreSelected = (store: any) => {
    if (store.id === sourceStoreId) {
      setDestStoreError("Destination must be a different store.");
      return;
    }
    setDestinationStoreId(store.id);
    setDestinationStoreName(store.name || store.code);
    setDestStoreError(null);
    setStorePickerOpen(false);
  };

  const validateQuantity = (value: number) => {
    setQuantity(value);
    if (value <= 0) {
      setQtyError("Quantity must be greater than zero.");
    } else if (value > availableQuantity) {
      setQtyError(
        `Cannot transfer more than available (${availableQuantity} ${unit}).`
      );
    } else {
      setQtyError(null);
    }
  };

  const handleTransfer = async () => {
    if (destStoreError || qtyError || !destinationStoreId || quantity <= 0) {
      return;
    }

    const command: TransferStockRequest = {
      materialItemId: materialItemId,
      sourceStoreId,
      destinationStoreId,
      quantity,
      notes: notes.trim() || undefined,
    };

    try {
      await transferMutation.mutateAsync({
        id: materialItemId,
        data: command,
      });
      notifications.show("Stock transferred successfully.", {
        severity: "success",
      });
      onClose();
    } catch (error) {
      notifications.show(`Transfer failed: ${(error as Error).message}`, {
        severity: "error",
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Transfer Stock from {sourceName}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Available: {availableQuantity} {unit} at source store
        </Typography>

        {/* Destination store picker */}
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<StorefrontIcon />}
            onClick={() => setStorePickerOpen(true)}
            fullWidth
          >
            {destinationStoreId
              ? `Destination Store: ${destinationStoreName}`
              : "Select Destination Store"}
          </Button>
          {destStoreError && (
            <Typography variant="caption" color="error">
              {destStoreError}
            </Typography>
          )}
        </Box>

        <TextField
          label="Quantity"
          type="number"
          fullWidth
          value={quantity}
          onChange={(e) => validateQuantity(Number(e.target.value))}
          error={!!qtyError}
          helperText={qtyError ?? " "}
          sx={{ mb: 2 }}
          slotProps={{ htmlInput: { min: 1, max: availableQuantity } }}
        />
        <TextField
          label="Notes (optional)"
          fullWidth
          multiline
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleTransfer}
          variant="contained"
          disabled={
            transferMutation.isPending ||
            !!destStoreError ||
            !!qtyError ||
            !destinationStoreId
          }
        >
          Transfer
        </Button>
      </DialogActions>

      {/* Store picker – exclude source store */}
      <MaterialStorePickerDialog
        open={storePickerOpen}
        onClose={() => setStorePickerOpen(false)}
        onSelect={handleStoreSelected}
        excludeId={sourceStoreId}
      />
    </Dialog>
  );
}
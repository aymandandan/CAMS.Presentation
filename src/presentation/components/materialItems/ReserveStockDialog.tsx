import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import type { ReserveStockRequest } from '@/domain/materialItems/MaterialItemTypes';
import { useReserveStock } from '@/application/hooks/materialItems/useMaterialItems';
import useNotifications from '@/application/hooks/useNotifications/useNotifications';

interface ReserveStockDialogProps {
  open: boolean;
  materialItemId: string;
  materialName: string;
  availableQuantity: number;
  unit: string;
  storeId: string;
  onClose: () => void;
}

export default function ReserveStockDialog({
  open,
  materialItemId,
  materialName,
  availableQuantity,
  storeId,
  unit,
  onClose,
}: ReserveStockDialogProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [quantityError, setQuantityError] = useState<string | null>(null);

  const reserveMutation = useReserveStock();
  const notifications = useNotifications();

  const handleQuantityChange = (value: number) => {
    setQuantity(value);
    if (value <= 0) {
      setQuantityError('Quantity must be greater than zero.');
    } else if (value > availableQuantity) {
      setQuantityError(`Cannot reserve more than ${availableQuantity} ${unit}.`);
    } else {
      setQuantityError(null);
    }
  };

  const handleReserve = async () => {
    if (quantityError || quantity <= 0 || quantity > availableQuantity) {
      return;
    }

    const command: ReserveStockRequest = {
      materialItemId,
      storeId,
      quantity,
      notes: notes.trim() || undefined,
    };

    try {
      await reserveMutation.mutateAsync({ id: materialItemId, data: command });
      notifications.show('Stock reserved successfully.', { severity: 'success' });
      onClose();
    } catch (error) {
      notifications.show(`Reservation failed: ${(error as Error).message}`, {
        severity: 'error',
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Reserve Stock – {materialName}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Available: {availableQuantity} {unit}
        </Typography>
        <TextField
          label="Quantity"
          type="number"
          fullWidth
          value={quantity}
          onChange={(e) => handleQuantityChange(Number(e.target.value))}
          error={!!quantityError}
          helperText={quantityError ?? ' '}
          sx={{ mb: 2 }}
          slotProps={{ htmlInput: { min: 1, ma: availableQuantity } }}
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
          onClick={handleReserve}
          variant="contained"
          disabled={reserveMutation.isPending || !!quantityError}
        >
          Reserve
        </Button>
      </DialogActions>
    </Dialog>
  );
}
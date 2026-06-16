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
import type { ReleaseReservationRequest } from '@/domain/materialItems/MaterialItemTypes';
import { useReleaseReservation } from '@/application/hooks/materialItems/useMaterialItems';
import useNotifications from '@/application/hooks/useNotifications/useNotifications';

interface ReleaseReservationDialogProps {
  open: boolean;
  materialItemId: string;
  materialName: string;
  reservedQuantity: number;
  unit: string;
  storeId: string;
  onClose: () => void;
}

export default function ReleaseReservationDialog({
  open,
  materialItemId,
  materialName,
  reservedQuantity,
  unit,
  storeId,
  onClose,
}: ReleaseReservationDialogProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [quantityError, setQuantityError] = useState<string | null>(null);

  const releaseMutation = useReleaseReservation();
  const notifications = useNotifications();

  const handleQuantityChange = (value: number) => {
    setQuantity(value);
    if (value <= 0) {
      setQuantityError('Quantity must be greater than zero.');
    } else if (value > reservedQuantity) {
      setQuantityError(`Cannot release more than ${reservedQuantity} ${unit}.`);
    } else {
      setQuantityError(null);
    }
  };

  const handleRelease = async () => {
    if (quantityError || quantity <= 0 || quantity > reservedQuantity) {
      return;
    }

    const command: ReleaseReservationRequest = {
      materialItemId,
      storeId,
      quantity,
      notes: notes.trim() || undefined,
    };

    try {
      await releaseMutation.mutateAsync({ id: materialItemId, data: command });
      notifications.show('Reservation released successfully.', { severity: 'success' });
      onClose();
    } catch (error) {
      notifications.show(`Release failed: ${(error as Error).message}`, {
        severity: 'error',
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Release Reservation – {materialName}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Currently reserved: {reservedQuantity} {unit}
        </Typography>
        <TextField
          label="Quantity to release"
          type="number"
          fullWidth
          value={quantity}
          onChange={(e) => handleQuantityChange(Number(e.target.value))}
          error={!!quantityError}
          helperText={quantityError ?? ' '}
          sx={{ mb: 2 }}
          slotProps={{ htmlInput: { min: 1, max: reservedQuantity } }}
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
          onClick={handleRelease}
          variant="contained"
          disabled={releaseMutation.isPending || !!quantityError}
        >
          Release
        </Button>
      </DialogActions>
    </Dialog>
  );
}
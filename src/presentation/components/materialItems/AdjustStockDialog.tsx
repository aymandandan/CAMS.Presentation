import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import type { AdjustStockRequest } from '@/domain/materialItems/MaterialItemTypes';
import { useAdjustStock } from '@/application/hooks/materialItems/useMaterialItems';
import useNotifications from '@/application/hooks/useNotifications/useNotifications';

interface AdjustStockDialogProps {
  open: boolean;
  materialItemId: string;
  materialName: string;
  currentOnHand: number;
  unit: string;
  storeId: string;
  onClose: () => void;
}

type AdjustmentType = 'increase' | 'decrease';

export default function AdjustStockDialog({
  open,
  materialItemId,
  materialName,
  currentOnHand,
  unit,
  storeId,
  onClose,
}: AdjustStockDialogProps) {
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('increase');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [quantityError, setQuantityError] = useState<string | null>(null);

  const adjustMutation = useAdjustStock();
  const notifications = useNotifications();

  const handleQuantityChange = (value: number) => {
    setQuantity(value);
    if (value <= 0) {
      setQuantityError('Quantity must be greater than zero.');
    } else if (adjustmentType === 'decrease' && value > currentOnHand) {
      setQuantityError(`Cannot decrease by more than current on hand (${currentOnHand} ${unit}).`);
    } else {
      setQuantityError(null);
    }
  };

  const handleAdjust = async () => {
    const signedAdjustment = adjustmentType === 'increase' ? quantity : -quantity;
    if (quantityError || quantity <= 0) {
      return;
    }

    const command: AdjustStockRequest = {
      materialItemId,
      storeId,
      signedAdjustment,
      notes: notes.trim() || undefined,
    };

    try {
      await adjustMutation.mutateAsync({ id: materialItemId, data: command });
      notifications.show('Stock adjusted successfully.', { severity: 'success' });
      onClose();
    } catch (error) {
      notifications.show(`Adjustment failed: ${(error as Error).message}`, {
        severity: 'error',
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Adjust Stock – {materialName}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Current on hand: {currentOnHand} {unit}
        </Typography>
        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <FormLabel component="legend">Adjustment Type</FormLabel>
          <RadioGroup
            row
            value={adjustmentType}
            onChange={(e) => {
              setAdjustmentType(e.target.value as AdjustmentType);
              // re-validate quantity
              handleQuantityChange(quantity);
            }}
          >
            <FormControlLabel value="increase" control={<Radio />} label="Increase" />
            <FormControlLabel value="decrease" control={<Radio />} label="Decrease" />
          </RadioGroup>
        </FormControl>
        <TextField
          label="Quantity"
          type="number"
          fullWidth
          value={quantity}
          onChange={(e) => handleQuantityChange(Number(e.target.value))}
          error={!!quantityError}
          helperText={quantityError ?? ' '}
          sx={{ mb: 2 }}
          slotProps={{ htmlInput: { min: 1 } }}
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
          onClick={handleAdjust}
          variant="contained"
          disabled={adjustMutation.isPending || !!quantityError}
        >
          Adjust
        </Button>
      </DialogActions>
    </Dialog>
  );
}
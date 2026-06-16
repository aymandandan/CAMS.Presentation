// presentation/components/purchaseOrders/StorePickerForItemDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useMaterialItemById } from "@/application/hooks/materialItems/useMaterialItems";

interface Props {
  open: boolean;
  itemId: string;
  onSelect: (storeId: string, storeName: string) => void;
  onClose: () => void;
}

export default function StorePickerForItemDialog({
  open,
  itemId,
  onSelect,
  onClose,
}: Props) {
  const { data: item, isLoading, error } = useMaterialItemById(itemId);
  const stockLevels = item?.stockLevels ?? [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Select Store for Item</DialogTitle>
      <DialogContent>
        {isLoading && <CircularProgress size={24} sx={{ m: 2 }} />}
        {error && <Typography color="error">{(error as Error).message}</Typography>}
        {!isLoading && !error && stockLevels.length === 0 && (
          <Typography>This item is not available in any store.</Typography>
        )}
        <List>
          {stockLevels.map((level) => (
            <ListItemButton
              key={level.storeId}
              onClick={() => {
                onSelect(level.storeId, level.storeName);
                onClose();
              }}
            >
              <ListItemText
                primary={level.storeName}
                secondary={`${level.storeCode} - Available: ${level.available} ${level.unit}`}
              />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}
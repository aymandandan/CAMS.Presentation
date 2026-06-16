import { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Box,
  Typography,
  FormControlLabel,
  InputAdornment,
  Switch,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import MaterialStorePickerDialog from "@/presentation/components/pickers/MaterialStorePickerDialog";
import MaterialItemPickerDialog from "@/presentation/components/pickers/MaterialItemPickerDialog";
import type { MaterialItemListItemDto } from "@/domain/materialItems/MaterialItemTypes";
import { MaterialIssuanceType } from "@/domain/workOrders/WorkOrderTypes";

export interface NewMaterialIssuanceItem {
  itemId: string;
  itemName: string;
  sku: string;
  unit: string;
  quantity: number;
  issuanceType: MaterialIssuanceType;
  storeId: string;
  storeName: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (item: NewMaterialIssuanceItem) => void;
}

export default function AddMaterialIssueDialog({
  open,
  onClose,
  onAdd,
}: Props) {
  const [step, setStep] = useState<"selectStore" | "selectItem">("selectStore");
  const [applicationUse, setApplicationUse] = useState(false);

  // Store
  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storePickerOpen, setStorePickerOpen] = useState(false);

  // Item
  const [selectedItem, setSelectedItem] =
    useState<MaterialItemListItemDto | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [itemPickerOpen, setItemPickerOpen] = useState(false);

  const handleApplicationToggle = (_: any, checked: boolean) => {
    setApplicationUse(checked);
    if (checked) {
      // Application use – no store needed
      setStoreId("");
      setStoreName("");
      setStep("selectItem");
    } else {
      setStep("selectStore");
      setStoreId("");
      setStoreName("");
    }
  };

  const handleStoreSelected = useCallback((store: any) => {
    setStoreId(store.id);
    setStoreName(store.name || store.code);
    setStorePickerOpen(false);
    setStep("selectItem");
  }, []);

  const handleItemSelected = useCallback((item: MaterialItemListItemDto) => {
    setSelectedItem(item);
    setItemPickerOpen(false);
  }, []);

  const handleConfirm = () => {
    if (!selectedItem || quantity <= 0) return;
    const issuanceType = applicationUse
      ? MaterialIssuanceType.ForApplicationUse
      : MaterialIssuanceType.FromInventory;
    const newItem: NewMaterialIssuanceItem = {
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      sku: selectedItem.sku,
      unit: selectedItem.unit || "",
      quantity,
      issuanceType,
      storeId: applicationUse ? "" : storeId,
      storeName: applicationUse ? "" : storeName,
    };
    onAdd(newItem);
    // Reset
    setApplicationUse(false);
    setStoreId("");
    setStoreName("");
    setSelectedItem(null);
    setQuantity(0);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Material to Issue</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={applicationUse}
                onChange={handleApplicationToggle}
              />
            }
            label="Application Use (don't consume inventory)"
          />
          {!applicationUse && step === "selectStore" && (
            <Button
              variant="outlined"
              startIcon={<StorefrontIcon />}
              onClick={() => setStorePickerOpen(true)}
              fullWidth
            >
              {storeId ? storeName : "Select Material Store"}
            </Button>
          )}
          {(applicationUse || step === "selectItem") && (
            <>
              {!applicationUse && storeId && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Store: {storeName}
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setStep("selectStore")}
                  >
                    Change Store
                  </Button>
                </Box>
              )}
              <Button
                variant="outlined"
                onClick={() => setItemPickerOpen(true)}
                fullWidth
              >
                {selectedItem
                  ? `Item: ${selectedItem.name} (${selectedItem.sku})`
                  : "Select Material Item"}
              </Button>
              {selectedItem && (
                <Stack spacing={2}>
                  <TextField
                    type="number"
                    label="Quantity"
                    size="small"
                    value={quantity || ""}
                    onChange={(e) =>
                      setQuantity(parseFloat(e.target.value) || 0)
                    }
                    slotProps={{
                      htmlInput: { step: 0.1, min: 0 },
                      inputLabel: { shrink: true },
                      input: {
                        endAdornment: selectedItem?.unit ? (
                          <InputAdornment position="end">
                            {selectedItem.unit}
                          </InputAdornment>
                        ) : undefined,
                      },
                    }}
                  />
                </Stack>
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedItem || quantity <= 0}
        >
          Add to Issue List
        </Button>
      </DialogActions>

      {!applicationUse && (
        <MaterialStorePickerDialog
          open={storePickerOpen}
          onClose={() => setStorePickerOpen(false)}
          onSelect={handleStoreSelected}
        />
      )}
      {(applicationUse || storeId) && (
        <MaterialItemPickerDialog
          open={itemPickerOpen}
          onClose={() => setItemPickerOpen(false)}
          onSelect={handleItemSelected}
          sortBy={!applicationUse ? undefined : "stockable"}
          sortDirection={!applicationUse ? undefined : "asc"}
          storeId={applicationUse ? undefined : storeId}
          aggregateAcrossStores={applicationUse}
        />
      )}
    </Dialog>
  );
}

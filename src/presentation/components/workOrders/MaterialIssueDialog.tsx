import { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  IconButton,
  Box,
  Paper,
  Chip,
  Switch,
  FormControlLabel,
  Divider,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import StorefrontIcon from "@mui/icons-material/Storefront";
import BuildIcon from "@mui/icons-material/Build";
import { useIssueMaterials } from "@/application/hooks/workOrders/useWorkOrders";
import MaterialStorePickerDialog from "@/presentation/components/pickers/MaterialStorePickerDialog";
import MaterialItemPickerDialog from "@/presentation/components/pickers/MaterialItemPickerDialog";
import StorePickerForItemDialog from "@/presentation/components/pickers/StorePickerForItemDialog";
import type { MaterialItemListItemDto } from "@/domain/materialItems/MaterialItemTypes";
import type { MaterialRequirementDetailsDto } from "@/domain/workOrders/WorkOrderTypes";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import {
  MaterialIssuanceInput,
  MaterialIssuanceType,
} from "@/domain/workOrders/WorkOrderTypes";

interface SelectedMaterialItem {
  itemId: string;
  itemName: string;
  sku: string;
  unit: string;
  quantity: number;
  storeId?: string;
  storeName?: string;
  issuanceType?: MaterialIssuanceType;
}

interface Props {
  open: boolean;
  onClose: () => void;
  workOrderId: string;
  materialRequirements?: MaterialRequirementDetailsDto[];
}

export default function MaterialIssueDialog({
  open,
  onClose,
  workOrderId,
  materialRequirements = [],
}: Props) {
  const notifications = useNotifications();
  const mutation = useIssueMaterials();

  // Global toggle: Application Use?
  const [isApplication, setIsApplication] = useState(false);

  // Store selection (only when not application use)
  const [storeId, setStoreId] = useState<string>("");
  const [storeName, setStoreName] = useState<string>("");
  const [storePickerOpen, setStorePickerOpen] = useState(false);

  // Item picker
  const [itemPickerOpen, setItemPickerOpen] = useState(false);

  // Selected items (manual + quick‑issue)
  const [selectedItems, setSelectedItems] = useState<SelectedMaterialItem[]>(
    [],
  );

  // Quick‑issue store picker for a specific requirement item
  const [quickIssueItem, setQuickIssueItem] =
    useState<MaterialRequirementDetailsDto | null>(null);
  const [quickIssueStorePickerOpen, setQuickIssueStorePickerOpen] =
    useState(false);

  // Toggle application mode – reset selections
  const handleApplicationToggle = useCallback(
    (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setIsApplication(checked);
      setStoreId("");
      setStoreName("");
      setSelectedItems([]);
    },
    [],
  );

  // Store selection (manual)
  const handleStoreSelected = useCallback((store: any) => {
    setStoreId(store.id);
    setStoreName(store.name || store.code);
    setStorePickerOpen(false);
    setSelectedItems([]);
  }, []);

  // Manual item selected from picker
  const handleItemSelected = useCallback(
    (item: MaterialItemListItemDto) => {
      if (
        selectedItems.some(
          (si) =>
            si.itemId === item.id &&
            si.storeId === (isApplication ? undefined : storeId),
        )
      ) {
        notifications.show("Item already added with the same store/type.", {
          severity: "warning",
          autoHideDuration: 3000,
        });
        return;
      }
      setSelectedItems((prev) => [
        ...prev,
        {
          itemId: item.id,
          itemName: item.name,
          sku: item.sku,
          unit: item.unit || "",
          quantity: 0,
          storeId: isApplication ? undefined : storeId,
          storeName: isApplication ? undefined : storeName,
          // Explicitly set issuanceType based on current mode
          issuanceType: isApplication
            ? MaterialIssuanceType.ForApplicationUse
            : MaterialIssuanceType.FromInventory,
        },
      ]);
      setItemPickerOpen(false);
    },
    [selectedItems, isApplication, storeId, storeName, notifications],
  );

  const handleQuantityChange = (
    itemId: string,
    value: number,
    storeIdKey?: string,
  ) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.itemId === itemId &&
        (storeIdKey ? item.storeId === storeIdKey : true)
          ? { ...item, quantity: value }
          : item,
      ),
    );
  };

  const handleRemoveItem = (itemId: string, storeIdKey?: string) => {
    setSelectedItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.itemId === itemId &&
            (storeIdKey ? item.storeId === storeIdKey : true)
          ),
      ),
    );
  };

  // Quick‑issue handlers
  const handleQuickIssueApplication = useCallback(
    (req: MaterialRequirementDetailsDto) => {
      const newItem: SelectedMaterialItem = {
        itemId: req.itemId,
        itemName: req.itemName,
        sku: req.itemSku,
        unit: req.unitOfMeasure,
        quantity: req.quantity,
        issuanceType: MaterialIssuanceType.ForApplicationUse,
      };
      setSelectedItems((prev) => [...prev, newItem]);
    },
    [],
  );

  const handleQuickIssueFromInventory = useCallback(
    (req: MaterialRequirementDetailsDto) => {
      setQuickIssueItem(req);
      setQuickIssueStorePickerOpen(true);
    },
    [],
  );

  const handleQuickIssueStoreSelected = useCallback(
    (storeId: string, storeName: string) => {
      if (!quickIssueItem) return;
      const newItem: SelectedMaterialItem = {
        itemId: quickIssueItem.itemId,
        itemName: quickIssueItem.itemName,
        sku: quickIssueItem.itemSku,
        unit: quickIssueItem.unitOfMeasure,
        quantity: quickIssueItem.quantity,
        storeId,
        storeName,
        issuanceType: MaterialIssuanceType.FromInventory,
      };
      setSelectedItems((prev) => [...prev, newItem]);
      setQuickIssueItem(null);
      setQuickIssueStorePickerOpen(false);
    },
    [quickIssueItem],
  );

  // Detect if a requirement is already issued (any entry with matching itemId)
  const issuedItemIds = useMemo(
    () => new Set(selectedItems.map((item) => item.itemId)),
    [selectedItems],
  );

  const handleSubmit = () => {
    const materials: MaterialIssuanceInput[] = selectedItems.map((item) => {
      const issuanceType =
        item.issuanceType ??
        (isApplication
          ? MaterialIssuanceType.ForApplicationUse
          : MaterialIssuanceType.FromInventory);

      return {
        issuanceType,
        itemId: item.itemId,
        quantity: item.quantity,
        storeId:
          issuanceType === MaterialIssuanceType.FromInventory
            ? item.storeId || storeId
            : undefined,
      };
    });

    mutation.mutate(
      { id: workOrderId, data: { workOrderId, materials } },
      {
        onSuccess: () => {
          notifications.show("Materials issued successfully.", {
            severity: "success",
            autoHideDuration: 3000,
          });
          onClose();
          setIsApplication(false);
          setStoreId("");
          setStoreName("");
          setSelectedItems([]);
        },
        onError: (error) => {
          notifications.show(
            `Failed to issue materials: ${(error as Error).message}`,
            { severity: "error", autoHideDuration: 3000 },
          );
        },
      },
    );
  };

  // Improved validation: each item must have a quantity > 0 and,
  // if not application use, must have a storeId.
  const isValid =
    selectedItems.length > 0 &&
    selectedItems.every((item) => item.quantity > 0) &&
    selectedItems.every((item) =>
      item.issuanceType === MaterialIssuanceType.ForApplicationUse
        ? true
        : !!item.storeId,
    );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Issue Materials</DialogTitle>
      <DialogContent dividers>
        {/* Material Requirements Quick‑Issue Section */}
        {materialRequirements.length > 0 && (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Material Requirements (Quick Issue)
            </Typography>
            <Stack spacing={1} sx={{ mb: 2 }}>
              {materialRequirements.map((req) => {
                const isIssued = issuedItemIds.has(req.itemId);
                return (
                  <Paper
                    key={req.itemId}
                    variant="outlined"
                    sx={{ p: 1.5, opacity: isIssued ? 0.7 : 1 }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          component="div"
                          sx={{ fontWeight: 500 }}
                        >
                          {req.itemName}
                          {isIssued && (
                            <Chip
                              label="Issued"
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          SKU: {req.itemSku} · Qty: {req.quantity}{" "}
                          {req.unitOfMeasure}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip
                          title={
                            isIssued
                              ? "Already issued"
                              : "Issue from Inventory (select store)"
                          }
                        >
                          <span>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<StorefrontIcon />}
                              onClick={() => handleQuickIssueFromInventory(req)}
                              disabled={isIssued}
                            >
                              Inventory
                            </Button>
                          </span>
                        </Tooltip>
                        <Tooltip
                          title={
                            isIssued
                              ? "Already issued"
                              : "Issue for Application Use"
                          }
                        >
                          <span>
                            <Button
                              size="small"
                              variant="outlined"
                              color="secondary"
                              startIcon={<BuildIcon />}
                              onClick={() => handleQuickIssueApplication(req)}
                              disabled={isIssued}
                            >
                              App. Use
                            </Button>
                          </span>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {/* Manual Issue Section */}
        <Typography variant="body2" sx={{ mb: 2 }}>
          Choose whether the materials are for application use. If not, you must
          select a store.
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={isApplication}
              onChange={handleApplicationToggle}
            />
          }
          label="Application Use"
          sx={{ mb: 2 }}
        />

        {!isApplication && (
          <Stack
            direction="row"
            spacing={2}
            sx={{ mb: 2, alignItems: "center" }}
          >
            <Button
              variant="outlined"
              startIcon={<StorefrontIcon />}
              onClick={() => setStorePickerOpen(true)}
            >
              {storeId ? storeName : "Select Material Store"}
            </Button>
            {storeId && (
              <Chip
                label={`Store: ${storeName}`}
                onDelete={() => setStoreId("")}
              />
            )}
          </Stack>
        )}

        {(isApplication || storeId) && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setItemPickerOpen(true)}
            sx={{ mb: 2 }}
          >
            Add Material Item
          </Button>
        )}

        {selectedItems.length > 0 ? (
          <Stack spacing={2}>
            {selectedItems.map((item, index) => (
              <Paper
                key={`${item.itemId}-${item.storeId || "app"}-${index}`}
                variant="outlined"
                sx={{ p: 2 }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.itemName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      SKU: {item.sku} · Unit: {item.unit}
                      {item.storeName && ` · Store: ${item.storeName}`}
                      {item.issuanceType ===
                        MaterialIssuanceType.ForApplicationUse && " · App. Use"}
                    </Typography>
                  </Box>
                  <TextField
                    type="number"
                    size="small"
                    label="Quantity"
                    value={item.quantity || ""}
                    onChange={(e) =>
                      handleQuantityChange(
                        item.itemId,
                        parseFloat(e.target.value) || 0,
                        item.storeId,
                      )
                    }
                    sx={{ width: 110 }}
                    slotProps={{
                      htmlInput: { step: 0.1, min: 0 },
                      inputLabel: { shrink: true },
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveItem(item.itemId, item.storeId)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {isApplication || storeId
              ? "No items added yet."
              : "Please select a store first."}
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isValid || mutation.isPending}
        >
          Issue
        </Button>
      </DialogActions>

      {!isApplication && (
        <MaterialStorePickerDialog
          open={storePickerOpen}
          onClose={() => setStorePickerOpen(false)}
          onSelect={handleStoreSelected}
        />
      )}

      {(isApplication || storeId) && (
        <MaterialItemPickerDialog
          open={itemPickerOpen}
          onClose={() => setItemPickerOpen(false)}
          onSelect={handleItemSelected}
          storeId={isApplication ? undefined : storeId}
          sortBy={isApplication ? "stockable" : undefined}
          sortDirection={isApplication ? "asc" : undefined}
        />
      )}

      <StorePickerForItemDialog
        open={quickIssueStorePickerOpen}
        itemId={quickIssueItem?.itemId ?? ""}
        onSelect={handleQuickIssueStoreSelected}
        onClose={() => {
          setQuickIssueStorePickerOpen(false);
          setQuickIssueItem(null);
        }}
      />
    </Dialog>
  );
}

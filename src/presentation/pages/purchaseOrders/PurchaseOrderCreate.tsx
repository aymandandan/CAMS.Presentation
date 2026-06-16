// PurchaseOrderCreate.tsx
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Grid,
  Stack,
  Typography,
  IconButton,
  Paper,
  Card,
  CardContent,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import { useCreatePurchaseOrder } from "@/application/hooks/purchaseOrders/usePurchaseOrders";
import PageContainer from "@/presentation/components/PageContainer";
import VendorPickerDialog from "@/presentation/components/pickers/VendorPickerDialog";
import MaterialItemPickerDialog from "@/presentation/components/pickers/MaterialItemPickerDialog";
import StorePickerForItemDialog from "@/presentation/components/pickers/StorePickerForItemDialog";
import MaterialStorePickerDialog from "@/presentation/components/pickers/MaterialStorePickerDialog";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import { validateCreatePurchaseOrder } from "@/domain/purchaseOrders/PurchaseOrderValidation";
import type { CreatePurchaseOrderRequest } from "@/domain/purchaseOrders/PurchaseOrderTypes";

interface LineFormEntry {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  unit: string;
  storeId: string;
  storeName: string;
  quantity: number;
  unitPriceAmount: number;
  unitPriceCurrency: string;
}

const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "LBP"];

export default function PurchaseOrderCreate() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const createMutation = useCreatePurchaseOrder();

  const [vendorId, setVendorId] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [lines, setLines] = useState<LineFormEntry[]>([]);
  const [vendorPickerOpen, setVendorPickerOpen] = useState(false);

  const [itemPickerForLine, setItemPickerForLine] = useState<string | null>(
    null,
  );
  const [storePickerForLine, setStorePickerForLine] = useState<string | null>(
    null,
  );

  const handleVendorSelected = (vendor: any) => {
    setVendorId(vendor.id);
    setVendorName(vendor.name);
    setVendorPickerOpen(false);
  };

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        itemId: "",
        itemName: "",
        sku: "",
        unit: "",
        storeId: "",
        storeName: "",
        quantity: 1,
        unitPriceAmount: 0,
        unitPriceCurrency: "USD",
      },
    ]);
  };

  const removeLine = (lineId: string) => {
    setLines((prev) => prev.filter((l) => l.id !== lineId));
  };

  const updateLine = (
    lineId: string,
    field: keyof LineFormEntry,
    value: any,
  ) => {
    setLines((prev) =>
      prev.map((l) => (l.id === lineId ? { ...l, [field]: value } : l)),
    );
  };

  const handleItemSelectedForLine = (lineId: string, item: any) => {
    updateLine(lineId, "itemId", item.id);
    updateLine(lineId, "itemName", item.name);
    updateLine(lineId, "sku", item.sku);
    updateLine(lineId, "unit", item.unit || "");
    setItemPickerForLine(null);
  };

  const handleStoreSelectedForLine = (
    lineId: string,
    storeId: string,
    storeName: string,
  ) => {
    updateLine(lineId, "storeId", storeId);
    updateLine(lineId, "storeName", storeName);
    setStorePickerForLine(null);
  };

  const handleSubmit = useCallback(() => {
    const payload: CreatePurchaseOrderRequest = {
      vendorId,
      orderDate: new Date(orderDate).toISOString(),
      lines: lines.map((l) => ({
        itemId: l.itemId,
        storeId: l.storeId,
        quantity: l.quantity,
        unitSymbol: l.unit,
        unitPriceAmount: l.unitPriceAmount,
        unitPriceCurrency: l.unitPriceCurrency,
      })),
    };
    const { issues } = validateCreatePurchaseOrder(payload);
    if (issues.length > 0) {
      notifications.show(issues.map((i) => i.message).join("\n"), {
        severity: "error",
      });
      return;
    }
    createMutation.mutate(payload, {
      onSuccess: () => {
        notifications.show("Purchase order created.", { severity: "success" });
        navigate("/purchase-orders");
      },
      onError: (err) =>
        notifications.show(`Failed: ${(err as Error).message}`, {
          severity: "error",
        }),
    });
  }, [vendorId, orderDate, lines, createMutation, navigate, notifications]);

  const handleCancel = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/purchase-orders");
    }
  };

  return (
    <PageContainer
      title="New Purchase Order"
      breadcrumbs={[
        { title: "Purchase Orders", path: "/purchase-orders" },
        { title: "New" },
      ]}
    >
      <Box component="form" noValidate sx={{ maxWidth: 1000, mx: "auto" }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold" }}
                gutterBottom
              >
                Order Details
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel shrink>Vendor</InputLabel>
                    <OutlinedInput
                      value={vendorName}
                      readOnly
                      notched
                      label="Vendor"
                      endAdornment={
                        <InputAdornment position="end">
                          <Button
                            onClick={() => setVendorPickerOpen(true)}
                            size="small"
                            sx={{ minWidth: "auto", px: 1 }}
                          >
                            Select
                          </Button>
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Order Date"
                    type="date"
                    fullWidth
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </Paper>

        {/* Lines Section – Redesigned and MUI v6 compliant */}
        <Paper sx={{ p: 3 }}>
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Purchase Order Lines
            </Typography>
            <Button startIcon={<AddIcon />} onClick={addLine}>
              Add Line
            </Button>
          </Stack>

          {lines.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
              No lines added yet. Click “Add Line” to begin.
            </Typography>
          )}

          {lines.map((line, index) => {
            const lineTotal = line.quantity * line.unitPriceAmount;

            return (
              <Card
                key={line.id}
                variant="outlined"
                sx={{
                  mb: 2,
                  backgroundColor: "grey.50",
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: 2 },
                }}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  {/* Header with line number and delete button */}
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1.5,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      {`Line ${index + 1}`}
                    </Typography>
                    <IconButton
                      onClick={() => removeLine(line.id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>

                  <Grid container spacing={2} sx={{ alignItems: "center" }}>
                    {/* Item Picker */}
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Item</InputLabel>
                        <OutlinedInput
                          value={
                            line.itemId ? `${line.itemName} (${line.sku})` : ""
                          }
                          readOnly
                          label="Item"
                          endAdornment={
                            <InputAdornment position="end">
                              <Button
                                onClick={() => setItemPickerForLine(line.id)}
                                size="small"
                                sx={{ minWidth: "auto", px: 1 }}
                              >
                                Select
                              </Button>
                            </InputAdornment>
                          }
                        />
                      </FormControl>
                    </Grid>

                    {/* Store Picker */}
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Store</InputLabel>
                        <OutlinedInput
                          value={line.storeId ? line.storeName : ""}
                          readOnly
                          label="Store"
                          endAdornment={
                            <InputAdornment position="end">
                              <Button
                                onClick={() => setStorePickerForLine(line.id)}
                                size="small"
                                sx={{ minWidth: "auto", px: 1 }}
                              >
                                Select
                              </Button>
                            </InputAdornment>
                          }
                        />
                      </FormControl>
                    </Grid>

                    {/* Quantity */}
                    <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                      <TextField
                        label="Qty"
                        type="number"
                        size="small"
                        value={line.quantity}
                        onChange={(e) =>
                          updateLine(
                            line.id,
                            "quantity",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        fullWidth
                        slotProps={{ htmlInput: { min: 1 } }}
                      />
                    </Grid>

                    {/* Unit (disabled) */}
                    <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                      <TextField
                        label="Unit"
                        size="small"
                        value={line.unit}
                        fullWidth
                        disabled
                      />
                    </Grid>

                    {/* Unit Price */}
                    <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                      <TextField
                        label="Unit Price"
                        type="number"
                        size="small"
                        value={line.unitPriceAmount}
                        onChange={(e) =>
                          updateLine(
                            line.id,
                            "unitPriceAmount",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        fullWidth
                        slotProps={{
                          htmlInput: { min: 0 },
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">
                                <Typography variant="body2">
                                  {line.unitPriceCurrency}
                                </Typography>
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </Grid>

                    {/* Currency */}
                    <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                      <TextField
                        label="Currency"
                        select
                        size="small"
                        value={line.unitPriceCurrency}
                        onChange={(e) =>
                          updateLine(
                            line.id,
                            "unitPriceCurrency",
                            e.target.value,
                          )
                        }
                        fullWidth
                      >
                        {CURRENCY_OPTIONS.map((c) => (
                          <MenuItem key={c} value={c}>
                            {c}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {/* Line Total – bold Typography with sx */}
                    <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          height: "100%",
                          pl: 1,
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: "bold" }}
                          noWrap
                        >
                          {line.quantity > 0 && line.unitPriceAmount > 0
                            ? `${lineTotal.toFixed(2)} ${line.unitPriceCurrency}`
                            : "—"}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            );
          })}
        </Paper>

        {/* Action Buttons */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 3, justifyContent: "flex-end" }}
        >
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
          <Can requiredPermissions={[Permissions.PurchaseOrders.Create]}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Order"}
            </Button>
          </Can>
        </Stack>
      </Box>

      {/* Dialogs */}
      <VendorPickerDialog
        open={vendorPickerOpen}
        onClose={() => setVendorPickerOpen(false)}
        onSelect={handleVendorSelected}
      />

      {lines.map((line) => (
        <MaterialItemPickerDialog
          key={`item-picker-${line.id}`}
          open={itemPickerForLine === line.id}
          onClose={() => setItemPickerForLine(null)}
          onSelect={(item) => handleItemSelectedForLine(line.id, item)}
          storeId={line.storeId || undefined}
          aggregateAcrossStores={!line.storeId}
        />
      ))}

      {lines.map((line) => {
        if (storePickerForLine !== line.id) return null;

        if (line.itemId) {
          return (
            <StorePickerForItemDialog
              key={`store-picker-${line.id}`}
              open={true}
              itemId={line.itemId}
              onSelect={(storeId, storeName) =>
                handleStoreSelectedForLine(line.id, storeId, storeName)
              }
              onClose={() => setStorePickerForLine(null)}
            />
          );
        }

        return (
          <MaterialStorePickerDialog
            key={`store-picker-${line.id}`}
            open={true}
            onClose={() => setStorePickerForLine(null)}
            onSelect={(store) =>
              handleStoreSelectedForLine(line.id, store.id, store.name)
            }
          />
        );
      })}
    </PageContainer>
  );
}

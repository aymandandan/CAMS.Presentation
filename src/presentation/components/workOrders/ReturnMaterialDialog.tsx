import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { useReturnMaterials } from "@/application/hooks/workOrders/useWorkOrders";
import { MaterialIssuanceDto } from "@/domain/workOrders/WorkOrderTypes";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";

interface Props {
  open: boolean;
  onClose: () => void;
  workOrderId: string;
  materials: MaterialIssuanceDto[];
}

interface ReturnItemEntry {
  materialIssuanceId: string;
  quantity: number;
}

export default function ReturnMaterialDialog({
  open,
  onClose,
  workOrderId,
  materials,
}: Props) {
  const [entries, setEntries] = useState<ReturnItemEntry[]>([]);
  const mutation = useReturnMaterials();
  const notifications = useNotifications();

  // Reset entries when dialog opens
  React.useEffect(() => {
    if (open) {
      setEntries(
        materials.map((m) => ({
          materialIssuanceId: m.id,
          quantity: 0,
        })),
      );
    }
  }, [open, materials]);

  const handleQuantityChange = (id: string, value: number) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.materialIssuanceId === id ? { ...e, quantity: value } : e,
      ),
    );
  };

  const itemsToReturn = useMemo(
    () => entries.filter((e) => e.quantity > 0),
    [entries],
  );

  const totalItems = itemsToReturn.length;
  const totalQuantity = itemsToReturn.reduce((sum, e) => sum + e.quantity, 0);
  const isFormValid = totalItems > 0;

  const handleSubmit = () => {
    // Client-side validation: ensure no quantity exceeds remaining
    const invalid = entries.find((entry) => {
      const mat = materials.find((m) => m.id === entry.materialIssuanceId);
      return mat && entry.quantity > mat.quantity - mat.returnedQuantity;
    });
    if (invalid) {
      notifications.show(
        "Some return quantities exceed the remaining amount.",
        {
          severity: "error",
          autoHideDuration: 3000,
        },
      );
      return;
    }
    if (!isFormValid) {
      notifications.show("No quantity entered for return.", {
        severity: "warning",
        autoHideDuration: 3000,
      });
      return;
    }

    mutation.mutate(
      {
        id: workOrderId,
        data: {
          workOrderId,
          items: itemsToReturn.map(({ materialIssuanceId, quantity }) => ({
            materialIssuanceId,
            returnedQuantity: quantity,
          })),
        },
      },
      {
        onSuccess: () => {
          notifications.show("Materials returned successfully.", {
            severity: "success",
            autoHideDuration: 3000,
          });
          onClose();
        },
        onError: (err) => {
          notifications.show(
            `Failed to return materials: ${(err as Error).message}`,
            { severity: "error", autoHideDuration: 4000 },
          );
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Return Materials</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Specify the quantity to return for each material. You can only return
          up to the remaining (issued - already returned) quantity.
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Material</TableCell>
                <TableCell align="center">Issued</TableCell>
                <TableCell align="center">Returned</TableCell>
                <TableCell align="center">Remaining</TableCell>
                <TableCell align="center">Return Qty</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materials.map((mat) => {
                const remaining = mat.quantity - mat.returnedQuantity;
                const entry = entries.find(
                  (e) => e.materialIssuanceId === mat.id,
                );
                const currentQty = entry?.quantity ?? 0;

                return (
                  <TableRow key={mat.id}>
                    <TableCell>
                      {mat.itemName || `Item ${mat.itemId}`}
                      {mat.isReturned && (
                        <Typography variant="caption" color="success.main">
                          {" "}
                          (fully returned)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {mat.quantity} {mat.quantityUnit || "units"}
                    </TableCell>
                    <TableCell align="center">
                      {mat.returnedQuantity} {mat.quantityUnit || "units"}
                    </TableCell>
                    <TableCell align="center">
                      {remaining} {mat.quantityUnit || "units"}
                    </TableCell>
                    <TableCell align="center" sx={{ width: 120 }}>
                      <TextField
                        type="number"
                        size="small"
                        value={currentQty}
                        onChange={(e) =>
                          handleQuantityChange(
                            mat.id,
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        slotProps={{
                          htmlInput: {
                            min: 0,
                            max: remaining,
                            step: 0.1,
                          },
                        }}
                        disabled={remaining <= 0}
                        error={currentQty > remaining}
                        helperText={
                          currentQty > remaining
                            ? "Exceeds remaining"
                            : undefined
                        }
                        sx={{ width: "100%" }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {isFormValid && (
          <Paper
            variant="outlined"
            sx={{
              mt: 2,
              p: 1.5,
              bgcolor: "grey.700",
              borderColor: "grey.600",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Returning {totalQuantity} units across {totalItems} item(s).
            </Typography>
          </Paper>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isFormValid || mutation.isPending}
        >
          Confirm Return
        </Button>
      </DialogActions>
    </Dialog>
  );
}

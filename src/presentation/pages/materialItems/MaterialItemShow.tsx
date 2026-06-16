import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import PageContainer from "@/presentation/components/PageContainer";
import {
  useMaterialItemById,
  useDeleteMaterialItem,
} from "@/application/hooks/materialItems/useMaterialItems";
import { useDialogs } from "@/application/hooks/useDialogs/useDialogs";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import AdjustStockDialog from "@/presentation/components/materialItems/AdjustStockDialog";
import ReleaseReservationDialog from "@/presentation/components/materialItems/ReleaseReservationDialog";
import ReserveStockDialog from "@/presentation/components/materialItems/ReserveStockDialog";
import TransferStockDialog from "@/presentation/components/materialItems/TransferStockDialog";

export default function MaterialItemShow() {
  const { materialItemId } = useParams<{ materialItemId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const {
    data: item,
    isLoading,
    isError,
    error,
  } = useMaterialItemById(materialItemId!);
  const deleteMutation = useDeleteMaterialItem();

  // State for dialogs & store selection – hooks must stay at top level
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [reserveOpen, setReserveOpen] = useState(false);
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  // Initialize selected store to the first one (if any)
  useEffect(() => {
    if (item?.stockLevels?.length && !selectedStoreId) {
      setSelectedStoreId(item.stockLevels[0].storeId);
    }
  }, [item, selectedStoreId]);

  const goBack = useCallback(() => {
    const from = location.state?.from;

    const isEditOrCreatePage = (path: string): boolean => {
      return (
        /\/material-items\/create$/.test(path) ||
        /\/material-items\/.+\/edit$/.test(path)
      );
    };

    if (from && typeof from === "string" && !isEditOrCreatePage(from)) {
      navigate(from);
    } else {
      navigate("/material-items");
    }
  }, [navigate, location.state]);

  const handleEdit = useCallback(() => {
    navigate(`/material-items/${materialItemId}/edit`);
  }, [navigate, materialItemId]);

  const handleDelete = useCallback(async () => {
    if (!item) return;
    const confirmed = await dialogs.confirm(
      `Delete "${item.name}" (${item.sku})?`,
      {
        title: "Delete material item?",
        severity: "error",
        okText: "Delete",
      },
    );
    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(item.id);
        notifications.show("Material item deleted.", { severity: "success" });
        navigate("/material-items");
      } catch (err: any) {
        notifications.show(`Delete failed: ${err.message}`, {
          severity: "error",
        });
      }
    }
  }, [item, dialogs, deleteMutation, notifications, navigate]);

  const handleStockTransactions = useCallback(() => {
    if (!item) return;
    navigate(
      `/stock-transactions?itemId=${item.id}&itemName=${encodeURIComponent(item.name)}`,
    );
  }, [item, navigate]);

  // Derived data
  const stockLevels = useMemo(() => item?.stockLevels ?? [], [item]);
  const selectedStock = useMemo(
    () => stockLevels.find((s) => s.storeId === selectedStoreId),
    [stockLevels, selectedStoreId],
  );

  // Guard rendering after all hooks
  if (isLoading) {
    return (
      <PageContainer title="Loading...">
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (isError || !item) {
    return (
      <PageContainer title="Error">
        <Alert severity="error">
          {(error as Error)?.message || "Material item not found"}
        </Alert>
      </PageContainer>
    );
  }

  const hasSpecifications =
    item.specifications && Object.keys(item.specifications).length > 0;

  return (
    <PageContainer
      title={`${item.name} (${item.sku})`}
      breadcrumbs={[
        { title: "Material Items", path: "/material-items" },
        { title: item.name },
      ]}
    >
      {/* Top action bar */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 3, justifyContent: "space-between", flexWrap: "wrap" }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={goBack}
        >
          Back
        </Button>
        <Stack direction="row" spacing={2}>
          <Can requiredPermissions={[Permissions.MaterialItems.Update]}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit
            </Button>
          </Can>
          <Button
            variant="outlined"
            startIcon={<ReceiptIcon />}
            onClick={handleStockTransactions}
          >
            Stock Transactions
          </Button>
        </Stack>
      </Stack>

      {/* Main item details card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={<InventoryIcon color="primary" />}
          title={
            <Typography variant="h5" component="span" sx={{ fontWeight: 600 }}>
              {item.name}
            </Typography>
          }
          action={
            <Chip
              label={item.sku}
              color="primary"
              variant="outlined"
              size="medium"
            />
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="overline" color="textSecondary">
                Unit Cost
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {item.unitCost} {item.currency}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="overline" color="textSecondary">
                Reorder Level
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {item.reorderLevel} {item.unit}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="overline" color="textSecondary">
                Stockable
              </Typography>
              <Chip
                label={item.isStockable ? "Yes" : "No"}
                color={item.isStockable ? "success" : "default"}
                size="small"
              />
            </Grid>
            {item.description && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="overline" color="textSecondary">
                  Description
                </Typography>
                <Typography variant="body1">{item.description}</Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Specifications card */}
      {hasSpecifications && (
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Specifications" />
          <CardContent>
            <Grid container spacing={1}>
              {Object.entries(item.specifications!).map(([key, val]) => (
                <Grid size={{ xs: 12, sm: 6 }} key={key}>
                  <Typography variant="overline" color="textSecondary">
                    {key}
                  </Typography>
                  <Typography variant="body2">{val}</Typography>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Stock Levels card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Stock Levels" />
        <CardContent>
          {stockLevels.length === 0 ? (
            <Typography color="text.secondary">
              No stock levels available.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {stockLevels.length > 1 && (
                <FormControl size="small" sx={{ minWidth: 200, mb: 1 }}>
                  <InputLabel>Store for operations</InputLabel>
                  <Select
                    value={selectedStoreId}
                    label="Store for operations"
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                  >
                    {stockLevels.map((s) => (
                      <MenuItem key={s.storeId} value={s.storeId}>
                        {s.storeName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Single store summary (or first store if only one) */}
              {selectedStock ? (
                <Box
                  sx={{ bgcolor: "background.paper", p: 2, borderRadius: 1 }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: "center" }}
                  >
                    <InventoryIcon color="action" fontSize="small" />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                        {selectedStock.storeName} ({selectedStock.storeCode})
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        On Hand: {selectedStock.onHand} | Reserved:{" "}
                        {selectedStock.reserved} | Available:{" "}
                        {selectedStock.available} {selectedStock.unit}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ) : null}

              {/* Quick stock actions */}
              <Can
                requiredPermissions={[Permissions.MaterialItems.ManageStock]}
              >
                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<LockIcon />}
                    onClick={() => setReserveOpen(true)}
                    disabled={!selectedStoreId}
                    size="small"
                  >
                    Reserve
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<LockOpenIcon />}
                    onClick={() => setReleaseOpen(true)}
                    disabled={
                      !selectedStoreId ||
                      !selectedStock ||
                      selectedStock.reserved <= 0
                    }
                    size="small"
                  >
                    Release
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<AddCircleIcon />}
                    onClick={() => setAdjustOpen(true)}
                    disabled={!selectedStoreId}
                    size="small"
                  >
                    Adjust
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<SwapHorizIcon />}
                    onClick={() => setTransferOpen(true)}
                    disabled={!selectedStoreId}
                    size="small"
                  >
                    Transfer
                  </Button>
                </Stack>
              </Can>
            </Stack>
          )}
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* Bottom action bar */}
      <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
        <Can requiredPermissions={[Permissions.MaterialItems.Delete]}>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            Delete
          </Button>
        </Can>
      </Stack>

      {/* Dialogs */}
      <ReserveStockDialog
        open={reserveOpen}
        materialItemId={item.id}
        materialName={item.name}
        availableQuantity={selectedStock?.available ?? 0}
        unit={item.unit}
        storeId={selectedStoreId}
        onClose={() => setReserveOpen(false)}
      />
      <ReleaseReservationDialog
        open={releaseOpen}
        materialItemId={item.id}
        materialName={item.name}
        reservedQuantity={selectedStock?.reserved ?? 0}
        unit={item.unit}
        storeId={selectedStoreId}
        onClose={() => setReleaseOpen(false)}
      />
      <AdjustStockDialog
        open={adjustOpen}
        materialItemId={item.id}
        materialName={item.name}
        currentOnHand={selectedStock?.onHand ?? 0}
        unit={item.unit}
        storeId={selectedStoreId}
        onClose={() => setAdjustOpen(false)}
      />
      <TransferStockDialog
        open={transferOpen}
        materialItemId={item.id}
        sourceName={item.name}
        availableQuantity={selectedStock?.available ?? 0}
        unit={item.unit}
        sourceStoreId={selectedStoreId}
        onClose={() => setTransferOpen(false)}
      />
    </PageContainer>
  );
}

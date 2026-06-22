// PurchaseOrderShow.tsx
import { useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StoreIcon from "@mui/icons-material/Store";
import InventoryIcon from "@mui/icons-material/Inventory";
import BusinessIcon from "@mui/icons-material/Business";
import EventIcon from "@mui/icons-material/Event";
import ReceiptIcon from "@mui/icons-material/Receipt";
import EditIcon from "@mui/icons-material/Edit";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useDialogs } from "@/application/hooks/useDialogs/useDialogs";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import {
  usePurchaseOrder,
  useReceivePurchaseOrder,
  useCancelPurchaseOrder,
} from "@/application/hooks/purchaseOrders/usePurchaseOrders";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import PageContainer from "@/presentation/components/PageContainer";
import PurchaseOrderStatusChip from "@/presentation/components/purchaseOrders/PurchaseOrderStatusChip";
import dayjs from "dayjs";

export default function PurchaseOrderShow() {
  const { purchaseOrderId } = useParams<{ purchaseOrderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = usePurchaseOrder(purchaseOrderId!);
  const receiveMutation = useReceivePurchaseOrder();
  const cancelMutation = useCancelPurchaseOrder();

  const goBack = useCallback(() => {
    const from = location.state?.from;

    const isEditOrCreatePage = (path: string): boolean => {
      return (
        /\/purchase-orders\/create$/.test(path) ||
        /\/purchase-orders\/.+\/edit$/.test(path)
      );
    };

    if (from && typeof from === "string" && !isEditOrCreatePage(from)) {
      navigate(from);
    } else {
      navigate("/purchase-orders");
    }
  }, [navigate, location.state]);

  const handleReceive = useCallback(async () => {
    if (!order) return;
    const confirmed = await dialogs.confirm(
      "Mark this order as received? This will increase inventory.",
      { title: "Confirm Receive", severity: "info", okText: "Receive" },
    );
    if (!confirmed) return;
    receiveMutation.mutate(purchaseOrderId!, {
      onSuccess: () => {
        notifications.show("Order received.", { severity: "success" });
        refetch();
      },
      onError: (err) =>
        notifications.show(`Failed: ${(err as Error).message}`, {
          severity: "error",
        }),
    });
  }, [
    order,
    receiveMutation,
    dialogs,
    notifications,
    refetch,
    purchaseOrderId,
  ]);

  const handleCancel = useCallback(async () => {
    if (!order) return;
    const confirmed = await dialogs.confirm("Cancel this draft order?", {
      title: "Confirm Cancel",
      severity: "error",
      okText: "Cancel Order",
    });
    if (!confirmed) return;
    cancelMutation.mutate(purchaseOrderId!, {
      onSuccess: () => {
        notifications.show("Order cancelled.", { severity: "success" });
        refetch();
      },
      onError: (err) =>
        notifications.show(`Failed: ${(err as Error).message}`, {
          severity: "error",
        }),
    });
  }, [order, cancelMutation, dialogs, notifications, refetch, purchaseOrderId]);

  const isDraft = order?.status === "Draft";

  // Derived data
  const totalAmountDisplay = useMemo(() => {
    if (!order) return "";
    return `${order.totalAmount} ${order.currency}`;
  }, [order]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !order) {
    return (
      <Alert severity="error">
        {(error as Error)?.message || "Purchase order not found"}
      </Alert>
    );
  }

  return (
    <PageContainer
      title={
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Typography variant="h5" component="span">
            PO {order.id.slice(0, 8)}
          </Typography>
          <PurchaseOrderStatusChip status={order.status} />
        </Stack>
      }
      breadcrumbs={[
        { title: "Purchase Orders", path: "/purchase-orders" },
        { title: `Order ${order.id.slice(0, 8)}` },
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
          {/* Existing Vendor button */}
          <Can requiredPermissions={[Permissions.Vendors.View]}>
            <Button
              variant="outlined"
              startIcon={<BusinessIcon />}
              onClick={() => navigate(`/vendors/${order.vendorId}`)}
            >
              Vendor
            </Button>
          </Can>

          {/* ★ New Edit button (Draft only) */}
          <Can requiredPermissions={[Permissions.PurchaseOrders.Update]}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              disabled={!isDraft}
              onClick={() => navigate(`/purchase-orders/${order.id}/edit`)}
            >
              Edit
            </Button>
          </Can>
        </Stack>
      </Stack>

      {/* Main details card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={<ReceiptIcon color="primary" />}
          title="Order Details"
          action={<PurchaseOrderStatusChip status={order.status} />}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <BusinessIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="overline" color="textSecondary">
                    Vendor
                  </Typography>
                  <Typography variant="body1">{order.vendorName}</Typography>
                  {order.vendorEmail && (
                    <Typography variant="caption" color="textSecondary">
                      {order.vendorEmail}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <EventIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="overline" color="textSecondary">
                    Order Date
                  </Typography>
                  <Typography variant="body1">
                    {dayjs(order.orderDate).format("MMM D, YYYY")}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            {order.receivedAt && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <LocalShippingIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="overline" color="textSecondary">
                      Received At
                    </Typography>
                    <Typography variant="body1">
                      {dayjs(order.receivedAt).format("MMM D, YYYY h:mm A")}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            )}
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <ReceiptIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="overline" color="textSecondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {totalAmountDisplay}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
        {/* Draft actions */}
        {isDraft && (
          <CardContent sx={{ pt: 0 }}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={handleReceive}
                disabled={receiveMutation.isPending}
              >
                Receive Order
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
              >
                Cancel Order
              </Button>
            </Stack>
          </CardContent>
        )}
      </Card>

      {/* Order Lines */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Order Lines"
          subheader={`${order.lines.length} line item(s)`}
        />
        <CardContent sx={{ pt: 0 }}>
          {order.lines.length === 0 ? (
            <Typography color="text.secondary">No lines</Typography>
          ) : (
            <List disablePadding>
              {order.lines.map((line, idx) => (
                <ListItem
                  key={idx}
                  divider
                  sx={{ flexWrap: "wrap", py: 2 }}
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <Can
                        requiredPermissions={[Permissions.MaterialItems.View]}
                      >
                        <IconButton
                          onClick={() =>
                            navigate(`/material-items/${line.itemId}`)
                          }
                          size="small"
                          title="View Item"
                        >
                          <InventoryIcon fontSize="small" />
                        </IconButton>
                      </Can>
                      <Can
                        requiredPermissions={[Permissions.MaterialStores.View]}
                      >
                        <IconButton
                          onClick={() =>
                            navigate(`/material-stores/${line.storeId}`)
                          }
                          size="small"
                          title="View Store"
                        >
                          <StoreIcon fontSize="small" />
                        </IconButton>
                      </Can>
                    </Stack>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <InventoryIcon color="action" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 500 }}
                        component="div"
                      >
                        {line.itemName} ({line.sku})
                      </Typography>
                    }
                    slotProps={{
                      secondary: { component: "div" },
                    }}
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          component="div"
                        >
                          Store: {line.storeName} · Qty: {line.quantity}{" "}
                          {line.unit} · Unit Price: {line.unitPrice}{" "}
                          {line.currency}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500 }}
                          color="text.primary"
                          component="div"
                        >
                          Line Total: {line.lineTotal} {line.currency}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

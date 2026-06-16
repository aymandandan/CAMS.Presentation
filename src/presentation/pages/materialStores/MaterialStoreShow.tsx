import { useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InventoryIcon from "@mui/icons-material/Inventory";
import ReceiptIcon from "@mui/icons-material/Receipt";
import StoreIcon from "@mui/icons-material/Store";
import { useDialogs } from "@/application/hooks/useDialogs/useDialogs";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import { Permissions } from "@/domain/shared/Permissions";
import PageContainer from "@/presentation/components/PageContainer";
import { Can } from "@/presentation/components/Can";
import {
  useDeleteMaterialStoreMutation,
  useMaterialStoreQuery,
} from "@/application/hooks/materialStores/useMaterialStores";

export default function MaterialStoreShow() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const {
    data: store,
    isLoading,
    isError,
    error,
  } = useMaterialStoreQuery(storeId ?? null);
  const deleteMutation = useDeleteMaterialStoreMutation();

  const goBack = useCallback(() => {
    const from = location.state?.from;

    const isEditOrCreatePage = (path: string): boolean => {
      return (
        /\/material-stores\/create$/.test(path) ||
        /\/material-stores\/.+\/edit$/.test(path)
      );
    };

    if (from && typeof from === "string" && !isEditOrCreatePage(from)) {
      navigate(from);
    } else {
      navigate("/material-stores");
    }
  }, [navigate, location.state]);

  const handleEdit = useCallback(() => {
    navigate(`/material-stores/${storeId}/edit`);
  }, [navigate, storeId]);

  const handleDelete = useCallback(async () => {
    if (!store) return;
    const confirmed = await dialogs.confirm(`Delete store "${store.name}"?`, {
      title: "Delete material store?",
      severity: "error",
      okText: "Delete",
    });
    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(store.id);
        notifications.show("Material store deleted.", { severity: "success" });
        navigate("/material-stores");
      } catch (err: any) {
        notifications.show(`Failed: ${err.message}`, { severity: "error" });
      }
    }
  }, [store, dialogs, deleteMutation, notifications, navigate]);

  const handleViewItems = useCallback(() => {
    navigate(`/material-items?storeId=${store!.id}`);
  }, [navigate, store]);

  const handleViewTransactions = useCallback(() => {
    navigate(`/stock-transactions?storeId=${store!.id}`);
  }, [navigate, store]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !store) {
    return (
      <Alert severity="error">
        {(error as Error)?.message || "Material store not found"}
      </Alert>
    );
  }

  return (
    <PageContainer
      title={`Material Store ${store.code}`}
      breadcrumbs={[
        { title: "Material Stores", path: "/material-stores" },
        { title: store.code },
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
          <Can requiredPermissions={[Permissions.MaterialStores.Edit]}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              Edit
            </Button>
          </Can>
          <Can requiredPermissions={[Permissions.MaterialItems.View]}>
            <Button
              variant="outlined"
              startIcon={<InventoryIcon />}
              onClick={handleViewItems}
            >
              Items
            </Button>
          </Can>
          <Can requiredPermissions={[Permissions.StockTransactions.Read]}>
            <Button
              variant="outlined"
              startIcon={<ReceiptIcon />}
              onClick={handleViewTransactions}
            >
              Transactions
            </Button>
          </Can>
        </Stack>
      </Stack>

      {/* Main store card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={<StoreIcon color="primary" />}
          title={
            <Typography variant="h5" component="span">
              {store.code} – {store.name}
            </Typography>
          }
        />
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="overline" color="textSecondary">
                Address
              </Typography>
              <Typography variant="body1">{store.address || "—"}</Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* Bottom action bar */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ justifyContent: "flex-end", flexWrap: "wrap" }}
      >
        <Can requiredPermissions={[Permissions.MaterialStores.Delete]}>
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
    </PageContainer>
  );
}

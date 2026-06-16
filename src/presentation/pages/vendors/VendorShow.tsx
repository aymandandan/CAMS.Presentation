import { useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
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
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BusinessIcon from "@mui/icons-material/Business";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import PageContainer from "@/presentation/components/PageContainer";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import { useDialogs } from "@/application/hooks/useDialogs/useDialogs";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import {
  useDeleteVendor,
  useVendor,
} from "@/application/hooks/vendors/useVendors";

export default function VendorShow() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const { data: vendor, isLoading, isError, error } = useVendor(vendorId);
  const deleteMutation = useDeleteVendor();

  const goBack = useCallback(() => {
    const from = location.state?.from;

    const isEditOrCreatePage = (path: string): boolean => {
      return (
        /\/vendors\/create$/.test(path) || /\/vendors\/.+\/edit$/.test(path)
      );
    };

    if (from && typeof from === "string" && !isEditOrCreatePage(from)) {
      navigate(from);
    } else {
      navigate("/vendors");
    }
  }, [navigate]);

  const handleEdit = useCallback(() => {
    navigate(`/vendors/${vendorId}/edit`);
  }, [navigate, vendorId]);

  const handleDelete = useCallback(async () => {
    if (!vendor) return;
    const confirmed = await dialogs.confirm(`Delete vendor "${vendor.name}"?`, {
      title: "Delete vendor?",
      severity: "error",
      okText: "Delete",
    });
    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(vendor.id);
        notifications.show("Vendor deleted successfully.", {
          severity: "success",
        });
        navigate("/vendors");
      } catch (err: any) {
        notifications.show(`Failed: ${err.message}`, { severity: "error" });
      }
    }
  }, [vendor, dialogs, deleteMutation, notifications, navigate]);

  const handleViewPurchaseOrders = useCallback(() => {
    navigate(`/purchase-orders?vendorId=${vendor!.id}`);
  }, [navigate, vendor]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !vendor) {
    return (
      <Alert severity="error">
        {(error as Error)?.message || "Vendor not found"}
      </Alert>
    );
  }

  return (
    <PageContainer
      title={`Vendor ${vendor.name}`}
      breadcrumbs={[
        { title: "Vendors", path: "/vendors" },
        { title: vendor.name },
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
          <Can requiredPermissions={[Permissions.Vendors.Edit]}>
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
            startIcon={<ShoppingCartIcon />}
            onClick={handleViewPurchaseOrders}
          >
            Purchase Orders
          </Button>
        </Stack>
      </Stack>

      {/* Main vendor card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={<BusinessIcon color="primary" />}
          title={
            <Typography variant="h5" component="span">
              {vendor.name}
            </Typography>
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <EmailIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="overline" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{vendor.email || "—"}</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <PhoneIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="overline" color="textSecondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">{vendor.phone || "—"}</Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* Bottom action bar */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ justifyContent: "flex-end", flexWrap: "wrap" }}
      >
        <Can requiredPermissions={[Permissions.Vendors.Delete]}>
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

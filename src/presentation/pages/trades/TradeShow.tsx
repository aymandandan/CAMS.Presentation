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
import BuildIcon from "@mui/icons-material/Build";
import HandymanIcon from "@mui/icons-material/Handyman";
import PageContainer from "@/presentation/components/PageContainer";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import { useDialogs } from "@/application/hooks/useDialogs/useDialogs";
import useNotifications from "@/application/hooks/useNotifications/useNotifications";
import {
  useTradeQuery,
  useDeleteTradeMutation,
} from "@/application/hooks/trades/useTrades";

export default function TradeShow() {
  const { tradeId } = useParams<{ tradeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dialogs = useDialogs();
  const notifications = useNotifications();

  const { data: trade, isLoading, isError, error } = useTradeQuery(tradeId!);
  const deleteMutation = useDeleteTradeMutation();

  const goBack = useCallback(() => {
    const from = location.state?.from;

    const isEditOrCreatePage = (path: string): boolean => {
      return /\/trades\/create$/.test(path) || /\/trades\/.+\/edit$/.test(path);
    };

    if (from && typeof from === "string" && !isEditOrCreatePage(from)) {
      navigate(from);
    } else {
      navigate("/trades");
    }
  }, [navigate, location.state]);

  const handleEdit = useCallback(() => {
    navigate(`/trades/${tradeId}/edit`);
  }, [navigate, tradeId]);

  const handleDelete = useCallback(async () => {
    if (!trade) return;
    const confirmed = await dialogs.confirm(`Delete trade "${trade.name}"?`, {
      title: "Delete trade?",
      severity: "error",
      okText: "Delete",
    });
    if (confirmed) {
      try {
        await deleteMutation.mutateAsync(trade.id);
        notifications.show("Trade deleted successfully.", {
          severity: "success",
        });
        navigate("/trades");
      } catch (err: any) {
        notifications.show(`Failed: ${err.message}`, { severity: "error" });
      }
    }
  }, [trade, dialogs, deleteMutation, notifications, navigate]);

  const handleViewEquipment = useCallback(() => {
    navigate(`/equipment?tradeId=${trade!.id}`);
  }, [navigate, trade]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !trade) {
    return (
      <Alert severity="error">
        {(error as Error)?.message || "Trade not found"}
      </Alert>
    );
  }

  return (
    <PageContainer
      title={`Trade ${trade.code}`}
      breadcrumbs={[
        { title: "Trades", path: "/trades" },
        { title: trade.code },
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
          <Can requiredPermissions={[Permissions.Trades.Update]}>
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
            startIcon={<BuildIcon />}
            onClick={handleViewEquipment}
          >
            Equipment
          </Button>
        </Stack>
      </Stack>

      {/* Main trade card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={<HandymanIcon color="primary" />}
          title={
            <Typography variant="h5" component="span">
              {trade.code} – {trade.name}
            </Typography>
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="overline" color="textSecondary">
                Description
              </Typography>
              <Typography variant="body1">
                {trade.description || "—"}
              </Typography>
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
        <Can requiredPermissions={[Permissions.Trades.Delete]}>
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

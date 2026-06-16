import { useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InventoryIcon from "@mui/icons-material/Inventory";
import StoreIcon from "@mui/icons-material/Store";
import EventIcon from "@mui/icons-material/Event";
import LabelIcon from "@mui/icons-material/Label";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import NotesIcon from "@mui/icons-material/Notes";
import LinkIcon from "@mui/icons-material/Link";
import PageContainer from "@/presentation/components/PageContainer";
import { useStockTransaction } from "@/application/hooks/stockTransactions/useStockTransactions";
import dayjs from "dayjs";

export default function StockTransactionShow() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    data: transaction,
    isLoading,
    isError,
    error,
  } = useStockTransaction(transactionId!);

  const goBack = useCallback(() => {
    const from = location.state?.from;

    const isEditOrCreatePage = (path: string): boolean => {
      return (
        /\/stock-transactions\/create$/.test(path) ||
        /\/stock-transactions\/.+\/edit$/.test(path)
      );
    };

    if (from && typeof from === "string" && !isEditOrCreatePage(from)) {
      navigate(from);
    } else {
      navigate("/stock-transactions");
    }
  }, [navigate, location.state]);

  const itemLink = useMemo(() => {
    if (transaction) return `/material-items/${transaction.itemId}`;
    return "#";
  }, [transaction]);

  const storeLink = useMemo(() => {
    if (transaction) return `/material-stores/${transaction.storeId}`;
    return "#";
  }, [transaction]);

  const referenceLink = useMemo(() => {
    if (!transaction?.referenceId) return null;
    // If the API provides a referenceType, use it; otherwise fallback to plain text
    const refType = transaction.referenceName;
    if (refType?.toLowerCase() === "workorder")
      return `/work-orders/${transaction.referenceId}`;
    if (refType?.toLowerCase() === "materialstore")
      return `/material-stores/${transaction.referenceId}`;
    return null;
  }, [transaction]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !transaction) {
    return (
      <Alert severity="error">
        {(error as Error)?.message || "Transaction not found"}
      </Alert>
    );
  }

  return (
    <PageContainer
      title={`Transaction ${transaction.id.slice(0, 8)}`}
      breadcrumbs={[
        { title: "Stock Transactions", path: "/stock-transactions" },
        { title: `Transaction ${transaction.id.slice(0, 8)}` },
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
          <Button
            variant="outlined"
            startIcon={<InventoryIcon />}
            onClick={() => navigate(itemLink)}
          >
            Item Details
          </Button>
          <Button
            variant="outlined"
            startIcon={<StoreIcon />}
            onClick={() => navigate(storeLink)}
          >
            Store Details
          </Button>
        </Stack>
      </Stack>

      {/* Transaction details card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={<SwapVertIcon color="primary" />}
          title={
            <Typography variant="h5" component="span" sx={{ fontWeight: 600 }}>
              {transaction.type} Transaction
            </Typography>
          }
          action={
            <Chip
              label={transaction.type}
              color="primary"
              variant="outlined"
              size="medium"
            />
          }
        />
        <CardContent>
          <Stack spacing={2.5}>
            {/* Date */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <EventIcon fontSize="small" color="action" />
              <Box>
                <Typography variant="overline" color="textSecondary">
                  Date
                </Typography>
                <Typography variant="body1">
                  {dayjs(transaction.transactionDate).format(
                    "MMM D, YYYY h:mm A",
                  )}
                </Typography>
              </Box>
            </Stack>

            {/* Item */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <InventoryIcon fontSize="small" color="action" />
              <Box>
                <Typography variant="overline" color="textSecondary">
                  Item
                </Typography>
                <Typography variant="body1">
                  {transaction.itemName} ({transaction.itemSku})
                </Typography>
              </Box>
            </Stack>

            {/* Store */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <StoreIcon fontSize="small" color="action" />
              <Box>
                <Typography variant="overline" color="textSecondary">
                  Store
                </Typography>
                <Typography variant="body1">
                  {transaction.storeName} ({transaction.storeCode})
                </Typography>
              </Box>
            </Stack>

            {/* Quantity */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <LabelIcon fontSize="small" color="action" />
              <Box>
                <Typography variant="overline" color="textSecondary">
                  Quantity
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    color:
                      transaction.signedQuantity >= 0
                        ? "success.main"
                        : "error.main",
                  }}
                >
                  {transaction.signedQuantity >= 0 ? "+" : ""}
                  {transaction.signedQuantity} {transaction.unit}
                </Typography>
              </Box>
            </Stack>

            {/* Reference */}
            {transaction.referenceId && (
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center" }}
              >
                <LinkIcon fontSize="small" color="action" />
                <Stack direction="row" spacing={1}>
                  <Typography variant="overline" color="textSecondary">
                    Reference
                  </Typography>
                  {referenceLink ? (
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => navigate(referenceLink)}
                      sx={{ py: 0, px: 1, textTransform: "none" }}
                    >
                      {transaction.referenceName || transaction.referenceId}
                    </Button>
                  ) : (
                    <Typography variant="body1">
                      {transaction.referenceName || transaction.referenceId}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            )}

            {/* Notes */}
            {transaction.notes && (
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "flex-start" }}
              >
                <NotesIcon fontSize="small" color="action" />
                <Box>
                  <Typography variant="overline" color="textSecondary">
                    Notes
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {transaction.notes}
                  </Typography>
                </Box>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

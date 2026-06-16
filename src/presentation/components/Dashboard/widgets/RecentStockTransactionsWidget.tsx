import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import { useStockTransactionDashboard } from "@/application/hooks/dashboard/useDashboard";
import dayjs from "dayjs";

export default function RecentStockTransactionsWidget() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { data, isLoading, isError, error } = useStockTransactionDashboard();

  const handleItemClick = (transactionId: string) => {
    navigate(`/stock-transactions/${transactionId}`);
  };

  const handleViewAll = () => {
    navigate("/stock-transactions");
  };

  return (
    <Can requiredPermissions={[Permissions.StockTransactions.Read]}>
      <Card
        variant="outlined"
        sx={{
          height: "100%",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <CardHeader title="Recent Stock Movements" />
        <CardContent>
          {isLoading ? (
            // Skeleton that mimics list items
            [...Array(5)].map((_, i) => (
              <Box
                key={i}
                sx={{ display: "flex", alignItems: "center", mb: 1 }}
              >
                <Skeleton
                  variant="circular"
                  width={24}
                  height={24}
                  sx={{ mr: 1 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </Box>
              </Box>
            ))
          ) : isError ? (
            <Alert severity="error">{(error as Error)?.message}</Alert>
          ) : data?.recentTransactions.length === 0 ? (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                No stock movements yet
              </Typography>
              <Button size="small" variant="text" onClick={handleViewAll}>
                View all
              </Button>
            </Box>
          ) : (
            <>
              <List dense disablePadding>
                {data!.recentTransactions.map((tx) => {
                  const isInbound = tx.signedQuantity >= 0;
                  return (
                    <ListItem
                      key={tx.id}
                      disableGutters
                      sx={{
                        cursor: "pointer",
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                        transition: "background 0.15s",
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                      onClick={() => handleItemClick(tx.id)}
                    >
                      {/* Colour bar as visual indicator */}
                      <Box
                        sx={{
                          width: 4,
                          height: 36,
                          borderRadius: 2,
                          bgcolor: isInbound
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                          mr: 1.5,
                          flexShrink: 0,
                        }}
                      />
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        {isInbound ? (
                          <ArrowUpwardIcon
                            sx={{ color: theme.palette.success.main }}
                            fontSize="small"
                          />
                        ) : (
                          <ArrowDownwardIcon
                            sx={{ color: theme.palette.error.main }}
                            fontSize="small"
                          />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" noWrap>
                            {tx.itemSku} – {tx.type}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(tx.transactionDate).format("MMM D HH:mm")} ·{" "}
                            <Box
                              component="span"
                              sx={{
                                color: isInbound
                                  ? theme.palette.success.main
                                  : theme.palette.error.main,
                                fontWeight: 500,
                              }}
                            >
                              {tx.signedQuantity > 0 ? "+" : ""}
                              {tx.signedQuantity} {tx.unit}
                            </Box>
                          </Typography>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
              <Button
                size="small"
                variant="text"
                onClick={handleViewAll}
                sx={{ mt: 1 }}
              >
                View all
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Can>
  );
}

import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import { useMaterialItemDashboard } from "@/application/hooks/dashboard/useDashboard";

export default function LowStockAlertWidget() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { data, isLoading, isError, error } = useMaterialItemDashboard();

  const handleItemClick = (sku: string) => {
    navigate(`/material-items/${sku}`);
  };

  const lowStockCount = data?.lowStockItemCount ?? 0;

  // Helper to determine stock urgency
  const getStockColor = (quantity: number) => {
    if (quantity <= 3) return theme.palette.error.main;
    if (quantity <= 6) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  return (
    <Can requiredPermissions={[Permissions.MaterialItems.View]}>
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
        <CardHeader
          title="Low Stock Alerts"
          action={
            <Chip
              label={isLoading ? "…" : lowStockCount}
              color="error"
              size="small"
              variant="filled"
            />
          }
        />
        <CardContent>
          {isLoading ? (
            <Stack spacing={1}>
              {[...Array(3)].map((_, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center" }}>
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
              ))}
            </Stack>
          ) : isError ? (
            <Alert severity="error">{(error as Error)?.message}</Alert>
          ) : lowStockCount === 0 ? (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                No items are low on stock.
              </Typography>
              <Button
                size="small"
                variant="text"
                onClick={() => navigate("/material-items")}
              >
                View all
              </Button>
            </Box>
          ) : (
            <>
              <List disablePadding dense>
                {data?.lowStockItems.slice(0, 5).map((item) => {
                  const stockColor = getStockColor(item.availableQuantity);
                  return (
                    <ListItem
                      key={item.sku}
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
                      onClick={() => handleItemClick(item.sku)}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" noWrap>
                            {item.name}
                          </Typography>
                        }
                        secondary={
                          // Use a React fragment directly; no need for secondaryTypographyProps
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              width: "100%",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              SKU: {item.sku} · {item.availableQuantity}{" "}
                              {item.unit} left
                            </Typography>
                            <Chip
                              size="small"
                              label={`${item.availableQuantity} ${item.unit}`}
                              sx={{
                                bgcolor: stockColor,
                                color:
                                  theme.palette.getContrastText(stockColor),
                                fontWeight: 500,
                                height: 20,
                                fontSize: "0.65rem",
                              }}
                            />
                          </Box>
                        }
                        slotProps={{
                          secondary: {
                            component: "div",
                          },
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
              {lowStockCount > 5 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  +{lowStockCount - 5} more
                </Typography>
              )}
              <Box sx={{ mt: 2, textAlign: "right" }}>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => navigate("/material-items?lowStockOnly=true")}
                >
                  View all
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Can>
  );
}

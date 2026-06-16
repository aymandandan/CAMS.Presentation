import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import { usePurchaseOrderDashboard } from "@/application/hooks/dashboard/useDashboard";
import dayjs from "dayjs";

export default function PurchaseOrderPendingWidget() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { data, isLoading, isError, error } = usePurchaseOrderDashboard();

  const handleRowClick = (poId: string) => {
    navigate(`/purchase-orders/${poId}`);
  };

  return (
    <Can requiredPermissions={[Permissions.PurchaseOrders.Read]}>
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
          title="Purchase Orders"
          action={
            <Chip
              label={isLoading ? "…" : (data?.draftCount ?? 0)}
              color="warning"
              size="small"
              variant="filled"
              sx={{
                animation: isLoading ? "pulse 1.5s infinite" : "none",
                "@keyframes pulse": {
                  "0%": { opacity: 1 },
                  "50%": { opacity: 0.5 },
                  "100%": { opacity: 1 },
                },
              }}
            />
          }
        />
        <CardContent>
          {isLoading ? (
            // Skeleton that matches the table
            <Box>
              <Skeleton variant="text" width="40%" sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={80} />
            </Box>
          ) : isError ? (
            <Alert severity="error">{(error as Error)?.message}</Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {data?.draftCount} draft orders need attention
              </Typography>
              {data?.recentlyReceived && data.recentlyReceived.length > 0 ? (
                <TableContainer>
                  <Table
                    size="small"
                    aria-label="recently received purchase orders"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>Vendor</TableCell>
                        <TableCell>Received</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.recentlyReceived.map((po) => (
                        <TableRow
                          key={po.id}
                          hover
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: theme.palette.action.hover,
                            },
                          }}
                          onClick={() => handleRowClick(po.id)}
                        >
                          <TableCell>{po.vendorName}</TableCell>
                          <TableCell>
                            {dayjs(po.receivedAt).format("MMM D")}
                          </TableCell>
                          <TableCell align="right">
                            {po.totalAmount} {po.currency}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent received orders
                </Typography>
              )}
              <Button
                size="small"
                variant="text"
                onClick={() => navigate("/purchase-orders")}
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

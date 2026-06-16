import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
// import CustomDatePicker from "../common/CustomDatePicker";

export default function DashboardPageHeader() {
  const navigate = useNavigate();

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        mb: 3,
        width: "100%",
      }}
    >
      <Typography variant="h4" component="h1">
        CAMS Dashboard
      </Typography>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        {/* <CustomDatePicker label="Filter period" /> */}
        <Can requiredPermissions={[Permissions.WorkOrders.Create]}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/work-orders/new")}
          >
            New Work Order
          </Button>
        </Can>
        <Can requiredPermissions={[Permissions.PurchaseOrders.Create]}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => navigate("/purchase-orders/new")}
          >
            New PO
          </Button>
        </Can>
      </Stack>
    </Stack>
  );
}

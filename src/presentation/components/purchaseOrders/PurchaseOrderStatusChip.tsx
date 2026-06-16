import Chip, { ChipProps } from "@mui/material/Chip";
import { PurchaseOrderStatus } from "@/domain/purchaseOrders/PurchaseOrderTypes";

const statusColorMap: Record<string, ChipProps["color"]> = {
  [PurchaseOrderStatus.Draft]: "default",
  [PurchaseOrderStatus.Received]: "success",
  [PurchaseOrderStatus.Cancelled]: "error",
};

interface Props {
  status: string;
}

export default function PurchaseOrderStatusChip({ status }: Props) {
  return (
    <Chip
      label={status}
      color={statusColorMap[status] ?? "default"}
      size="small"
    />
  );
}
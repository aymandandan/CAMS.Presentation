import Chip, { ChipProps } from "@mui/material/Chip";
import { WorkOrderStatus } from "@/domain/workOrders/WorkOrderTypes";

const statusColorMap: Record<WorkOrderStatus, ChipProps["color"]> = {
  [WorkOrderStatus.Draft]: "default",
  [WorkOrderStatus.Scheduled]: "secondary",
  [WorkOrderStatus.InProgress]: "primary",
  [WorkOrderStatus.Terminated]: "error",
  [WorkOrderStatus.NotPerformed]: "warning",
  [WorkOrderStatus.Closed]: "success",
};

interface Props {
  status: WorkOrderStatus;
}

export default function WorkOrderStatusChip({ status }: Props) {
  return (
    <Chip
      label={status}
      color={statusColorMap[status] ?? "default"}
      size="small"
    />
  );
}

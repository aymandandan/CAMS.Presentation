import Chip from "@mui/material/Chip";
import { Priority } from "@/domain/workOrders/WorkOrderTypes";

const priorityColorMap: Record<Priority, "default" | "warning" | "error"> = {
  [Priority.Normal]: "default",
  [Priority.Urgent]: "warning",
  [Priority.Critical]: "error",
};

interface Props {
  priority: Priority;
}

export default function WorkOrderPriorityChip({ priority }: Props) {
  return (
    <Chip label={priority} color={priorityColorMap[priority]} size="small" />
  );
}

import { Chip } from "@mui/material";
import { EquipmentStatus } from "@/domain/equipment/EquipmentTypes";

const statusColorMap: Record<
  string,
  "success" | "warning" | "error" | "default"
> = {
  [EquipmentStatus.Operational]: "success",
  [EquipmentStatus.UnderMaintenance]: "warning",
  [EquipmentStatus.Decommissioned]: "error",
};

interface Props {
  status: EquipmentStatus;
}

export default function EquipmentStatusChip({ status }: Props) {
  return (
    <Chip
      label={status}
      color={statusColorMap[status] ?? "default"}
      size="small"
    />
  );
}

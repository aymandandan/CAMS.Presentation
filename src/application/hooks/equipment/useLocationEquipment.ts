import { useQuery } from "@tanstack/react-query";
import { getEquipments } from "@/infrastructure/api/equipmentApi";
import { type EquipmentListItemDto } from "@/domain/equipment/EquipmentTypes";

export function useLocationEquipment(locationId: string, enabled: boolean) {
  return useQuery<EquipmentListItemDto[]>({
    queryKey: [
      "equipment",
      "list",
      {
        locationId,
        // status: EquipmentStatus.Operational,
      },
    ],
    queryFn: () =>
      getEquipments({
        page: 1,
        pageSize: 100, // reasonable maximum for a tree node
        locationId,
        // status: EquipmentStatus.Operational,
      }).then((res) => res.items),
    enabled: enabled && !!locationId,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
}

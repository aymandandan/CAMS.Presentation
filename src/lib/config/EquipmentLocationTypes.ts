export const EQUIPMENT_LOCATION_TYPES = ["Room", "Zone"] as const;
export type EquipmentLocationType = (typeof EQUIPMENT_LOCATION_TYPES)[number];

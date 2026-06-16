import { EquipmentStatus } from "@/domain/equipment/EquipmentTypes";

/**
 * Frontend‑string → backend‑number mappings
 */
export const equipmentStatusToNumber: Record<EquipmentStatus, number> = {
  [EquipmentStatus.Operational]: 0,
  [EquipmentStatus.UnderMaintenance]: 1,
  [EquipmentStatus.Decommissioned]: 2,
};

/**
 * Backend‑number → frontend‑string mappings
 */
export const numberToEquipmentStatus: Record<number, EquipmentStatus> = {
  0: EquipmentStatus.Operational,
  1: EquipmentStatus.UnderMaintenance,
  2: EquipmentStatus.Decommissioned,
};

/**
 * Convert a request object that contains an optional 'status' field.
 */
export function mapEquipmentToApi<T extends Record<string, any>>(
  payload: T,
): T {
  const mapped: any = { ...payload };
  if (mapped.status !== undefined && typeof mapped.status === "string") {
    mapped.status = equipmentStatusToNumber[mapped.status as EquipmentStatus];
  }
  return mapped as T;
}

/**
 * Convert API responses that contain a numeric 'status' back to the string enum.
 */
export function mapEquipmentFromApi<T extends Record<string, any>>(
  payload: T,
): T {
  const mapped: any = { ...payload };
  if (mapped.status !== undefined && typeof mapped.status === "number") {
    mapped.status = numberToEquipmentStatus[mapped.status] ?? mapped.status;
  }
  return mapped as T;
}

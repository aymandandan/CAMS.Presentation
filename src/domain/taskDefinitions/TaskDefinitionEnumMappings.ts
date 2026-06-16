import {
  WorkOrderType,
  TimeUnit,
} from "@/domain/taskDefinitions/TaskDefinitionTypes";

/**
 * Frontend‑string → backend‑number mappings
 * (C# enums are 0‑based in the order they are defined)
 */
export const workOrderTypeToNumber: Record<WorkOrderType, number> = {
  [WorkOrderType.Corrective]: 0,
  [WorkOrderType.PlannedPreventive]: 1,
};

export const timeUnitToNumber: Record<TimeUnit, number> = {
  [TimeUnit.Seconds]: 0,
  [TimeUnit.Minutes]: 1,
  [TimeUnit.Hours]: 2,
  [TimeUnit.Days]: 3,
  [TimeUnit.Weeks]: 4,
  [TimeUnit.Months]: 5,
  [TimeUnit.Years]: 6,
};

/**
 * Backend‑number → frontend‑string mappings
 * (useful if the backend ever returns numeric values)
 */
export const numberToWorkOrderType: Record<number, WorkOrderType> = {
  0: WorkOrderType.Corrective,
  1: WorkOrderType.PlannedPreventive,
};

export const numberToTimeUnit: Record<number, TimeUnit> = {
  0: TimeUnit.Seconds,
  1: TimeUnit.Minutes,
  2: TimeUnit.Hours,
  3: TimeUnit.Days,
  4: TimeUnit.Weeks,
  5: TimeUnit.Months,
  6: TimeUnit.Years,
};

/**
 * Convert a frontend Create/Update request object by replacing string enums with numbers.
 */
export function mapTaskDefinitionToApi<T extends Record<string, any>>(
  payload: T,
): T {
  const mapped = { ...payload } as any;
  if ("type" in mapped && typeof mapped.type === "string") {
    mapped.type = workOrderTypeToNumber[mapped.type as WorkOrderType];
  }
  if ("durationUnit" in mapped && typeof mapped.durationUnit === "string") {
    mapped.durationUnit = timeUnitToNumber[mapped.durationUnit as TimeUnit];
  }
  return mapped;
}

/**
 * Convert a backend response object (if enums arrive as numbers) to frontend strings.
 */
export function mapTaskDefinitionFromApi<T extends Record<string, any>>(
  payload: T,
): T {
  const mapped = { ...payload } as any;
  if ("type" in mapped && typeof mapped.type === "number") {
    mapped.type = numberToWorkOrderType[mapped.type] ?? mapped.type;
  }
  if ("durationUnit" in mapped && typeof mapped.durationUnit === "number") {
    mapped.durationUnit =
      numberToTimeUnit[mapped.durationUnit] ?? mapped.durationUnit;
  }
  return mapped;
}

import { LocationType } from "@/domain/locations/LocationTypes";

export const locationTypeToNumber: Record<LocationType, number> = {
  [LocationType.Project]: 0,
  [LocationType.Building]: 1,
  [LocationType.Floor]: 2,
  [LocationType.Zone]: 3,
  [LocationType.Room]: 4,
};

export const numberToLocationType: Record<number, LocationType> = {
  0: LocationType.Project,
  1: LocationType.Building,
  2: LocationType.Floor,
  3: LocationType.Zone,
  4: LocationType.Room,
};

/**
 * Replace string LocationType with its numeric value for the API.
 */
export function mapLocationToApi<T extends Record<string, any>>(payload: T): T {
  const mapped: any = { ...payload };
  if (mapped.type !== undefined && typeof mapped.type === "string") {
    mapped.type = locationTypeToNumber[mapped.type as LocationType];
  }
  return mapped as T;
}

/**
 * Convert numeric LocationType from API responses back to string.
 */
export function mapLocationFromApi<T extends Record<string, any>>(
  payload: T,
): T {
  const mapped: any = { ...payload };
  if (mapped.type !== undefined && typeof mapped.type === "number") {
    mapped.type = numberToLocationType[mapped.type] ?? mapped.type;
  }
  return mapped as T;
}

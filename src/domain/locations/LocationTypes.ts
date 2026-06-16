export enum LocationType {
  Project = "Project",
  Building = "Building",
  Floor = "Floor",
  Zone = "Zone",
  Room = "Room",
}

export interface LocationDto {
  id: string; // Guid
  code: string;
  name: string;
  description?: string;
  type: LocationType;
  parentId?: string;
}

export interface LocationDetailsDto extends LocationDto {
  parent?: LocationDto; // <-- new parent property
}

export interface LocationPathDto {
  path: string;
}

// Command / request types for mutations
export interface CreateLocationRequest {
  code: string;
  name: string;
  type: LocationType;
  parentId?: string;
  description?: string;
}

export interface UpdateLocationRequest {
  id: string;
  name?: string;
  description?: string;
}

export interface ChangeLocationParentRequest {
  locationId: string;
  newParentId?: string; // Guid? (nullable)
}

// Query params for GET /api/locations
export interface GetLocationsQueryParams {
  type?: LocationType;
  page: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  isPagingEnabled?: boolean;
}

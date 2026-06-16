import { SortablePaginationRequestInfo } from "../shared";

// ---------- DTO ----------
export interface MaterialStoreDto {
  id: string; // Guid as string
  code: string;
  name: string;
  address?: string;
}

// ---------- Commands ----------
export interface CreateMaterialStoreCommand {
  code: string;
  name: string;
  address?: string;
}

export interface UpdateMaterialStoreCommand {
  id: string;
  name: string;
  address?: string;
}

export interface MaterialStoreQueryParams extends SortablePaginationRequestInfo {}

import type {
  PaginatedList,
  SortablePaginationRequestInfo,
} from "@/domain/shared/Result";

// Mirrors the backend VendorDto
export interface VendorDto {
  id: string; // Guid comes as string
  name: string;
  email?: string;
  phone?: string; // E.164 formatted
}

// Query parameters exactly as the controller expects
export interface VendorListParams extends SortablePaginationRequestInfo {}

// Create command
export interface CreateVendorRequest {
  name: string;
  email?: string;
  phone?: string;
}

// Update command
export interface UpdateVendorRequest {
  vendorId: string;
  name?: string;
  email?: string;
  phone?: string;
}

// Paginated list of vendors
export type VendorPaginatedList = PaginatedList<VendorDto>;

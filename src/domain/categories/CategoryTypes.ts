import { SortablePaginationRequestInfo } from "../shared";

export interface CategoryDto {
  id: string;
  code: string;
  name: string;
  description?: string | null;
}

export interface PaginatedCategoryList {
  items: CategoryDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Query parameters for GetAll
export interface CategoriesQueryParams extends SortablePaginationRequestInfo {
  isPagingEnabled?: boolean;
}

// Command types
export interface CreateCategoryRequest {
  code: string;
  name: string;
  description?: string | null;
}

export interface UpdateCategoryRequest {
  categoryId: string;
  name: string;
  description?: string | null;
}

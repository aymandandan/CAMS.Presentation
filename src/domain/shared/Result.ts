export interface AppError {
  code: string;
  description: string;
}

export interface Result<T = void> {
  succeeded: boolean;
  statusCode: number;
  data?: T;
  errors: AppError[];
  error?: string;
}

export interface PaginatedList<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginationRequestInfo {
  page: number;
  pageSize: number;
  searchTerm?: string;
}

export interface SortablePaginationRequestInfo extends PaginationRequestInfo {
  sortBy?: string;
  sortDirection?: "asc" | "desc";
} 

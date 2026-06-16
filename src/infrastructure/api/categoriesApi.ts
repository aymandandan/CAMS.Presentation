import axiosClient from "@/infrastructure/api/axiosClient";
import type { Result, PaginatedList } from "@/domain/shared/Result";
import type {
  CategoryDto,
  PaginatedCategoryList,
  CategoriesQueryParams,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/domain/categories/CategoryTypes";

/**
 * Throws an error with the first error description from the response.
 */
function throwIfErrors<T>(result: Result<T>): T {
  if (!result.succeeded) {
    const firstError = result.errors?.[0];
    const message =
      firstError?.description ?? result.error ?? "An unknown error occurred";
    throw new Error(message);
  }
  return result.data as T;
}

export async function getCategories(
  params: CategoriesQueryParams,
): Promise<PaginatedCategoryList> {
  const { data } = await axiosClient.get<Result<PaginatedList<CategoryDto>>>(
    "/categories",
    {
      params,
    },
  );
  return throwIfErrors(data);
}

export async function getCategoryById(id: string): Promise<CategoryDto> {
  const { data } = await axiosClient.get<Result<CategoryDto>>(
    `/categories/${id}`,
  );
  return throwIfErrors(data);
}

export async function getCategoryByCode(code: string): Promise<CategoryDto> {
  const { data } = await axiosClient.get<Result<CategoryDto>>(
    "/categories/by-code",
    {
      params: { code },
    },
  );
  return throwIfErrors(data);
}

export async function createCategory(
  request: CreateCategoryRequest,
): Promise<string> {
  const { data } = await axiosClient.post<Result<string>>(
    "/categories",
    request,
  );
  return throwIfErrors(data);
}

export async function updateCategory(
  request: UpdateCategoryRequest,
): Promise<void> {
  const { data } = await axiosClient.put<Result>(
    `/categories/${request.categoryId}`,
    request,
  );
  throwIfErrors(data);
}

export async function deleteCategory(id: string): Promise<void> {
  const { data } = await axiosClient.delete<Result>(`/categories/${id}`);
  throwIfErrors(data);
}

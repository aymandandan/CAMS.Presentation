import axiosClient from "@/infrastructure/api/axiosClient";
import type { Result, PaginatedList } from "@/domain/shared/Result";
import type {
  CategoryDto,
  PaginatedCategoryList,
  CategoriesQueryParams,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/domain/categories/CategoryTypes";
import { extractData, getErrorMessage } from "@/lib/utils/ResponseUtils";

export async function getCategories(
  params: CategoriesQueryParams,
): Promise<PaginatedCategoryList> {
  try {
    const response = await axiosClient.get<Result<PaginatedList<CategoryDto>>>(
      "/categories",
      {
        params,
      },
    );
    return extractData<PaginatedList<CategoryDto>>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getCategoryById(id: string): Promise<CategoryDto> {
  try {
    const response = await axiosClient.get<Result<CategoryDto>>(
      `/categories/${id}`,
    );
    return extractData<CategoryDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getCategoryByCode(code: string): Promise<CategoryDto> {
  try {
    const response = await axiosClient.get<Result<CategoryDto>>(
      "/categories/by-code",
      {
        params: { code },
      },
    );
    return extractData<CategoryDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createCategory(
  request: CreateCategoryRequest,
): Promise<string> {
  try {
    const response = await axiosClient.post<Result<string>>(
      "/categories",
      request,
    );
    return extractData<string>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateCategory(
  request: UpdateCategoryRequest,
): Promise<void> {
  try {
    const response = await axiosClient.put<Result>(
      `/categories/${request.categoryId}`,
      request,
    );
    return extractData<void>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    const response = await axiosClient.delete<Result>(`/categories/${id}`);
    return extractData<void>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

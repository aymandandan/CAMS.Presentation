import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CategoriesQueryParams } from "@/domain/categories/CategoryTypes";
import {
  getCategories,
  getCategoryById,
  getCategoryByCode,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/infrastructure/api/categoriesApi";

// Query key factory
const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters: CategoriesQueryParams) =>
    [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

// Queries
export function useCategories(
  params: CategoriesQueryParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => getCategories(params),
    ...options,
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => getCategoryById(id),
    enabled: !!id,
  });
}

export function useCategoryByCode(code: string) {
  return useQuery({
    queryKey: [...categoryKeys.all, "byCode", code],
    queryFn: () => getCategoryByCode(code),
    enabled: !!code,
  });
}

// Mutations
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      // Invalidate all category lists
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategory,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(variables.categoryId),
      });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

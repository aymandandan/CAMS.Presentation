import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateMaterialStoreCommand,
  MaterialStoreQueryParams,
  UpdateMaterialStoreCommand,
} from "@/domain/materialStores/MaterialStoreTypes";
import {
  getMaterialStores,
  getMaterialStoreById,
  createMaterialStore,
  updateMaterialStore,
  deleteMaterialStore,
} from "@/infrastructure/api/materialStoresApi";

// ----- Query Keys -----
const materialStoreKeys = {
  all: ["materialStores"] as const,
  lists: () => [...materialStoreKeys.all, "list"] as const,
  list: (filters: MaterialStoreQueryParams) =>
    [...materialStoreKeys.lists(), filters] as const,
  details: () => [...materialStoreKeys.all, "detail"] as const,
  detail: (id: string) => [...materialStoreKeys.details(), id] as const,
};

// ----- Queries -----

/**
 * Hook for paginated list of material stores.
 */
export function useMaterialStoresQuery(
  params: MaterialStoreQueryParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: materialStoreKeys.list(params),
    queryFn: () => getMaterialStores(params),
    // keepPreviousData: true, // if using TanStack Query v4; v5 uses placeholderData
    placeholderData: (prev) => prev,
    ...options,
  });
}

/**
 * Hook for single material store by ID.
 */
export function useMaterialStoreQuery(id: string | null) {
  return useQuery({
    queryKey: materialStoreKeys.detail(id!),
    queryFn: () => getMaterialStoreById(id!),
    enabled: !!id,
  });
}

// ----- Mutations -----

/**
 * Create mutation.
 */
export function useCreateMaterialStoreMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: CreateMaterialStoreCommand) =>
      createMaterialStore(command),
    onSuccess: () => {
      // Invalidate all list queries to refresh the table
      queryClient.invalidateQueries({ queryKey: materialStoreKeys.lists() });
    },
  });
}

/**
 * Update mutation.
 */
export function useUpdateMaterialStoreMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (command: UpdateMaterialStoreCommand) =>
      updateMaterialStore(command),
    onSuccess: (_, variables) => {
      // Invalidate the specific detail and all lists
      queryClient.invalidateQueries({
        queryKey: materialStoreKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: materialStoreKeys.lists() });
    },
  });
}

/**
 * Delete mutation.
 */
export function useDeleteMaterialStoreMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMaterialStore(id),
    onSuccess: (_, id) => {
      // Remove the detail from cache and invalidate lists
      queryClient.removeQueries({ queryKey: materialStoreKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: materialStoreKeys.lists() });
    },
  });
}

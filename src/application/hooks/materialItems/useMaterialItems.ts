import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { materialItemsApi } from "@/infrastructure/api/materialItemsApi";
import type {
  GetMaterialItemsQueryParams,
  CreateMaterialItemRequest,
  UpdateMaterialItemRequest,
  ReserveStockRequest,
  ReleaseReservationRequest,
  AdjustStockRequest,
  TransferStockRequest,
  AddItemToStoresRequest,
} from "@/domain/materialItems/MaterialItemTypes";
import { GridPaginationModel, GridFilterModel } from "@mui/x-data-grid";

// ---------- Query Key Factory ----------
const materialItemsKeys = {
  all: ["materialItems"] as const,
  lists: () => [...materialItemsKeys.all, "list"] as const,
  list: (params: GetMaterialItemsQueryParams) =>
    [...materialItemsKeys.lists(), params] as const,
  details: () => [...materialItemsKeys.all, "detail"] as const,
  detail: (id: string) => [...materialItemsKeys.details(), id] as const,
  sku: (sku: string) => [...materialItemsKeys.all, "sku", sku] as const,
};

// ---------- Queries ----------
export function useMaterialItemsList(
  params: GetMaterialItemsQueryParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: materialItemsKeys.list(params),
    queryFn: () => materialItemsApi.getAll(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useMaterialItemById(id: string) {
  return useQuery({
    queryKey: materialItemsKeys.detail(id),
    queryFn: () => materialItemsApi.getById(id),
    enabled: !!id,
  });
}

export function useMaterialItemBySku(sku: string) {
  return useQuery({
    queryKey: materialItemsKeys.sku(sku),
    queryFn: () => materialItemsApi.getBySku(sku),
    enabled: !!sku,
  });
}

// ---------- Mutations ----------
export function useCreateMaterialItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMaterialItemRequest) =>
      materialItemsApi.create(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: materialItemsKeys.lists() }),
  });
}

export function useUpdateMaterialItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateMaterialItemRequest;
    }) => materialItemsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: materialItemsKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: materialItemsKeys.lists() });
    },
  });
}

export function useDeleteMaterialItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => materialItemsApi.delete(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: materialItemsKeys.lists() }),
  });
}

export function useReserveStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReserveStockRequest }) =>
      materialItemsApi.reserveStock(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: materialItemsKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: materialItemsKeys.lists() });
    },
  });
}

export function useReleaseReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ReleaseReservationRequest;
    }) => materialItemsApi.releaseReservation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: materialItemsKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: materialItemsKeys.lists() });
    },
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdjustStockRequest }) =>
      materialItemsApi.adjustStock(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: materialItemsKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: materialItemsKeys.lists() });
    },
  });
}

export function useTransferStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransferStockRequest }) =>
      materialItemsApi.transferStock(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: materialItemsKeys.lists() }),
  });
}

export function useAddToStores() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddItemToStoresRequest }) =>
      materialItemsApi.addToStores(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: materialItemsKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: materialItemsKeys.lists() });
    },
  });
}

// Helper to map DataGrid params to backend query
export function toQueryParams(
  paginationModel: GridPaginationModel,
  filterModel: GridFilterModel,
  extraFilters?: {
    storeId?: string;
    lowStockOnly?: boolean;
    aggregateAcrossStores?: boolean;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  },
): GetMaterialItemsQueryParams {
  return {
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    searchTerm: (filterModel.quickFilterValues?.[0] as string) || undefined,
    storeId: extraFilters?.storeId,
    lowStockOnly: extraFilters?.lowStockOnly,
    aggregateAcrossStores: extraFilters?.aggregateAcrossStores,
    sortBy: extraFilters?.sortBy || undefined,
    sortDirection: extraFilters?.sortDirection || undefined,
  };
}

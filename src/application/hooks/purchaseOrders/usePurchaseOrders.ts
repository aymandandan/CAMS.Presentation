import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,
  updatePurchaseOrder,
} from "@/infrastructure/api/purchaseOrdersApi";
import type {
  PurchaseOrderListItemDto,
  PurchaseOrderDetailsDto,
  CreatePurchaseOrderRequest,
  GetPurchaseOrdersQueryParams,
  UpdatePurchaseOrderRequest,
} from "@/domain/purchaseOrders/PurchaseOrderTypes";
import type { PaginatedList } from "@/domain/shared";

// ------------------ Query Keys ------------------
const purchaseOrderKeys = {
  all: ["purchaseOrders"] as const,
  lists: () => [...purchaseOrderKeys.all, "list"] as const,
  list: (params: GetPurchaseOrdersQueryParams) =>
    [...purchaseOrderKeys.lists(), params] as const,
  details: () => [...purchaseOrderKeys.all, "detail"] as const,
  detail: (id: string) => [...purchaseOrderKeys.details(), id] as const,
};

// ------------------ Queries ------------------
export function usePurchaseOrders(params: GetPurchaseOrdersQueryParams) {
  return useQuery<PaginatedList<PurchaseOrderListItemDto>>({
    queryKey: purchaseOrderKeys.list(params),
    queryFn: () => getPurchaseOrders(params),
    placeholderData: keepPreviousData,
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery<PurchaseOrderDetailsDto>({
    queryKey: purchaseOrderKeys.detail(id),
    queryFn: () => getPurchaseOrderById(id),
    enabled: !!id,
  });
}

// ------------------ Mutations ------------------
export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation<string, Error, CreatePurchaseOrderRequest>({
    mutationFn: (data) => createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation<
    string,
    Error,
    { id: string; data: UpdatePurchaseOrderRequest }
  >({
    mutationFn: ({ id, data }) => updatePurchaseOrder(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(id) });
    },
  });
}

export function useReceivePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => receivePurchaseOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(id) });
    },
  });
}

export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => cancelPurchaseOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(id) });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getEquipments,
  getEquipmentById,
  getEquipmentByCode,
  createEquipment,
  decommissionEquipment,
  deleteEquipment,
  markUnderMaintenance,
  updateEquipment,
} from "@/infrastructure/api/equipmentApi";
import type {
  CreateEquipmentRequest,
  EquipmentDetailsDto,
  EquipmentListItemDto,
  EquipmentSearchParams,
  UpdateEquipmentRequest,
} from "@/domain/equipment/EquipmentTypes";
import { PaginatedList } from "@/domain/shared";
import { keepPreviousData } from "@tanstack/react-query";

export const equipmentQueryKeys = {
  all: ["equipment"] as const,
  lists: () => [...equipmentQueryKeys.all, "list"] as const,
  list: (params: EquipmentSearchParams) =>
    [...equipmentQueryKeys.lists(), params] as const,
  details: () => [...equipmentQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...equipmentQueryKeys.details(), id] as const,
  byCode: (code: string) =>
    [...equipmentQueryKeys.all, "byCode", code] as const,
};

// Queries
export function useEquipmentList(
  params: EquipmentSearchParams,
  options?: { enabled?: boolean },
) {
  return useQuery<PaginatedList<EquipmentListItemDto>>({
    queryKey: equipmentQueryKeys.list(params),
    queryFn: () => getEquipments(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useEquipment(id: string) {
  return useQuery<EquipmentDetailsDto>({
    queryKey: equipmentQueryKeys.detail(id),
    queryFn: () => getEquipmentById(id),
    enabled: !!id,
  });
}

export function useEquipmentByCode(code: string) {
  return useQuery<EquipmentDetailsDto>({
    queryKey: equipmentQueryKeys.byCode(code),
    queryFn: () => getEquipmentByCode(code),
    enabled: !!code,
  });
}

// Mutations
export function useCreateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEquipmentRequest) => createEquipment(data),
    onSuccess: () => {
      // Invalidate all equipment list queries
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.lists() });
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEquipmentRequest }) =>
      updateEquipment(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: equipmentQueryKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.lists() });
    },
  });
}

export function useMarkUnderMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markUnderMaintenance(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: equipmentQueryKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.lists() });
    },
  });
}

export function useDecommissionEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => decommissionEquipment(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: equipmentQueryKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.lists() });
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEquipment(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: equipmentQueryKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: equipmentQueryKeys.lists() });
    },
  });
}

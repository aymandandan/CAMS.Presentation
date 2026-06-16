import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import * as maintenancePlansApi from "@/infrastructure/api/maintenancePlansApi";
import type {
  MaintenancePlanListItemDto,
  MaintenancePlanDetailsDto,
  CreateMaintenancePlanRequest,
  UpdateMaintenancePlanRequest,
  MaintenancePlansQueryParams,
} from "@/domain/maintenancePlans/MaintenancePlanTypes";
import { PaginatedList } from "@/domain/shared";

// ── Query Keys ─────────────────────────────────────────
const planKeys = {
  all: ["maintenance-plans"] as const,
  lists: () => [...planKeys.all, "list"] as const,
  list: (params: MaintenancePlansQueryParams) =>
    [...planKeys.lists(), params] as const,
  details: () => [...planKeys.all, "detail"] as const,
  detail: (id: string) => [...planKeys.details(), id] as const,
};

// ── List Query ─────────────────────────────────────────
export function useMaintenancePlans(
  params: MaintenancePlansQueryParams,
  options?: { enabled?: boolean },
) {
  return useQuery<PaginatedList<MaintenancePlanListItemDto>, Error>({
    queryKey: planKeys.list(params),
    queryFn: () => maintenancePlansApi.getMaintenancePlans(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

// ── Detail Query ───────────────────────────────────────
export function useMaintenancePlan(
  id: string,
  options?: { enabled?: boolean },
) {
  return useQuery<MaintenancePlanDetailsDto, Error>({
    queryKey: planKeys.detail(id),
    queryFn: () => maintenancePlansApi.getMaintenancePlanById(id),
    enabled: (options?.enabled !== undefined ? options.enabled : true) && !!id,
  });
}

// ── Mutations (unchanged, they already use the updated request types) ──
export function useCreateMaintenancePlan() {
  const queryClient = useQueryClient();
  return useMutation<string, Error, CreateMaintenancePlanRequest>({
    mutationFn: (data) => maintenancePlansApi.createMaintenancePlan(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: planKeys.lists() }),
  });
}

export function useUpdateMaintenancePlan() {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { id: string; data: UpdateMaintenancePlanRequest }
  >({
    mutationFn: ({ id, data }) =>
      maintenancePlansApi.updateMaintenancePlan(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.detail(id) });
    },
  });
}

export function useActivateMaintenancePlan() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => maintenancePlansApi.activateMaintenancePlan(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.detail(id) });
    },
  });
}

export function useDeactivateMaintenancePlan() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => maintenancePlansApi.deactivateMaintenancePlan(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: planKeys.lists() });
      queryClient.invalidateQueries({ queryKey: planKeys.detail(id) });
    },
  });
}

export function useDeleteMaintenancePlan() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => maintenancePlansApi.deleteMaintenancePlan(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: planKeys.lists() }),
  });
}

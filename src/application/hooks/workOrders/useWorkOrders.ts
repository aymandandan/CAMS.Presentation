import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  getWorkOrders,
  getWorkOrder,
  createCorrectiveWorkOrder,
  createPreventiveWorkOrder,
  updateWorkOrderDetails,
  updateWorkOrderTasks,
  assignWorkOrder,
  scheduleWorkOrder,
  startWorkOrder,
  terminateWorkOrder,
  cancelWorkOrder,
  issueMaterials,
  returnMaterials,
} from "@/infrastructure/api/workOrderApi";
import type {
  GetFilteredWorkOrdersQuery,
  WorkOrderListItemDto,
  WorkOrderDetailsDto,
  CreateCorrectiveWorkOrderCommand,
  CreatePreventiveWorkOrderCommand,
  UpdateWorkOrderDetailsCommand,
  UpdateWorkOrderTasksCommand,
  AssignWorkOrderCommand,
  ScheduleWorkOrderCommand,
  StartWorkOrderCommand,
  TerminateWorkOrderCommand,
  CancelWorkOrderCommand,
  IssueMaterialsCommand,
  ReturnMaterialsCommand,
} from "@/domain/workOrders/WorkOrderTypes";
import type { PaginatedList } from "@/domain/shared";

// ------------------ Queries ------------------
export function useWorkOrders(
  params: GetFilteredWorkOrdersQuery,
  options?: { enabled?: boolean },
) {
  return useQuery<PaginatedList<WorkOrderListItemDto>>({
    queryKey: ["workOrders", params],
    queryFn: () => getWorkOrders(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useWorkOrder(id: string) {
  return useQuery<WorkOrderDetailsDto>({
    queryKey: ["workOrders", id],
    queryFn: () => getWorkOrder(id),
    enabled: !!id,
  });
}

// ------------------ Mutations ------------------
export function useCreateCorrectiveWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCorrectiveWorkOrderCommand) =>
      createCorrectiveWorkOrder(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["workOrders"] }),
  });
}

export function useCreatePreventiveWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePreventiveWorkOrderCommand) =>
      createPreventiveWorkOrder(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["workOrders"] }),
  });
}

export function useUpdateWorkOrderDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateWorkOrderDetailsCommand;
    }) => updateWorkOrderDetails(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      queryClient.invalidateQueries({ queryKey: ["workOrders", id] });
    },
  });
}

export function useUpdateWorkOrderTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateWorkOrderTasksCommand;
    }) => updateWorkOrderTasks(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["workOrders", id] });
    },
  });
}

export function useAssignWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignWorkOrderCommand }) =>
      assignWorkOrder(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      queryClient.invalidateQueries({ queryKey: ["workOrders", id] });
    },
  });
}

export function useScheduleWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ScheduleWorkOrderCommand;
    }) => scheduleWorkOrder(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      queryClient.invalidateQueries({ queryKey: ["workOrders", id] });
    },
  });
}

export function useStartWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StartWorkOrderCommand }) =>
      startWorkOrder(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      queryClient.invalidateQueries({ queryKey: ["workOrders", id] });
    },
  });
}

export function useTerminateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: TerminateWorkOrderCommand;
    }) => terminateWorkOrder(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      queryClient.invalidateQueries({ queryKey: ["workOrders", id] });
    },
  });
}

export function useCancelWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelWorkOrderCommand }) =>
      cancelWorkOrder(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      queryClient.invalidateQueries({ queryKey: ["workOrders", id] });
    },
  });
}

export function useIssueMaterials() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IssueMaterialsCommand }) =>
      issueMaterials(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["workOrders", id] });
    },
  });
}

export function useReturnMaterials() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReturnMaterialsCommand }) =>
      returnMaterials(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["workOrders", id] });
    },
  });
}

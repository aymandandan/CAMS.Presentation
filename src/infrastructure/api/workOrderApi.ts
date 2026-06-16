import axiosClient from "@/infrastructure/api/axiosClient";
import type {
  GetFilteredWorkOrdersQuery,
  WorkOrderListItemDto,
  WorkOrderDetailsDto,
  CreateCorrectiveWorkOrderCommand,
  CreatePreventiveWorkOrderCommand,
  UpdateWorkOrderDetailsCommand,
  UpdateWorkOrderTasksCommand,
  ScheduleWorkOrderCommand,
  StartWorkOrderCommand,
  TerminateWorkOrderCommand,
  CancelWorkOrderCommand,
  IssueMaterialsCommand,
  AssignWorkOrderCommand,
  ReturnMaterialsCommand,
} from "@/domain/workOrders/WorkOrderTypes";
import type { PaginatedList } from "@/domain/shared";
import {
  mapWorkOrderFromApi,
  mapWorkOrderToApi,
} from "@/domain/workOrders/WorkOrderEnumMappings";

function extractData<T>(response: any): T {
  const result = response.data;
  if (!result.succeeded) {
    const message = result.error ?? "Request failed";
    throw new Error(message);
  }
  return result.data;
}

export async function getWorkOrders(
  params: GetFilteredWorkOrdersQuery,
): Promise<PaginatedList<WorkOrderListItemDto>> {
  const queryParams: Record<string, any> = {
    searchTerm: params.searchTerm,
    status: params.status
      ? mapWorkOrderToApi({ status: params.status }).status
      : undefined,
    type: params.type
      ? mapWorkOrderToApi({ type: params.type }).type
      : undefined,
    fromDate: params.fromDate,
    toDate: params.toDate,
    priority: params.priority
      ? mapWorkOrderToApi({ priority: params.priority }).priority
      : undefined,
    equipmentId: params.equipmentId,
    planId: params.planId,
    page: params.page,
    pageSize: params.pageSize,
    isPaginated: params.isPaginated,
  };

  const response = await axiosClient.get("/workorders", {
    params: queryParams,
  });
  const data = extractData<PaginatedList<WorkOrderListItemDto>>(response);
  return {
    ...data,
    items: data.items.map(mapWorkOrderFromApi),
  };
}

export async function getWorkOrder(id: string): Promise<WorkOrderDetailsDto> {
  const response = await axiosClient.get(`/workorders/${id}`);
  const data = extractData<WorkOrderDetailsDto>(response);
  return mapWorkOrderFromApi(data);
}

export async function createCorrectiveWorkOrder(
  data: CreateCorrectiveWorkOrderCommand,
): Promise<string> {
  const mappedData = mapWorkOrderToApi(data);
  const response = await axiosClient.post("/workorders/corrective", mappedData);
  return extractData<string>(response);
}

export async function createPreventiveWorkOrder(
  data: CreatePreventiveWorkOrderCommand,
): Promise<string> {
  const mappedData = mapWorkOrderToApi(data);
  const response = await axiosClient.post("/workorders/preventive", mappedData);
  return extractData<string>(response);
}

export async function updateWorkOrderDetails(
  id: string,
  data: UpdateWorkOrderDetailsCommand,
): Promise<void> {
  const mappedData = mapWorkOrderToApi(data);
  const response = await axiosClient.put(`/workorders/${id}`, {
    ...mappedData,
    workOrderId: id,
  });
  extractData<void>(response);
}

export async function updateWorkOrderTasks(
  id: string,
  data: UpdateWorkOrderTasksCommand,
): Promise<void> {
  const mappedData = mapWorkOrderToApi(data);
  const response = await axiosClient.put(`/workorders/${id}/tasks`, {
    ...mappedData,
    workOrderId: id,
  });
  extractData<void>(response);
}

export async function assignWorkOrder(
  id: string,
  data: AssignWorkOrderCommand,
): Promise<void> {
  const response = await axiosClient.put(`/workorders/${id}/assign`, {
    ...data,
    workOrderId: id,
  });
  extractData<void>(response);
}

export async function scheduleWorkOrder(
  id: string,
  data: ScheduleWorkOrderCommand,
): Promise<void> {
  const response = await axiosClient.put(`/workorders/${id}/schedule`, {
    ...data,
    workOrderId: id,
  });
  extractData<void>(response);
}

export async function startWorkOrder(
  id: string,
  data: StartWorkOrderCommand,
): Promise<void> {
  const response = await axiosClient.put(`/workorders/${id}/start`, {
    ...data,
    workOrderId: id,
  });
  extractData<void>(response);
}

export async function terminateWorkOrder(
  id: string,
  data: TerminateWorkOrderCommand,
): Promise<void> {
  const response = await axiosClient.put(`/workorders/${id}/terminate`, {
    ...data,
    workOrderId: id,
  });
  extractData<void>(response);
}

export async function cancelWorkOrder(
  id: string,
  data: CancelWorkOrderCommand,
): Promise<void> {
  const response = await axiosClient.put(`/workorders/${id}/cancel`, {
    ...data,
    workOrderId: id,
  });
  extractData<void>(response);
}

export async function issueMaterials(
  id: string,
  data: IssueMaterialsCommand,
): Promise<void> {
  const mappedData = mapWorkOrderToApi(data);
  const response = await axiosClient.post(`/workorders/${id}/materials/issue`, {
    ...mappedData,
    workOrderId: id,
  });
  extractData<void>(response);
}

export async function returnMaterials(
  id: string,
  data: ReturnMaterialsCommand,
): Promise<void> {
  const response = await axiosClient.post(
    `/workorders/${id}/materials/return`,
    {
      ...data,
      workOrderId: id,
    },
  );
  extractData<void>(response);
}

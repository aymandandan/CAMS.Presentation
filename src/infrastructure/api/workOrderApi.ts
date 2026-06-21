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
import { extractData, getErrorMessage } from "@/lib/utils/ResponseUtils";

export async function getWorkOrders(
  params: GetFilteredWorkOrdersQuery,
): Promise<PaginatedList<WorkOrderListItemDto>> {
  try {
    const queryParams: Record<string, any> = {
      searchTerm: params.searchTerm,
      statuses: params.statuses, // array → repeated query params
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
      assignedEmployeeId: params.assignedEmployeeId,
      page: params.page,
      pageSize: params.pageSize,
    };

    const response = await axiosClient.get("/workorders", {
      params: queryParams,
    });
    const data = extractData<PaginatedList<WorkOrderListItemDto>>(response);
    return {
      ...data,
      items: data.items.map(mapWorkOrderFromApi),
    };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getMyWorkOrders(
  params: GetFilteredWorkOrdersQuery,
): Promise<PaginatedList<WorkOrderListItemDto>> {
  try {
    const queryParams: Record<string, any> = {
      searchTerm: params.searchTerm,
      statuses: params.statuses,
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
      // assignedEmployeeId is forced by the backend, no need to send
      page: params.page,
      pageSize: params.pageSize,
    };

    const response = await axiosClient.get("/workorders/my", {
      params: queryParams,
    });
    const data = extractData<PaginatedList<WorkOrderListItemDto>>(response);
    return {
      ...data,
      items: data.items.map(mapWorkOrderFromApi),
    };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getWorkOrder(id: string): Promise<WorkOrderDetailsDto> {
  try {
    const response = await axiosClient.get(`/workorders/${id}`);
    const data = extractData<WorkOrderDetailsDto>(response);
    return mapWorkOrderFromApi(data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createCorrectiveWorkOrder(
  data: CreateCorrectiveWorkOrderCommand,
): Promise<string> {
  try {
    const mappedData = mapWorkOrderToApi(data);
    const response = await axiosClient.post(
      "/workorders/corrective",
      mappedData,
    );
    return extractData<string>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createPreventiveWorkOrder(
  data: CreatePreventiveWorkOrderCommand,
): Promise<string> {
  try {
    const mappedData = mapWorkOrderToApi(data);
    const response = await axiosClient.post(
      "/workorders/preventive",
      mappedData,
    );
    return extractData<string>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateWorkOrderDetails(
  id: string,
  data: UpdateWorkOrderDetailsCommand,
): Promise<void> {
  try {
    const mappedData = mapWorkOrderToApi(data);
    const response = await axiosClient.put(`/workorders/${id}`, {
      ...mappedData,
      workOrderId: id,
    });
    extractData<void>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateWorkOrderTasks(
  id: string,
  data: UpdateWorkOrderTasksCommand,
): Promise<void> {
  try {
    const mappedData = mapWorkOrderToApi(data);
    const response = await axiosClient.put(`/workorders/${id}/tasks`, {
      ...mappedData,
      workOrderId: id,
    });
    extractData<void>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function assignWorkOrder(
  id: string,
  data: AssignWorkOrderCommand,
): Promise<void> {
  try {
    const response = await axiosClient.put(`/workorders/${id}/assign`, {
      ...data,
      workOrderId: id,
    });
    extractData<void>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function scheduleWorkOrder(
  id: string,
  data: ScheduleWorkOrderCommand,
): Promise<void> {
  try {
    const response = await axiosClient.put(`/workorders/${id}/schedule`, {
      ...data,
      workOrderId: id,
    });
    extractData<void>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function startWorkOrder(
  id: string,
  data: StartWorkOrderCommand,
): Promise<void> {
  try {
    const response = await axiosClient.put(`/workorders/${id}/start`, {
      ...data,
      workOrderId: id,
    });
    extractData<void>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function terminateWorkOrder(
  id: string,
  data: TerminateWorkOrderCommand,
): Promise<void> {
  try {
    const response = await axiosClient.put(`/workorders/${id}/terminate`, {
      ...data,
      workOrderId: id,
    });
    extractData<void>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function cancelWorkOrder(
  id: string,
  data: CancelWorkOrderCommand,
): Promise<void> {
  try {
    const response = await axiosClient.put(`/workorders/${id}/cancel`, {
      ...data,
      workOrderId: id,
    });
    extractData<void>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function issueMaterials(
  id: string,
  data: IssueMaterialsCommand,
): Promise<void> {
  try {
    const mappedData = mapWorkOrderToApi(data);
    const response = await axiosClient.post(
      `/workorders/${id}/materials/issue`,
      {
        ...mappedData,
        workOrderId: id,
      },
    );
    extractData<void>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function returnMaterials(
  id: string,
  data: ReturnMaterialsCommand,
): Promise<void> {
  try {
    const response = await axiosClient.post(
      `/workorders/${id}/materials/return`,
      {
        ...data,
        workOrderId: id,
      },
    );
    extractData<void>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

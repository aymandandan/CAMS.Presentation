import axiosClient from "@/infrastructure/api/axiosClient";
import type {
  MaintenancePlanListItemDto,
  MaintenancePlanDetailsDto,
  CreateMaintenancePlanRequest,
  UpdateMaintenancePlanRequest,
  MaintenancePlansQueryParams,
} from "@/domain/maintenancePlans/MaintenancePlanTypes";
import { PaginatedList } from "@/domain/shared";
import { extractData, getErrorMessage } from "@/lib/utils/ResponseUtils";

export async function getMaintenancePlans(
  params: MaintenancePlansQueryParams,
): Promise<PaginatedList<MaintenancePlanListItemDto>> {
  try {
    const response = await axiosClient.get("/maintenanceplans", { params });
    return extractData<PaginatedList<MaintenancePlanListItemDto>>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getMaintenancePlanById(
  id: string,
): Promise<MaintenancePlanDetailsDto> {
  try {
    const response = await axiosClient.get(`/maintenanceplans/${id}`);
    return extractData<MaintenancePlanDetailsDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createMaintenancePlan(
  command: CreateMaintenancePlanRequest,
): Promise<string> {
  try {
    const response = await axiosClient.post("/maintenanceplans", command);
    return extractData<string>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateMaintenancePlan(
  id: string,
  command: UpdateMaintenancePlanRequest,
): Promise<void> {
  try {
    const payload = { ...command, planId: id };
    const response = await axiosClient.put(`/maintenanceplans/${id}`, payload);
    extractData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function activateMaintenancePlan(id: string): Promise<void> {
  try {
    const response = await axiosClient.patch(
      `/maintenanceplans/${id}/activate`,
    );
    extractData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deactivateMaintenancePlan(id: string): Promise<void> {
  try {
    const response = await axiosClient.patch(
      `/maintenanceplans/${id}/deactivate`,
    );
    extractData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteMaintenancePlan(id: string): Promise<void> {
  try {
    const response = await axiosClient.delete(`/maintenanceplans/${id}`);
    extractData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

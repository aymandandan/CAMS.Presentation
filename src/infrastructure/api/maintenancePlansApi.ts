import axiosClient from "@/infrastructure/api/axiosClient";
import type {
  MaintenancePlanListItemDto,
  MaintenancePlanDetailsDto,
  CreateMaintenancePlanRequest,
  UpdateMaintenancePlanRequest,
  MaintenancePlansQueryParams,
} from "@/domain/maintenancePlans/MaintenancePlanTypes";
import { PaginatedList } from "@/domain/shared";

function unwrapResult<T>(response: any): T {
  const result = response.data;
  if (!result.succeeded) {
    const firstError = result.errors?.[0]?.description ?? "Request failed";
    throw new Error(firstError);
  }
  return result.data as T;
}

export async function getMaintenancePlans(
  params: MaintenancePlansQueryParams
): Promise<PaginatedList<MaintenancePlanListItemDto>> {
  const response = await axiosClient.get("/maintenanceplans", { params });
  return unwrapResult<PaginatedList<MaintenancePlanListItemDto>>(response);
}

export async function getMaintenancePlanById(
  id: string
): Promise<MaintenancePlanDetailsDto> {
  const response = await axiosClient.get(`/maintenanceplans/${id}`);
  return unwrapResult<MaintenancePlanDetailsDto>(response);
}

export async function createMaintenancePlan(
  command: CreateMaintenancePlanRequest
): Promise<string> {
  const response = await axiosClient.post("/maintenanceplans", command);
  return unwrapResult<string>(response);
}

export async function updateMaintenancePlan(
  id: string,
  command: UpdateMaintenancePlanRequest
): Promise<void> {
  const payload = { ...command, planId: id };
  const response = await axiosClient.put(`/maintenanceplans/${id}`, payload);
  unwrapResult(response);
}

export async function activateMaintenancePlan(id: string): Promise<void> {
  const response = await axiosClient.patch(`/maintenanceplans/${id}/activate`);
  unwrapResult(response);
}

export async function deactivateMaintenancePlan(id: string): Promise<void> {
  const response = await axiosClient.patch(`/maintenanceplans/${id}/deactivate`);
  unwrapResult(response);
}

export async function deleteMaintenancePlan(id: string): Promise<void> {
  const response = await axiosClient.delete(`/maintenanceplans/${id}`);
  unwrapResult(response);
}
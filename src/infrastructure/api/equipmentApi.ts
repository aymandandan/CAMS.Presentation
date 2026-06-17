import axiosClient from "@/infrastructure/api/axiosClient";
import type { Result, PaginatedList } from "@/domain/shared/Result";
import type {
  EquipmentSearchParams,
  CreateEquipmentRequest,
  UpdateEquipmentRequest,
  EquipmentListItemDto,
  EquipmentDetailsDto,
} from "@/domain/equipment/EquipmentTypes";
import {
  mapEquipmentFromApi,
  mapEquipmentToApi,
} from "@/domain/equipment/EquipmentEnumMappings";
import { extractData, getErrorMessage } from "@/lib/utils/ResponseUtils";

/**
 * GET /api/equipment
 */
export async function getEquipments(
  params: EquipmentSearchParams,
): Promise<PaginatedList<EquipmentListItemDto>> {
  try {
    const response = await axiosClient.get<
      Result<PaginatedList<EquipmentListItemDto>>
    >("/equipment", { params });

    const data = extractData<PaginatedList<EquipmentListItemDto>>(response);
    return {
      ...data,
      items: data.items.map(mapEquipmentFromApi),
    };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * GET /api/equipment/{id}
 */
export async function getEquipmentById(
  id: string,
): Promise<EquipmentDetailsDto> {
  try {
    const response = await axiosClient.get<Result<EquipmentDetailsDto>>(
      `/equipment/${id}`,
    );

    return mapEquipmentFromApi(extractData<EquipmentDetailsDto>(response));
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * GET /api/equipment/by-code?code=...
 */
export async function getEquipmentByCode(
  code: string,
): Promise<EquipmentDetailsDto> {
  try {
    const response = await axiosClient.get<Result<EquipmentDetailsDto>>(
      "/equipment/by-code",
      { params: { code } },
    );

    return mapEquipmentFromApi(extractData<EquipmentDetailsDto>(response));
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * POST /api/equipment
 */
export async function createEquipment(
  data: CreateEquipmentRequest,
): Promise<string> {
  try {
    const mappedData = mapEquipmentToApi(data);
    const response = await axiosClient.post<Result<string>>(
      "/equipment",
      mappedData,
    );

    return extractData<string>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * PUT /api/equipment/{id}
 */
export async function updateEquipment(
  id: string,
  data: UpdateEquipmentRequest,
): Promise<void> {
  try {
    const response = await axiosClient.put<Result>(`/equipment/${id}`, data);
    extractData<void>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * PATCH /api/equipment/{id}/maintenance
 */
export async function markUnderMaintenance(id: string): Promise<void> {
  try {
    const response = await axiosClient.patch<Result>(
      `/equipment/${id}/maintenance`,
    );
    extractData<void>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * PATCH /api/equipment/{id}/decommission
 */
export async function decommissionEquipment(id: string): Promise<void> {
  try {
    const response = await axiosClient.patch<Result>(
      `/equipment/${id}/decommission`,
    );
    extractData<void>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * DELETE /api/equipment/{id}
 */
export async function deleteEquipment(id: string): Promise<void> {
  try {
    const response = await axiosClient.delete<Result>(`/equipment/${id}`);
    extractData<void>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

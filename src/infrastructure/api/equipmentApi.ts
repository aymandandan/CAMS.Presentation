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

/**
 * GET /api/equipment
 */
export async function getEquipments(
  params: EquipmentSearchParams,
): Promise<PaginatedList<EquipmentListItemDto>> {
  const response = await axiosClient.get<
    Result<PaginatedList<EquipmentListItemDto>>
  >("/equipment", { params });
  if (!response.data.succeeded) {
    throw new Error(
      response.data.errors?.[0]?.description ||
        response.data.error ||
        "Failed to fetch equipment",
    );
  }
  const data = response.data.data!;
  return {
    ...data,
    items: data.items.map(mapEquipmentFromApi),
  };
}

/**
 * GET /api/equipment/{id}
 */
export async function getEquipmentById(
  id: string,
): Promise<EquipmentDetailsDto> {
  const response = await axiosClient.get<Result<EquipmentDetailsDto>>(
    `/equipment/${id}`,
  );
  if (!response.data.succeeded) {
    throw new Error(
      response.data.errors?.[0]?.description ||
        response.data.error ||
        "Failed to fetch equipment",
    );
  }
  return mapEquipmentFromApi(response.data.data!);
}

/**
 * GET /api/equipment/by-code?code=...
 */
export async function getEquipmentByCode(
  code: string,
): Promise<EquipmentDetailsDto> {
  const response = await axiosClient.get<Result<EquipmentDetailsDto>>(
    "/equipment/by-code",
    { params: { code } },
  );
  if (!response.data.succeeded) {
    throw new Error(
      response.data.errors?.[0]?.description ||
        response.data.error ||
        "Failed to fetch equipment by code",
    );
  }
  return mapEquipmentFromApi(response.data.data!);
}

/**
 * POST /api/equipment
 */
export async function createEquipment(
  data: CreateEquipmentRequest,
): Promise<string> {
  const mappedData = mapEquipmentToApi(data);
  const response = await axiosClient.post<Result<string>>(
    "/equipment",
    mappedData,
  );
  if (!response.data.succeeded) {
    throw new Error(
      response.data.errors?.[0]?.description ||
        response.data.error ||
        "Failed to create equipment",
    );
  }
  return response.data.data!;
}

/**
 * PUT /api/equipment/{id}
 */
export async function updateEquipment(
  id: string,
  data: UpdateEquipmentRequest,
): Promise<void> {
  // UpdateEquipmentRequest does not contain a status field, so no mapping needed.
  // But if it ever did, we would call mapEquipmentToApi here.
  const response = await axiosClient.put<Result>(`/equipment/${id}`, data);
  if (!response.data.succeeded) {
    throw new Error(
      response.data.errors?.[0]?.description ||
        response.data.error ||
        "Failed to update equipment",
    );
  }
}

/**
 * PATCH /api/equipment/{id}/maintenance
 */
export async function markUnderMaintenance(id: string): Promise<void> {
  const response = await axiosClient.patch<Result>(
    `/equipment/${id}/maintenance`,
  );
  if (!response.data.succeeded) {
    throw new Error(
      response.data.errors?.[0]?.description ||
        response.data.error ||
        "Failed to mark equipment under maintenance",
    );
  }
}

/**
 * PATCH /api/equipment/{id}/decommission
 */
export async function decommissionEquipment(id: string): Promise<void> {
  const response = await axiosClient.patch<Result>(
    `/equipment/${id}/decommission`,
  );
  if (!response.data.succeeded) {
    throw new Error(
      response.data.errors?.[0]?.description ||
        response.data.error ||
        "Failed to decommission equipment",
    );
  }
}

/**
 * DELETE /api/equipment/{id}
 */
export async function deleteEquipment(id: string): Promise<void> {
  const response = await axiosClient.delete<Result>(`/equipment/${id}`);
  if (!response.data.succeeded) {
    throw new Error(
      response.data.errors?.[0]?.description ||
        response.data.error ||
        "Failed to delete equipment",
    );
  }
}

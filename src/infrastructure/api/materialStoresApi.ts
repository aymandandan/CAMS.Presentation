import axiosClient from "@/infrastructure/api/axiosClient";
import type { Result, PaginatedList } from "@/domain/shared/Result";
import type {
  MaterialStoreDto,
  CreateMaterialStoreCommand,
  UpdateMaterialStoreCommand,
  MaterialStoreQueryParams,
} from "@/domain/materialStores/MaterialStoreTypes";

/**
 * Retrieves a paginated list of material stores.
 */
export async function getMaterialStores(
  params: MaterialStoreQueryParams,
): Promise<PaginatedList<MaterialStoreDto>> {
  const response = await axiosClient.get<
    Result<PaginatedList<MaterialStoreDto>>
  >("/materialstores", {
    params: {
      PageNumber: params.page,
      PageSize: params.pageSize,
      SearchTerm: params.searchTerm || undefined,
      SortBy: params.sortBy || undefined,
      SortDirection: params.sortDirection || undefined,
    },
  });

  if (!response.data.succeeded) {
    const firstError =
      response.data.errors?.[0]?.description ||
      "Failed to fetch material stores";
    throw new Error(firstError);
  }

  return response.data.data!;
}

/**
 * Retrieves a single material store by ID.
 */
export async function getMaterialStoreById(
  id: string,
): Promise<MaterialStoreDto> {
  const response = await axiosClient.get<Result<MaterialStoreDto>>(
    `/materialstores/${id}`,
  );

  if (!response.data.succeeded) {
    const firstError =
      response.data.errors?.[0]?.description || "Material store not found";
    throw new Error(firstError);
  }

  return response.data.data!;
}

/**
 * Creates a new material store.
 */
export async function createMaterialStore(
  command: CreateMaterialStoreCommand,
): Promise<MaterialStoreDto> {
  const response = await axiosClient.post<Result<MaterialStoreDto>>(
    "/materialstores",
    command,
  );

  if (!response.data.succeeded) {
    const firstError =
      response.data.errors?.[0]?.description || "Creation failed";
    throw new Error(firstError);
  }

  return response.data.data!;
}

/**
 * Updates an existing material store.
 * Returns nothing on success (204 No Content).
 */
export async function updateMaterialStore(
  command: UpdateMaterialStoreCommand,
): Promise<void> {
  const response = await axiosClient.put<Result>(
    `/materialstores/${command.id}`,
    command,
  );

  if (!response.data.succeeded) {
    const firstError =
      response.data.errors?.[0]?.description || "Update failed";
    throw new Error(firstError);
  }
}

/**
 * Deletes a material store.
 * Returns nothing on success (204 No Content).
 */
export async function deleteMaterialStore(id: string): Promise<void> {
  const response = await axiosClient.delete<Result>(`/materialstores/${id}`);

  if (!response.data.succeeded) {
    const firstError =
      response.data.errors?.[0]?.description || "Deletion failed";
    throw new Error(firstError);
  }
}

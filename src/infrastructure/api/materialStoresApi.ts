import axiosClient from "@/infrastructure/api/axiosClient";
import type { Result, PaginatedList } from "@/domain/shared/Result";
import type {
  MaterialStoreDto,
  CreateMaterialStoreCommand,
  UpdateMaterialStoreCommand,
  MaterialStoreQueryParams,
} from "@/domain/materialStores/MaterialStoreTypes";
import { extractData, getErrorMessage } from "@/lib/utils/ResponseUtils";
/**
 * Retrieves a paginated list of material stores.
 */
export async function getMaterialStores(
  params: MaterialStoreQueryParams,
): Promise<PaginatedList<MaterialStoreDto>> {
  try {
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

    return extractData<PaginatedList<MaterialStoreDto>>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Retrieves a single material store by ID.
 */
export async function getMaterialStoreById(
  id: string,
): Promise<MaterialStoreDto> {
  try {
    const response = await axiosClient.get<Result<MaterialStoreDto>>(
      `/materialstores/${id}`,
    );

    return extractData<MaterialStoreDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Creates a new material store.
 */
export async function createMaterialStore(
  command: CreateMaterialStoreCommand,
): Promise<MaterialStoreDto> {
  try {
    const response = await axiosClient.post<Result<MaterialStoreDto>>(
      "/materialstores",
      command,
    );

    return extractData<MaterialStoreDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Updates an existing material store.
 * Returns nothing on success (204 No Content).
 */
export async function updateMaterialStore(
  command: UpdateMaterialStoreCommand,
): Promise<void> {
  try {
    const response = await axiosClient.put<Result>(
      `/materialstores/${command.id}`,
      command,
    );

    return extractData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Deletes a material store.
 * Returns nothing on success (204 No Content).
 */
export async function deleteMaterialStore(id: string): Promise<void> {
  try {
    const response = await axiosClient.delete<Result>(`/materialstores/${id}`);

    return extractData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

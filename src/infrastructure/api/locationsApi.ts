import axiosClient from "@/infrastructure/api/axiosClient";
import type {
  LocationDto,
  LocationPathDto,
  CreateLocationRequest,
  UpdateLocationRequest,
  ChangeLocationParentRequest,
  GetLocationsQueryParams,
  LocationDetailsDto,
} from "@/domain/locations/LocationTypes";
import type { PaginatedList, Result } from "@/domain/shared/Result";
import {
  mapLocationToApi,
  mapLocationFromApi,
} from "@/domain/locations/LocationEnumMappings";

function throwIfFailed<T>(response: { data: Result<T> }): T {
  const result = response.data;
  if (!result.succeeded) {
    console.error("API Error:", result);
    const message =
      result.errors?.[0]?.description || result.error || "Request failed";
    throw new Error(message);
  }
  return result.data as T;
}

export const locationsApi = {
  getAll: async (
    params: GetLocationsQueryParams,
  ): Promise<PaginatedList<LocationDto>> => {
    const mappedParams = mapLocationToApi(params);
    const response = await axiosClient.get<Result<PaginatedList<LocationDto>>>(
      "/locations",
      { params: mappedParams },
    );
    const data = throwIfFailed(response);
    return {
      ...data,
      items: data.items.map(mapLocationFromApi),
    };
  },

  getById: async (id: string): Promise<LocationDetailsDto> => {
    const response = await axiosClient.get<Result<LocationDetailsDto>>(
      `/locations/${id}`,
    );
    return mapLocationFromApi(throwIfFailed(response));
  },

  getByCode: async (code: string): Promise<LocationDetailsDto> => {
    const response = await axiosClient.get<Result<LocationDetailsDto>>(
      "/locations/by-code",
      { params: { code } },
    );
    return mapLocationFromApi(throwIfFailed(response));
  },

  getChildren: async (parentId: string): Promise<LocationDto[]> => {
    const response = await axiosClient.get<Result<LocationDto[]>>(
      `/locations/${parentId}/children`,
    );
    return throwIfFailed(response).map(mapLocationFromApi);
  },

  getPath: async (id: string): Promise<LocationPathDto> => {
    const response = await axiosClient.get<Result<LocationPathDto>>(
      `/locations/${id}/path`,
    );
    return throwIfFailed(response);
  },

  create: async (data: CreateLocationRequest): Promise<string> => {
    const mappedData = mapLocationToApi(data);
    const response = await axiosClient.post<Result<string>>(
      "/locations",
      mappedData,
    );
    return throwIfFailed(response);
  },

  update: async (id: string, data: UpdateLocationRequest): Promise<void> => {
    // Update request does not contain type, no mapping needed
    const response = await axiosClient.put<Result>(`/locations/${id}`, {
      ...data,
      id,
    });
    throwIfFailed(response);
  },

  changeParent: async (
    id: string,
    request: ChangeLocationParentRequest,
  ): Promise<void> => {
    const response = await axiosClient.patch<Result>(
      `/locations/${id}/change-parent`,
      request,
    );
    throwIfFailed(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await axiosClient.delete<Result>(`/locations/${id}`);
    throwIfFailed(response);
  },
};

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
import { extractData, getErrorMessage } from "@/lib/utils/ResponseUtils";

export const locationsApi = {
  getAll: async (
    params: GetLocationsQueryParams,
  ): Promise<PaginatedList<LocationDto>> => {
    try {
      const mappedParams = mapLocationToApi(params);
      const response = await axiosClient.get<
        Result<PaginatedList<LocationDto>>
      >("/locations", { params: mappedParams });

      const data = extractData<PaginatedList<LocationDto>>(response);
      return {
        ...data,
        items: data.items.map(mapLocationFromApi),
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getById: async (id: string): Promise<LocationDetailsDto> => {
    try {
      const response = await axiosClient.get<Result<LocationDetailsDto>>(
        `/locations/${id}`,
      );

      return mapLocationFromApi(extractData<LocationDetailsDto>(response));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getByCode: async (code: string): Promise<LocationDetailsDto> => {
    try {
      const response = await axiosClient.get<Result<LocationDetailsDto>>(
        "/locations/by-code",
        { params: { code } },
      );

      return mapLocationFromApi(extractData<LocationDetailsDto>(response));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getChildren: async (parentId: string): Promise<LocationDto[]> => {
    try {
      const response = await axiosClient.get<Result<LocationDto[]>>(
        `/locations/${parentId}/children`,
      );

      return extractData<LocationDto[]>(response).map(mapLocationFromApi);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getPath: async (id: string): Promise<LocationPathDto> => {
    try {
      const response = await axiosClient.get<Result<LocationPathDto>>(
        `/locations/${id}/path`,
      );

      return extractData<LocationPathDto>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  create: async (data: CreateLocationRequest): Promise<string> => {
    try {
      const mappedData = mapLocationToApi(data);
      const response = await axiosClient.post<Result<string>>(
        "/locations",
        mappedData,
      );

      return extractData<string>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  update: async (id: string, data: UpdateLocationRequest): Promise<void> => {
    try {
      // Update request does not contain type, no mapping needed
      const response = await axiosClient.put<Result>(`/locations/${id}`, {
        ...data,
        id,
      });

      return extractData<void>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  changeParent: async (
    id: string,
    request: ChangeLocationParentRequest,
  ): Promise<void> => {
    try {
      const response = await axiosClient.patch<Result>(
        `/locations/${id}/change-parent`,
        request,
      );

      return extractData<void>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await axiosClient.delete<Result>(`/locations/${id}`);

      return extractData<void>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

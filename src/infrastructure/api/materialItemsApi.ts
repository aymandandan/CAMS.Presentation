import type {
  MaterialItemListItemDto,
  MaterialItemDetailsDto,
  GetMaterialItemsQueryParams,
  CreateMaterialItemRequest,
  UpdateMaterialItemRequest,
  ReserveStockRequest,
  ReleaseReservationRequest,
  AdjustStockRequest,
  TransferStockRequest,
  AddItemToStoresRequest,
} from "@/domain/materialItems/MaterialItemTypes";
import { PaginatedList, Result } from "@/domain/shared";
import axiosClient from "./axiosClient";
import { extractData, getErrorMessage } from "@/lib/utils/ResponseUtils";

export const materialItemsApi = {
  getAll: async (params: GetMaterialItemsQueryParams) => {
    try {
      const response = await axiosClient.get<
        Result<PaginatedList<MaterialItemListItemDto>>
      >("/materialitems", { params });
      return extractData<PaginatedList<MaterialItemListItemDto>>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getById: async (id: string) => {
    try {
      const response = await axiosClient.get<Result<MaterialItemDetailsDto>>(
        `/materialitems/${id}`,
      );
      return extractData<MaterialItemDetailsDto>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getBySku: async (sku: string) => {
    try {
      const response = await axiosClient.get<Result<MaterialItemDetailsDto>>(
        "/materialitems/by-sku",
        { params: { sku } },
      );
      return extractData<MaterialItemDetailsDto>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  create: async (command: CreateMaterialItemRequest) => {
    try {
      const response = await axiosClient.post<Result<string>>(
        "/materialitems",
        command,
      );
      return extractData<string>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  update: async (id: string, command: UpdateMaterialItemRequest) => {
    try {
      const response = await axiosClient.put<Result>(
        `/materialitems/${id}`,
        command,
      );
      return extractData(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  delete: async (id: string) => {
    try {
      const response = await axiosClient.delete<Result>(`/materialitems/${id}`);
      return extractData(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  reserveStock: async (id: string, command: ReserveStockRequest) => {
    try {
      const response = await axiosClient.post<Result>(
        `/materialitems/${id}/reserve`,
        { ...command, materialItemId: id },
      );
      return extractData(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  releaseReservation: async (
    id: string,
    command: ReleaseReservationRequest,
  ) => {
    try {
      const response = await axiosClient.post<Result>(
        `/materialitems/${id}/release-reservation`,
        { ...command, materialItemId: id },
      );
      return extractData(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  adjustStock: async (id: string, command: AdjustStockRequest) => {
    try {
      const response = await axiosClient.post<Result>(
        `/materialitems/${id}/adjust`,
        { ...command, materialItemId: id },
      );
      return extractData(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  transferStock: async (id: string, command: TransferStockRequest) => {
    try {
      const response = await axiosClient.post<Result>(
        `/materialitems/${id}/transfer`,
        { ...command, materialItemId: id },
      );
      return extractData(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  addToStores: async (id: string, command: AddItemToStoresRequest) => {
    try {
      const response = await axiosClient.post<Result>(
        `/materialitems/${id}/add-to-stores`,
        { ...command, materialItemId: id },
      );
      return extractData(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

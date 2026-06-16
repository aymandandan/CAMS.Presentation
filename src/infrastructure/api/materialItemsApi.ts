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
} from '@/domain/materialItems/MaterialItemTypes';
import { PaginatedList, Result } from '@/domain/shared';
import axiosClient from './axiosClient';

function unwrap<T>(response: { data: Result<T> }): T {
  const result = response.data;
  if (!result.succeeded) {
    const firstError = result.errors?.[0]?.description ?? result.error ?? 'Request failed';
    throw new Error(firstError);
  }
  return result.data as T;
}

export const materialItemsApi = {
  getAll: async (params: GetMaterialItemsQueryParams) => {
    const response = await axiosClient.get<Result<PaginatedList<MaterialItemListItemDto>>>(
      '/materialitems',
      { params }
    );
    return unwrap(response);
  },

  getById: async (id: string) => {
    const response = await axiosClient.get<Result<MaterialItemDetailsDto>>(
      `/materialitems/${id}`
    );
    return unwrap(response);
  },

  getBySku: async (sku: string) => {
    const response = await axiosClient.get<Result<MaterialItemDetailsDto>>(
      '/materialitems/by-sku',
      { params: { sku } }
    );
    return unwrap(response);
  },

  create: async (command: CreateMaterialItemRequest) => {
    const response = await axiosClient.post<Result<string>>('/materialitems', command);
    return unwrap(response);
  },

  update: async (id: string, command: UpdateMaterialItemRequest) => {
    const response = await axiosClient.put<Result>(`/materialitems/${id}`, command);
    unwrap(response);
  },

  delete: async (id: string) => {
    const response = await axiosClient.delete<Result>(`/materialitems/${id}`);
    unwrap(response);
  },

  reserveStock: async (id: string, command: ReserveStockRequest) => {
    const response = await axiosClient.post<Result>(
      `/materialitems/${id}/reserve`,
      { ...command, materialItemId: id }
    );
    unwrap(response);
  },

  releaseReservation: async (id: string, command: ReleaseReservationRequest) => {
    const response = await axiosClient.post<Result>(
      `/materialitems/${id}/release-reservation`,
      { ...command, materialItemId: id }
    );
    unwrap(response);
  },

  adjustStock: async (id: string, command: AdjustStockRequest) => {
    const response = await axiosClient.post<Result>(
      `/materialitems/${id}/adjust`,
      { ...command, materialItemId: id }
    );
    unwrap(response);
  },

  transferStock: async (id: string, command: TransferStockRequest) => {
    const response = await axiosClient.post<Result>(
      `/materialitems/${id}/transfer`,
      { ...command, materialItemId: id }
    );
    unwrap(response);
  },

  addToStores: async (id: string, command: AddItemToStoresRequest) => {
    const response = await axiosClient.post<Result>(
      `/materialitems/${id}/add-to-stores`,
      { ...command, materialItemId: id }
    );
    unwrap(response);
  },
};
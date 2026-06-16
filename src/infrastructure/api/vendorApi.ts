import axiosClient from '@/infrastructure/api/axiosClient';
import type { Result } from '@/domain/shared/Result';
import type {
  VendorDto,
  VendorPaginatedList,
  VendorListParams,
  CreateVendorRequest,
  UpdateVendorRequest,
} from '@/domain/vendors/VendorTypes';

function extractData<T>(response: Result<T>): T {
  if (!response.succeeded) {
    const msg =
      response.errors?.[0]?.description ??
      response.error ??
      'An unknown error occurred';
    throw new Error(msg);
  }
  return response.data as T;
}

export const vendorApi = {
  async getList(params: VendorListParams): Promise<VendorPaginatedList> {
    const response = await axiosClient.get<Result<VendorPaginatedList>>(
      '/vendors',
      { params }
    );
    return extractData(response.data);
  },

  async getById(id: string): Promise<VendorDto> {
    const response = await axiosClient.get<Result<VendorDto>>(`/vendors/${id}`);
    return extractData(response.data);
  },

  async create(data: CreateVendorRequest): Promise<string> {
    const response = await axiosClient.post<Result<string>>('/vendors', data);
    return extractData(response.data);
  },

  async update(id: string, data: UpdateVendorRequest): Promise<VendorDto> {
    const response = await axiosClient.put<Result<VendorDto>>(
      `/vendors/${id}`,
      data
    );
    return extractData(response.data);
  },

  async delete(id: string): Promise<void> {
    const response = await axiosClient.delete<Result>(`/vendors/${id}`);
    extractData(response.data);
  },
};
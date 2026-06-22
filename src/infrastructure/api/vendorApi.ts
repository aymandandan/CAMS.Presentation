import axiosClient from "@/infrastructure/api/axiosClient";
import type { Result } from "@/domain/shared/Result";
import type {
  VendorDto,
  VendorPaginatedList,
  VendorListParams,
  CreateVendorRequest,
  UpdateVendorRequest,
} from "@/domain/vendors/VendorTypes";
import { extractData, getErrorMessage } from "@/lib/utils/ResponseUtils";

export const vendorApi = {
  async getList(params: VendorListParams): Promise<VendorPaginatedList> {
    try {
      const response = await axiosClient.get<Result<VendorPaginatedList>>(
        "/vendors",
        { params },
      );
      return extractData<VendorPaginatedList>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getById(id: string): Promise<VendorDto> {
    try {
      const response = await axiosClient.get<Result<VendorDto>>(
        `/vendors/${id}`,
      );
      return extractData<VendorDto>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async create(data: CreateVendorRequest): Promise<string> {
    try {
      const response = await axiosClient.post<Result<string>>("/vendors", data);
      return extractData<string>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async update(id: string, data: UpdateVendorRequest): Promise<VendorDto> {
    try {
      const response = await axiosClient.put<Result<VendorDto>>(
        `/vendors/${id}`,
        data,
      );
      return extractData<VendorDto>(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const response = await axiosClient.delete<Result>(`/vendors/${id}`);
      extractData(response);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

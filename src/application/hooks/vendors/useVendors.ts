import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorApi } from "@/infrastructure/api/vendorApi";
import type {
  VendorDto,
  VendorPaginatedList,
  VendorListParams,
  CreateVendorRequest,
  UpdateVendorRequest,
} from "@/domain/vendors/VendorTypes";

// --- Query Keys ---
export const vendorKeys = {
  all: ["vendors"] as const,
  lists: () => [...vendorKeys.all, "list"] as const,
  list: (params: VendorListParams) => [...vendorKeys.lists(), params] as const,
  details: () => [...vendorKeys.all, "detail"] as const,
  detail: (id: string) => [...vendorKeys.details(), id] as const,
};

// --- Queries ---
export function useVendors(
  params: VendorListParams,
  options?: { enabled?: boolean },
) {
  const query = useQuery<VendorPaginatedList, Error>({
    queryKey: vendorKeys.list(params),
    queryFn: () => vendorApi.getList(params),
    // keepPreviousData: true,
    ...options,
  });
  return { ...query, refetch: query.refetch };
}

export function useVendor(id: string | undefined) {
  return useQuery<VendorDto, Error>({
    queryKey: vendorKeys.detail(id!),
    queryFn: () => vendorApi.getById(id!),
    enabled: !!id,
  });
}

// --- Mutations ---
export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation<string, Error, CreateVendorRequest>({
    mutationFn: (data) => vendorApi.create(data),
    onSuccess: () => {
      // Invalidate all vendor list queries
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation<VendorDto, Error, UpdateVendorRequest>({
    mutationFn: (data) => vendorApi.update(data.vendorId, data),
    onSuccess: (updatedVendor) => {
      // Update the detail cache and invalidate lists
      queryClient.setQueryData(
        vendorKeys.detail(updatedVendor.id),
        updatedVendor,
      );
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => vendorApi.delete(id),
    onSuccess: (_, id) => {
      // Remove detail from cache and invalidate lists
      queryClient.removeQueries({ queryKey: vendorKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
    },
  });
}

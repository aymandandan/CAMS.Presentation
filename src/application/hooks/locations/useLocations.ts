import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import type {
  GetLocationsQueryParams,
  CreateLocationRequest,
  UpdateLocationRequest,
  ChangeLocationParentRequest,
  LocationDetailsDto,
} from "@/domain/locations/LocationTypes";
import { locationsApi } from "@/infrastructure/api/locationsApi";

// Query key factory
const locationKeys = {
  all: ["locations"] as const,
  lists: () => [...locationKeys.all, "list"] as const,
  list: (params: GetLocationsQueryParams) =>
    [...locationKeys.lists(), params] as const,
  details: () => [...locationKeys.all, "detail"] as const,
  detail: (id: string) => [...locationKeys.details(), id] as const,
  children: (parentId: string) =>
    [...locationKeys.all, "children", parentId] as const,
  path: (id: string) => [...locationKeys.all, "path", id] as const,
  byCode: (code: string) => [...locationKeys.all, "byCode", code] as const,
};

// Queries
export function useLocations(
  params: GetLocationsQueryParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: locationKeys.list(params),
    queryFn: () => locationsApi.getAll(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useLocation(id: string | undefined) {
  return useQuery<LocationDetailsDto>({
    queryKey: locationKeys.detail(id!),
    queryFn: () => locationsApi.getById(id!),
    enabled: !!id,
  });
}

export function useLocationByCode(code: string | undefined) {
  return useQuery<LocationDetailsDto>({
    queryKey: locationKeys.byCode(code!),
    queryFn: () => locationsApi.getByCode(code!),
    enabled: !!code,
  });
}

export function useLocationChildren(parentId: string | undefined) {
  return useQuery({
    queryKey: locationKeys.children(parentId!),
    queryFn: () => locationsApi.getChildren(parentId!),
    enabled: !!parentId,
  });
}

export function useLocationPath(id: string | undefined) {
  return useQuery({
    queryKey: locationKeys.path(id!),
    queryFn: () => locationsApi.getPath(id!),
    enabled: !!id,
  });
}

// Mutations
export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLocationRequest) => locationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocationRequest }) =>
      locationsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: locationKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: locationsApi.delete,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: locationKeys.detail(id),
      });
    },
  });
}

export function useChangeLocationParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: ChangeLocationParentRequest;
    }) => locationsApi.changeParent(id, request),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: locationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: locationKeys.children(id) });
      queryClient.invalidateQueries({ queryKey: locationKeys.path(id) });
    },
  });
}

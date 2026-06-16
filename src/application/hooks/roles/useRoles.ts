import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    createRole,
    deleteRole,
  getAllRoles,
  getRoleById,
  getRoleByName,
  roleExists,
  updateRole,
  updateUserRoles,
} from '@/infrastructure/api/roleApi';
import { userKeys } from '../users/useUsers';

export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
  byName: (name: string) => [...roleKeys.all, 'byName', name] as const,
  exists: (name: string) => [...roleKeys.all, 'exists', name] as const,
};

// Queries
export function useRoles() {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: getAllRoles,
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => getRoleById(id),
    enabled: !!id,
  });
}

export function useRoleByName(name: string) {
  return useQuery({
    queryKey: roleKeys.byName(name),
    queryFn: () => getRoleByName(name),
    enabled: !!name,
  });
}

export function useRoleExists(name: string) {
  return useQuery({
    queryKey: roleKeys.exists(name),
    queryFn: () => roleExists(name),
    enabled: !!name,
  });
}

// Mutations
export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
}

export function useUpdateRole(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateRole>[1]) => updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
}

export function useUpdateUserRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserRoles,
    onSuccess: (_, variables) => {
      // Invalidate the user whose roles changed
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.userId) });
      // Invalidate all user lists (they may show roles)
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
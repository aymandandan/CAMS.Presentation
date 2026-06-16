import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  checkUserPermission,
  getUserPermissions,
  getRolePermissions,
  grantPermissionToRole,
  grantPermissionToUser,
  revokePermissionFromRole,
  revokePermissionFromUser,
  batchGrantPermissionsToRole,
  batchGrantPermissionsToUser,
  batchRevokePermissionsFromRole,
  batchRevokePermissionsFromUser,
} from '@/infrastructure/api/permissionApi';

export const permissionKeys = {
  all: ['permissions'] as const,
  userCheck: (userId: string, permissionName: string) =>
    [...permissionKeys.all, 'check', userId, permissionName] as const,
  userPermissions: (userId: string) =>
    [...permissionKeys.all, 'user', userId] as const,
  rolePermissions: (roleName: string) =>
    [...permissionKeys.all, 'role', roleName] as const,
};

// Queries
export function useCheckUserPermission(userId: string, permissionName: string) {
  return useQuery({
    queryKey: permissionKeys.userCheck(userId, permissionName),
    queryFn: () => checkUserPermission(userId, permissionName),
    enabled: !!userId && !!permissionName,
  });
}

export function useUserPermissions(userId: string) {
  return useQuery({
    queryKey: permissionKeys.userPermissions(userId),
    queryFn: () => getUserPermissions(userId),
    enabled: !!userId,
  });
}

export function useRolePermissions(roleName: string) {
  return useQuery({
    queryKey: permissionKeys.rolePermissions(roleName),
    queryFn: () => getRolePermissions(roleName),
    enabled: !!roleName,
  });
}

// Mutations
export function useGrantUserPermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, permissionName }: { userId: string; permissionName: string }) =>
      grantPermissionToUser(userId, permissionName),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.userPermissions(userId) });
    },
  });
}

export function useRevokeUserPermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, permissionName }: { userId: string; permissionName: string }) =>
      revokePermissionFromUser(userId, permissionName),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.userPermissions(userId) });
    },
  });
}

export function useGrantRolePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleName, permissionName }: { roleName: string; permissionName: string }) =>
      grantPermissionToRole(roleName, permissionName),
    onSuccess: (_, { roleName }) => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.rolePermissions(roleName) });
    },
  });
}

export function useRevokeRolePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleName, permissionName }: { roleName: string; permissionName: string }) =>
      revokePermissionFromRole(roleName, permissionName),
    onSuccess: (_, { roleName }) => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.rolePermissions(roleName) });
    },
  });
}


// Batch mutations
export function useBatchGrantUserPermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, permissionNames }: { userId: string; permissionNames: string[] }) =>
      batchGrantPermissionsToUser(userId, permissionNames),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.userPermissions(userId) });
    },
  });
}

export function useBatchRevokeUserPermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, permissionNames }: { userId: string; permissionNames: string[] }) =>
      batchRevokePermissionsFromUser(userId, permissionNames),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.userPermissions(userId) });
    },
  });
}

export function useBatchGrantRolePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleName, permissionNames }: { roleName: string; permissionNames: string[] }) =>
      batchGrantPermissionsToRole(roleName, permissionNames),
    onSuccess: (_, { roleName }) => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.rolePermissions(roleName) });
    },
  });
}

export function useBatchRevokeRolePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleName, permissionNames }: { roleName: string; permissionNames: string[] }) =>
      batchRevokePermissionsFromRole(roleName, permissionNames),
    onSuccess: (_, { roleName }) => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.rolePermissions(roleName) });
    },
  });
}

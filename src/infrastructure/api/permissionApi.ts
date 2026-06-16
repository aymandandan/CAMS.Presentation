import axiosClient from './axiosClient';
import type { Result } from '@/domain/shared/Result';
import type { BatchPermissionsRequest, PermissionDto } from '@/domain/permissions/PermissionTypes';

function extractData<T>(response: { data: Result<T> }): T {
  const result = response.data;
  if (!result.succeeded) {
    const message = result.errors?.[0]?.description || result.error || 'Request failed';
    throw new Error(message);
  }
  return result.data as T;
}

// Queries
export async function checkUserPermission(userId: string, permissionName: string): Promise<boolean> {
  const response = await axiosClient.get<Result<boolean>>(
    `/permissions/users/${userId}/check/${encodeURIComponent(permissionName)}`,
  );
  return extractData(response);
}

export async function getUserPermissions(userId: string): Promise<PermissionDto[]> {
  const response = await axiosClient.get<Result<PermissionDto[]>>(`/permissions/users/${userId}`);
  return extractData(response);
}

export async function getRolePermissions(roleName: string): Promise<PermissionDto[]> {
  const response = await axiosClient.get<Result<PermissionDto[]>>(
    `/permissions/roles/${encodeURIComponent(roleName)}`,
  );
  return extractData(response);
}

// Commands (grant / revoke)
export async function grantPermissionToUser(userId: string, permissionName: string): Promise<void> {
  await axiosClient.post<Result>(
    `/permissions/users/${userId}/grant/${encodeURIComponent(permissionName)}`,
  );
}

export async function revokePermissionFromUser(userId: string, permissionName: string): Promise<void> {
  await axiosClient.post<Result>(
    `/permissions/users/${userId}/revoke/${encodeURIComponent(permissionName)}`,
  );
}

export async function grantPermissionToRole(roleName: string, permissionName: string): Promise<void> {
  await axiosClient.post<Result>(
    `/permissions/roles/${encodeURIComponent(roleName)}/grant/${encodeURIComponent(permissionName)}`,
  );
}

export async function revokePermissionFromRole(roleName: string, permissionName: string): Promise<void> {
  await axiosClient.post<Result>(
    `/permissions/roles/${encodeURIComponent(roleName)}/revoke/${encodeURIComponent(permissionName)}`,
  );
}

// Batch operations
export async function batchGrantPermissionsToUser(
  userId: string,
  permissionNames: string[],
): Promise<void> {
  await axiosClient.post<Result>(
    `/permissions/users/${userId}/batch-grant`,
    { permissionNames } as BatchPermissionsRequest,
  );
}

export async function batchRevokePermissionsFromUser(
  userId: string,
  permissionNames: string[],
): Promise<void> {
  await axiosClient.post<Result>(
    `/permissions/users/${userId}/batch-revoke`,
    { permissionNames } as BatchPermissionsRequest,
  );
}

export async function batchGrantPermissionsToRole(
  roleName: string,
  permissionNames: string[],
): Promise<void> {
  await axiosClient.post<Result>(
    `/permissions/roles/${encodeURIComponent(roleName)}/batch-grant`,
    { permissionNames } as BatchPermissionsRequest,
  );
}

export async function batchRevokePermissionsFromRole(
  roleName: string,
  permissionNames: string[],
): Promise<void> {
  await axiosClient.post<Result>(
    `/permissions/roles/${encodeURIComponent(roleName)}/batch-revoke`,
    { permissionNames } as BatchPermissionsRequest,
  );
}
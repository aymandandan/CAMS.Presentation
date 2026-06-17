import axiosClient from "./axiosClient";
import type { Result } from "@/domain/shared/Result";
import type {
  BatchPermissionsRequest,
  PermissionDto,
} from "@/domain/permissions/PermissionTypes";
import { extractData, getErrorMessage } from "@/lib/utils/ResponseUtils";

// Queries
export async function checkUserPermission(
  userId: string,
  permissionName: string,
): Promise<boolean> {
  try {
    const response = await axiosClient.get<Result<boolean>>(
      `/permissions/users/${userId}/check/${encodeURIComponent(permissionName)}`,
    );
    return extractData<boolean>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getUserPermissions(
  userId: string,
): Promise<PermissionDto[]> {
  try {
    const response = await axiosClient.get<Result<PermissionDto[]>>(
      `/permissions/users/${userId}`,
    );
    return extractData<PermissionDto[]>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getRolePermissions(
  roleName: string,
): Promise<PermissionDto[]> {
  try {
    const response = await axiosClient.get<Result<PermissionDto[]>>(
      `/permissions/roles/${encodeURIComponent(roleName)}`,
    );
    return extractData<PermissionDto[]>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

// Commands (grant / revoke)
export async function grantPermissionToUser(
  userId: string,
  permissionName: string,
): Promise<void> {
  try {
    await axiosClient.post<Result>(
      `/permissions/users/${userId}/grant/${encodeURIComponent(permissionName)}`,
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function revokePermissionFromUser(
  userId: string,
  permissionName: string,
): Promise<void> {
  try {
    await axiosClient.post<Result>(
      `/permissions/users/${userId}/revoke/${encodeURIComponent(permissionName)}`,
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function grantPermissionToRole(
  roleName: string,
  permissionName: string,
): Promise<void> {
  try {
    await axiosClient.post<Result>(
      `/permissions/roles/${encodeURIComponent(roleName)}/grant/${encodeURIComponent(permissionName)}`,
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function revokePermissionFromRole(
  roleName: string,
  permissionName: string,
): Promise<void> {
  try {
    await axiosClient.post<Result>(
      `/permissions/roles/${encodeURIComponent(roleName)}/revoke/${encodeURIComponent(permissionName)}`,
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

// Batch operations
export async function batchGrantPermissionsToUser(
  userId: string,
  permissionNames: string[],
): Promise<void> {
  try {
    await axiosClient.post<Result>(`/permissions/users/${userId}/batch-grant`, {
      permissionNames,
    } as BatchPermissionsRequest);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function batchRevokePermissionsFromUser(
  userId: string,
  permissionNames: string[],
): Promise<void> {
  try {
    await axiosClient.post<Result>(
      `/permissions/users/${userId}/batch-revoke`,
      { permissionNames } as BatchPermissionsRequest,
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function batchGrantPermissionsToRole(
  roleName: string,
  permissionNames: string[],
): Promise<void> {
  try {
    await axiosClient.post<Result>(
      `/permissions/roles/${encodeURIComponent(roleName)}/batch-grant`,
      { permissionNames } as BatchPermissionsRequest,
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function batchRevokePermissionsFromRole(
  roleName: string,
  permissionNames: string[],
): Promise<void> {
  try {
    await axiosClient.post<Result>(
      `/permissions/roles/${encodeURIComponent(roleName)}/batch-revoke`,
      { permissionNames } as BatchPermissionsRequest,
    );
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

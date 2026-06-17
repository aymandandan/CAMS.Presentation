import axiosClient from "./axiosClient";
import type { Result } from "@/domain/shared/Result";
import type {
  RoleDto,
  CreateRoleRequest,
  UpdateRoleRequest,
  UpdateUserRolesRequest,
} from "@/domain/roles/RoleTypes";
import { extractData, getErrorMessage } from "@/lib/utils/ResponseUtils";

// Queries
export async function getAllRoles(): Promise<RoleDto[]> {
  try {
    const response = await axiosClient.get<Result<RoleDto[]>>("/roles");
    return extractData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getRoleById(id: string): Promise<RoleDto> {
  try {
    const response = await axiosClient.get<Result<RoleDto>>(`/roles/${id}`);
    return extractData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getRoleByName(name: string): Promise<RoleDto> {
  try {
    const response = await axiosClient.get<Result<RoleDto>>("/roles/by-name", {
      params: { name },
    });
    return extractData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function roleExists(name: string): Promise<boolean> {
  try {
    const response = await axiosClient.get<Result<boolean>>("/roles/exists", {
      params: { name },
    });
    return extractData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

// Commands
export async function createRole(data: CreateRoleRequest): Promise<string> {
  // Backend returns Guid in Data
  try {
    const response = await axiosClient.post<Result<string>>("/roles", data);
    return extractData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateRole(
  id: string,
  data: UpdateRoleRequest,
): Promise<void> {
  try {
    await axiosClient.put<Result>(`/roles/${id}`, data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteRole(id: string): Promise<void> {
  try {
    await axiosClient.delete<Result>(`/roles/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateUserRoles(
  data: UpdateUserRolesRequest,
): Promise<void> {
  try {
    await axiosClient.put<Result>("/roles/user-roles", data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

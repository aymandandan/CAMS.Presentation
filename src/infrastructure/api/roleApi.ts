import axiosClient from './axiosClient';
import type { Result } from '@/domain/shared/Result';
import type { RoleDto, CreateRoleRequest, UpdateRoleRequest, UpdateUserRolesRequest } from '@/domain/roles/RoleTypes';

function extractData<T>(response: { data: Result<T> }): T {
  const result = response.data;
  if (!result.succeeded) {
    const message = result.errors?.[0]?.description || result.error || 'Request failed';
    throw new Error(message);
  }
  return result.data as T;
}

// Queries
export async function getAllRoles(): Promise<RoleDto[]> {
  const response = await axiosClient.get<Result<RoleDto[]>>('/roles');
  return extractData(response);
}

export async function getRoleById(id: string): Promise<RoleDto> {
  const response = await axiosClient.get<Result<RoleDto>>(`/roles/${id}`);
  return extractData(response);
}

export async function getRoleByName(name: string): Promise<RoleDto> {
  const response = await axiosClient.get<Result<RoleDto>>('/roles/by-name', { params: { name } });
  return extractData(response);
}

export async function roleExists(name: string): Promise<boolean> {
  const response = await axiosClient.get<Result<boolean>>('/roles/exists', { params: { name } });
  return extractData(response);
}

// Commands
export async function createRole(data: CreateRoleRequest): Promise<string> {
  // Backend returns Guid in Data
  const response = await axiosClient.post<Result<string>>('/roles', data);
  return extractData(response);
}

export async function updateRole(id: string, data: UpdateRoleRequest): Promise<void> {
  await axiosClient.put<Result>(`/roles/${id}`, data);
}

export async function deleteRole(id: string): Promise<void> {
  await axiosClient.delete<Result>(`/roles/${id}`);
}

export async function updateUserRoles(data: UpdateUserRolesRequest): Promise<void> {
  await axiosClient.put<Result>('/roles/user-roles', data);
}
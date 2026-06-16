import axiosClient from './axiosClient';
import type { Result, PaginatedList } from '@/domain/shared/Result';
import type {
  UserDto,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UsersQueryRequest,
  UserListItemDto,
} from '@/domain/users/UserTypes';

function extractData<T>(response: { data: Result<T> }): T {
  const result = response.data;
  if (!result.succeeded) {
    const message = result.errors?.[0]?.description || result.error || 'Request failed';
    throw new Error(message);
  }
  return result.data as T;
}

// --- Queries ---

export async function getUsersPaginated(params: UsersQueryRequest): Promise<PaginatedList<UserListItemDto>> {
  const response = await axiosClient.get<Result<PaginatedList<UserListItemDto>>>('/users', { params });
  return extractData(response);
}

export async function getUserById(id: string): Promise<UserDto> {
  const response = await axiosClient.get<Result<UserDto>>(`/users/${id}`);
  return extractData(response);
}

export async function getUserByEmail(email: string): Promise<UserDto> {
  const response = await axiosClient.get<Result<UserDto>>('/users/by-email', { params: { email } });
  return extractData(response);
}

export async function getActiveUsers(params: UsersQueryRequest): Promise<PaginatedList<UserListItemDto>> {
  const response = await axiosClient.get<Result<PaginatedList<UserListItemDto>>>('/users/active', { params });
  return extractData(response);
}

export async function checkEmailUnique(email: string, excludeUserId?: string): Promise<boolean> {
  const response = await axiosClient.get<Result<boolean>>('/users/check-email-unique', {
    params: { email, excludeUserId },
  });
  return extractData(response);
}

// --- Commands ---

export async function createUser(data: CreateUserRequest): Promise<UserDto> {
  const response = await axiosClient.post<Result<UserDto>>('/users', data);
  return extractData(response);
}

export async function updateUser(id: string, data: UpdateUserRequest): Promise<void> {
  await axiosClient.put<Result>(`/users/${id}`, data);
  // 204 No Content → extractData would fail, so we call without it
}

export async function deleteUser(id: string): Promise<void> {
  await axiosClient.delete<Result>(`/users/${id}`);
}

export async function activateUser(id: string): Promise<void> {
  await axiosClient.patch<Result>(`/users/${id}/activate`);
}

export async function deactivateUser(id: string): Promise<void> {
  await axiosClient.patch<Result>(`/users/${id}/deactivate`);
}

export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  await axiosClient.post<Result>('/users/change-password', data);
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<string> {
  const response = await axiosClient.post<Result<string>>('/users/forgot-password', data);
  return extractData(response);
}

export async function resetPassword(data: ResetPasswordRequest): Promise<void> {
  await axiosClient.post<Result>('/users/reset-password', data);
}
import axiosClient from "./axiosClient";
import type { Result, PaginatedList } from "@/domain/shared/Result";
import type {
  UserDto,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UsersQueryRequest,
  UserListItemDto,
} from "@/domain/users/UserTypes";
import { extractData, getErrorMessage } from "@/lib/utils/ResponseUtils";

// --- Queries ---

export async function getUsersPaginated(
  params: UsersQueryRequest,
): Promise<PaginatedList<UserListItemDto>> {
  try {
    const response = await axiosClient.get<
      Result<PaginatedList<UserListItemDto>>
    >("/users", { params });
    return extractData<PaginatedList<UserListItemDto>>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getUserById(id: string): Promise<UserDto> {
  try {
    const response = await axiosClient.get<Result<UserDto>>(`/users/${id}`);
    return extractData<UserDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getUserByEmail(email: string): Promise<UserDto> {
  try {
    const response = await axiosClient.get<Result<UserDto>>("/users/by-email", {
      params: { email },
    });
    return extractData<UserDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getActiveUsers(
  params: UsersQueryRequest,
): Promise<PaginatedList<UserListItemDto>> {
  try {
    const response = await axiosClient.get<
      Result<PaginatedList<UserListItemDto>>
    >("/users/active", { params });
    return extractData<PaginatedList<UserListItemDto>>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function checkEmailUnique(
  email: string,
  excludeUserId?: string,
): Promise<boolean> {
  try {
    const response = await axiosClient.get<Result<boolean>>(
      "/users/check-email-unique",
      {
        params: { email, excludeUserId },
      },
    );
    return extractData<boolean>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

// --- Commands ---

export async function createUser(data: CreateUserRequest): Promise<UserDto> {
  try {
    const response = await axiosClient.post<Result<UserDto>>("/users", data);
    return extractData<UserDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateUser(
  id: string,
  data: UpdateUserRequest,
): Promise<void> {
  try {
    await axiosClient.put<Result>(`/users/${id}`, data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
  // 204 No Content → extractData would fail, so we call without it
}

export async function deleteUser(id: string): Promise<void> {
  try {
    await axiosClient.delete<Result>(`/users/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function activateUser(id: string): Promise<void> {
  try {
    await axiosClient.patch<Result>(`/users/${id}/activate`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deactivateUser(id: string): Promise<void> {
  try {
    await axiosClient.patch<Result>(`/users/${id}/deactivate`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function changePassword(
  data: ChangePasswordRequest,
): Promise<void> {
  try {
    await axiosClient.post<Result>("/users/change-password", data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function forgotPassword(
  data: ForgotPasswordRequest,
): Promise<string> {
  try {
    const response = await axiosClient.post<Result<string>>(
      "/users/forgot-password",
      data,
    );
    return extractData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function resetPassword(data: ResetPasswordRequest): Promise<void> {
  try {
    await axiosClient.post<Result>("/users/reset-password", data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

import { SortablePaginationRequestInfo } from "../shared";

export interface UserDto {
  id: string; // Guid → string in TS
  applicationUserId: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  isActive: boolean;
  roles: string[];
  permissions: string[];
}

export interface UserListItemDto {
  id: string; // Guid → string in TS
  applicationUserId: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  isActive: boolean;
  roles: string[];
}

// ------ Commands / Requests ------

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

export interface UpdateUserRequest {
  userId: string; // must match route parameter
  email: string;
  fullName: string;
  phoneNumber?: string;
}

export interface ChangePasswordRequest {
  userId?: string; // if empty, backend uses current user
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface DeleteUserRequest {
  userId: string;
}

export interface ActivateDeactivateRequest {
  userId: string;
}

export interface UsersQueryRequest extends SortablePaginationRequestInfo {
  rolesFilter?: string[];
}

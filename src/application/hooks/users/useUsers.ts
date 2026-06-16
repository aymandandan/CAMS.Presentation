import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUsersPaginated,
  getUserById,
  getUserByEmail,
  getActiveUsers,
  checkEmailUnique,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  deactivateUser,
  changePassword,
  forgotPassword,
  resetPassword,
} from "@/infrastructure/api/userApi";
import { UsersQueryRequest } from "@/domain/users/UserTypes";

// --- Query keys ---
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: UsersQueryRequest) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  byEmail: (email: string) => [...userKeys.all, "by-email", email] as const,
  active: (filters: UsersQueryRequest) =>
    [...userKeys.lists(), "active", filters] as const,
  emailUnique: (email: string, excludeUserId?: string) =>
    [...userKeys.all, "check-email-unique", email, excludeUserId] as const,
};

// Quaries
export function useUsers(
  params: UsersQueryRequest,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => getUsersPaginated(params),
    ...options,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
}

export function useUserByEmail(email: string) {
  return useQuery({
    queryKey: userKeys.byEmail(email),
    queryFn: () => getUserByEmail(email),
    enabled: !!email,
  });
}

export function useActiveUsers(
  params: UsersQueryRequest,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: userKeys.active(params),
    queryFn: () => getActiveUsers(params),
    ...options,
  });
}

export function useCheckEmailUnique(email: string, excludeUserId?: string) {
  return useQuery({
    queryKey: userKeys.emailUnique(email, excludeUserId),
    queryFn: () => checkEmailUnique(email, excludeUserId),
    enabled: !!email,
  });
}

// Mutations
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateUser>[1]) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPassword,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: resetPassword,
  });
}

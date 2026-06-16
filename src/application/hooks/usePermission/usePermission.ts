import { useAuthStore } from "@/application/stores/useAuthStore";

export const usePermission = (permission: string) => {
  return useAuthStore((state) => state.hasPermission(permission));
};

export const useHasRole = (role: string) => {
  return useAuthStore((state) => state.hasRole(role));
};

/**
 * Returns a function that checks if the current user has all specified permissions.
 */
export function useHasPermissions() {
  const user = useAuthStore((state) => state.user);

  const hasPermission = (...permissions: string[]) => {
    if (!user) return false;
    return permissions.every((p) => user.permissions.includes(p));
  };

  return { hasPermission };
}

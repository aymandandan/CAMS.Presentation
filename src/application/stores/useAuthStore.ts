import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthenticationResult } from '@/domain/auth/AuthenticationResult';

interface AuthState {
  token: string | null;
  user: {
    userId: string;
    email: string;
    fullName: string;
    roles: string[];
    permissions: string[];
  } | null;

  // Derived getters (we will compute in hooks)
  isAuthenticated: () => boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;

  // Actions
  setAuth: (auth: AuthenticationResult) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      isAuthenticated: () => !!get().token,

      hasPermission: (permission: string) => {
        const user = get().user;
        if (!user) return false;
        return user.permissions.includes(permission);
      },

      hasRole: (role: string) => {
        const user = get().user;
        if (!user) return false;
        return user.roles.includes(role);
      },

      setAuth: (auth: AuthenticationResult) =>
        set({
          token: auth.accessToken,
          user: {
            userId: auth.userId,
            email: auth.email,
            fullName: auth.fullName,
            roles: auth.roles,
            permissions: auth.permissions,
          },
        }),

      setToken: (token: string) => set({ token }),

      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);
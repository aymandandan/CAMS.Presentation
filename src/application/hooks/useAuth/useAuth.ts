import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/application/stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { login, logout } from "@/infrastructure/api/authEndpoints";

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data);
      navigate("/", { replace: true });
    },
  });
};

export const useLogout = () => {
  const logoutStore = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      logoutStore();
      queryClient.clear(); // remove all cached data
      navigate("/login", { replace: true });
    },
  });
};

// Optional: hook to try silent refresh on app load
// export const useSilentRefresh = () => {
//   const setAuth = useAuthStore((s) => s.setAuth);
//   const token = useAuthStore((s) => s.token);
//   const logout = useAuthStore((s) => s.logout);

//   return useMutation({
//     mutationFn: async () => {
//       if (!token) throw new Error('No token');
//       // If token exists, we trust the persistence; but we can still call /refresh-token
//       // However, because refresh-token requires the HttpOnly cookie, we can't just do it silently.
//       // Instead, we rely on the interceptor to refresh on 401.
//       return;
//     },
//   });
// };

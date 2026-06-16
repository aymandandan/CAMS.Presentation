import { useAuthStore } from "@/application/stores/useAuthStore";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export const RequireAuth = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!isAuthenticated) {
    console.log("Not authenticated", user);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

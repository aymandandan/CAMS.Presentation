import { usePermission } from "@/application/hooks/usePermission/usePermission";
import { Navigate } from "react-router-dom";

interface Props {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RequirePermission: React.FC<Props> = ({
  permission,
  children,
  fallback,
}) => {
  const hasPerm = usePermission(permission);

  if (!hasPerm) {
    if (fallback) return <>{fallback}</>;
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

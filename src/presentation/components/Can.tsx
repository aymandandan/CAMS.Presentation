import { useHasPermissions } from "@/application/hooks/usePermission/usePermission";

interface CanProps {
  requiredPermissions: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({
  requiredPermissions,
  children,
  fallback = null,
}) => {
  const { hasPermission } = useHasPermissions();
  const hasPerm = hasPermission(...requiredPermissions);
  return <>{hasPerm ? children : fallback}</>;
};

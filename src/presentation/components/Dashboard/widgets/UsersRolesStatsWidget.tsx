import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { Can } from "@/presentation/components/Can";
import { Permissions } from "@/domain/shared/Permissions";
import {
  useUsersDashboard,
  useRolesDashboard,
} from "@/application/hooks/dashboard/useDashboard";

function StatItem({
  icon,
  label,
  value,
  loading,
  error,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | number;
  loading?: boolean;
  error?: boolean;
  onClick?: () => void;
}) {
  const theme = useTheme();

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={60} />
        <Skeleton variant="text" width={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="caption" color="error">
          Error
        </Typography>
      </Box>
    );
  }

  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: "center",
        cursor: onClick ? "pointer" : "default",
        p: 1,
        borderRadius: 1,
        transition: "background 0.15s",
        "&:hover": onClick
          ? {
              backgroundColor: theme.palette.action.hover,
            }
          : {},
      }}
      onClick={onClick}
    >
      <Box sx={{ color: theme.palette.primary.main }}>{icon}</Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h6" component="span">
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

function UsersStat() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useUsersDashboard();

  return (
    <Can requiredPermissions={[Permissions.Users.View]}>
      <StatItem
        icon={<PeopleIcon />}
        label="Total Users"
        value={data?.totalUsers}
        loading={isLoading}
        error={isError}
        onClick={() => navigate("/users")}
      />
      <StatItem
        icon={<PersonIcon />}
        label="Active Users"
        value={data?.activeUsers}
        loading={isLoading}
        error={isError}
        onClick={() => navigate("/users?active=true")}
      />
    </Can>
  );
}

function RolesStat() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useRolesDashboard();

  return (
    <Can requiredPermissions={[Permissions.Roles.Read]}>
      <StatItem
        icon={<AdminPanelSettingsIcon />}
        label="Roles"
        value={data?.totalRoles}
        loading={isLoading}
        error={isError}
        onClick={() => navigate("/roles")}
      />
    </Can>
  );
}

export default function UsersRolesStatsWidget() {
  return (
    <Can requiredPermissions={[Permissions.Users.View]}>
      <Card
        variant="outlined"
        sx={{
          height: "100%",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: (theme) => theme.shadows[4],
          },
        }}
      >
        <CardHeader title="Administration" />
        <CardContent>
          <Stack spacing={1}>
            <UsersStat />
            <RolesStat />
          </Stack>
        </CardContent>
      </Card>
    </Can>
  );
}

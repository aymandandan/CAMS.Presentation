// Mirror of backend RoleDto
export interface RoleDto {
  id: string;
  name: string;
  description?: string;
}

// Commands / Requests
export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  roleId: string;
  name: string;
  description?: string;
}

export interface UpdateUserRolesRequest {
  userId: string;
  roleIds: string[];
}
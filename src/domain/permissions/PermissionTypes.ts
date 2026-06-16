// Mirror of backend PermissionDto
export interface PermissionDto {
  id: number;            // backend uses int
  name: string;
  description?: string;
}

// Grant / Revoke request types (parameterised)
export interface GrantUserPermissionRequest {
  userId: string;
  permissionName: string;
}

export interface RevokeUserPermissionRequest {
  userId: string;
  permissionName: string;
}

export interface GrantRolePermissionRequest {
  roleName: string;
  permissionName: string;
}

export interface RevokeRolePermissionRequest {
  roleName: string;
  permissionName: string;
}

export interface BatchPermissionsRequest {
  permissionNames: string[];
}
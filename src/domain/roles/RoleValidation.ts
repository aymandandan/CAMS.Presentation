import type {
  CreateRoleRequest,
  UpdateRoleRequest,
} from "@/domain/roles/RoleTypes";

interface ValidationIssue {
  path: string[];
  message: string;
}

export function validateCreateRole(values: Partial<CreateRoleRequest>): {
  issues: ValidationIssue[];
} {
  const issues: ValidationIssue[] = [];

  if (!values.name?.trim()) {
    issues.push({ path: ["name"], message: "Name is required" });
  }

  return { issues };
}

export function validateUpdateRole(values: Partial<UpdateRoleRequest>): {
  issues: ValidationIssue[];
} {
  const issues: ValidationIssue[] = [];

  if (!values.name?.trim()) {
    issues.push({ path: ["name"], message: "Name is required" });
  }

  return { issues };
}

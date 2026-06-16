import type {
  CreateUserRequest,
  UpdateUserRequest,
} from "@/domain/users/UserTypes";

interface ValidationIssue {
  path: string[];
  message: string;
}

export function validateCreateUser(values: Partial<CreateUserRequest>): {
  issues: ValidationIssue[];
} {
  const issues: ValidationIssue[] = [];

  if (!values.fullName?.trim()) {
    issues.push({ path: ["fullName"], message: "Full name is required" });
  }

  if (!values.email?.trim()) {
    issues.push({ path: ["email"], message: "Email is required" });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    issues.push({ path: ["email"], message: "Invalid email format" });
  }

  if (!values.password?.trim()) {
    issues.push({ path: ["password"], message: "Password is required" });
  } else if ((values.password ?? "").length < 8) {
    issues.push({
      path: ["password"],
      message: "Password must be at least 8 characters",
    });
  }

  return { issues };
}

export function validateUpdateUser(values: Partial<UpdateUserRequest>): {
  issues: ValidationIssue[];
} {
  const issues: ValidationIssue[] = [];

  if (!values.fullName?.trim()) {
    issues.push({ path: ["fullName"], message: "Full name is required" });
  }

  if (!values.email?.trim()) {
    issues.push({ path: ["email"], message: "Email is required" });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    issues.push({ path: ["email"], message: "Invalid email format" });
  }

  return { issues };
}

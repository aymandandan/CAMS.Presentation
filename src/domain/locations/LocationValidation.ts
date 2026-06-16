import type { CreateLocationRequest } from "@/domain/locations/LocationTypes";

interface ValidationIssue {
  path: string[];
  message: string;
}

export function validateLocation(values: Partial<CreateLocationRequest>): {
  issues: ValidationIssue[];
} {
  const issues: ValidationIssue[] = [];

  if (!values.code?.trim()) {
    issues.push({ path: ["code"], message: "Code is required" });
  }
  if (!values.name?.trim()) {
    issues.push({ path: ["name"], message: "Name is required" });
  }
  if (!values.type) {
    issues.push({ path: ["type"], message: "Type is required" });
  }

  return { issues };
}

import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/domain/categories/CategoryTypes";

interface ValidationIssue {
  path: string[];
  message: string;
}

export function validateCategory(
  values: Partial<CreateCategoryRequest | UpdateCategoryRequest>,
): { issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  if ("name" in values && !values.name?.trim()) {
    issues.push({ path: ["name"], message: "Name is required" });
  }

  // For create, code is required
  if ("code" in values && !values.code?.trim()) {
    issues.push({ path: ["code"], message: "Code is required" });
  }

  return { issues };
}

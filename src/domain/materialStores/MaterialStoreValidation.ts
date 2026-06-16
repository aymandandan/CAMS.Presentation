import type { CreateMaterialStoreCommand } from "@/domain/materialStores/MaterialStoreTypes";

interface ValidationIssue {
  path: string[];
  message: string;
}

export function validateMaterialStore(
  values: Partial<CreateMaterialStoreCommand>,
): { issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  if (!values.code?.trim()) {
    issues.push({ path: ["code"], message: "Code is required" });
  }

  if (!values.name?.trim()) {
    issues.push({ path: ["name"], message: "Name is required" });
  }

  return { issues };
}

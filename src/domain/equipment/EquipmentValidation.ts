import type { CreateEquipmentRequest } from "@/domain/equipment/EquipmentTypes";

interface ValidationIssue {
  path: string[];
  message: string;
}

export function validateEquipment(
  values: Partial<CreateEquipmentRequest>
): { issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  if (!values.code?.trim()) {
    issues.push({ path: ["code"], message: "Code is required" });
  }
  if (!values.name?.trim()) {
    issues.push({ path: ["name"], message: "Name is required" });
  }
  if (!values.locationId) {
    issues.push({ path: ["locationId"], message: "Location is required" });
  }
  if (!values.categoryId) {
    issues.push({ path: ["categoryId"], message: "Category is required" });
  }
  if (!values.tradeId) {
    issues.push({ path: ["tradeId"], message: "Trade is required" });
  }

  return { issues };
}
import { CreateMaintenancePlanRequest } from "./MaintenancePlanTypes";

export interface ValidationIssue {
  path: string[];
  message: string;
}

export function validateMaintenancePlan(
  values: Partial<CreateMaintenancePlanRequest>
): { issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  if (!values.code?.trim()) {
    issues.push({ path: ["code"], message: "Code is required" });
  }
  if (!values.categoryId) {
    issues.push({ path: ["categoryId"], message: "Category is required" });
  }
  if (!values.cycleDays || values.cycleDays <= 0) {
    issues.push({
      path: ["cycleDays"],
      message: "Cycle days must be a positive number",
    });
  }
  if (!values.description?.trim()) {
    issues.push({ path: ["description"], message: "Description is required" });
  }

  // Tasks are required (backend validation)
  if (!values.tasks || values.tasks.length === 0) {
    issues.push({ path: ["tasks"], message: "At least one planned task is required" });
  } else {
    values.tasks.forEach((task, index) => {
      if (!task.taskId) {
        issues.push({
          path: ["tasks", String(index), "taskId"],
          message: "Task ID is required",
        });
      }
      if (!task.order || task.order <= 0) {
        issues.push({
          path: ["tasks", String(index), "order"],
          message: "Task order must be a positive number",
        });
      }
    });
  }

  // Validate material requirements if present
  if (values.materialRequirements?.length) {
    values.materialRequirements.forEach((m, index) => {
      if (!m.itemId) {
        issues.push({
          path: ["materialRequirements", String(index), "itemId"],
          message: "Material item ID is required",
        });
      }
      if (!m.quantity || m.quantity <= 0) {
        issues.push({
          path: ["materialRequirements", String(index), "quantity"],
          message: "Quantity must be positive",
        });
      }
      if (!m.unitOfMeasure?.trim()) {
        issues.push({
          path: ["materialRequirements", String(index), "unitOfMeasure"],
          message: "Unit of measure is required",
        });
      }
    });
  }

  return { issues };
}
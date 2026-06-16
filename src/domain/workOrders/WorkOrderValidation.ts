import type { CreateCorrectiveWorkOrderCommand } from "./WorkOrderTypes";

interface ValidationIssue {
  path: string[];
  message: string;
}

export function validateCorrectiveWorkOrder(
  values: Partial<CreateCorrectiveWorkOrderCommand>,
): { issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  if (!values.equipmentId) {
    issues.push({ path: ["equipmentId"], message: "Equipment is required" });
  }
  if (!values.description?.trim()) {
    issues.push({ path: ["description"], message: "Description is required" });
  }
  if (!values.priority) {
    issues.push({ path: ["priority"], message: "Priority is required" });
  }

  // Tasks are required (backend validation)
  if (!values.tasks || values.tasks.length === 0) {
    issues.push({ path: ["tasks"], message: "At least one task is required" });
  } else {
    values.tasks.forEach((task, index) => {
      if (!task.taskId) {
        issues.push({
          path: ["tasks", String(index), "taskId"],
          message: "Task ID is required",
        });
      }
      if (task.order == null || task.order < 0) {
        issues.push({
          path: ["tasks", String(index), "order"],
          message: "Order must be a non-negative number",
        });
      }
    });
  }

  // Validate materials if provided
  if (values.materialRequirements?.length) {
    values.materialRequirements.forEach((mr, index) => {
      if (!mr.itemId) {
        issues.push({
          path: ["materialRequirements", String(index), "itemId"],
          message: "Item is required",
        });
      }
      if (!mr.quantity || mr.quantity <= 0) {
        issues.push({
          path: ["materialRequirements", String(index), "quantity"],
          message: "Quantity must be positive",
        });
      }
      if (!mr.unitOfMeasure?.trim()) {
        issues.push({
          path: ["materialRequirements", String(index), "unitOfMeasure"],
          message: "Unit is required",
        });
      }
    });
  }

  return { issues };
}

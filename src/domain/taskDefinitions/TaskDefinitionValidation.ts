import {
  CreateTaskDefinitionRequest,
  UpdateTaskDefinitionRequest,
} from "./TaskDefinitionTypes";

interface ValidationIssue {
  path: string[];
  message: string;
}

export function validateCreateTaskDefinition(
  values: Partial<CreateTaskDefinitionRequest>,
): { issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  if (!values.description?.trim()) {
    issues.push({ path: ["description"], message: "Description is required" });
  }
  if (values.durationValue == null || values.durationValue <= 0) {
    issues.push({
      path: ["durationValue"],
      message: "Duration must be a positive number",
    });
  }
  if (!values.durationUnit) {
    issues.push({
      path: ["durationUnit"],
      message: "Duration unit is required",
    });
  }
  if (!values.type) {
    issues.push({ path: ["type"], message: "Type is required" });
  }
  return { issues };
}

export function validateUpdateTaskDefinition(
  values: Partial<UpdateTaskDefinitionRequest>,
): { issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  if (values.description !== undefined && !values.description.trim()) {
    issues.push({
      path: ["description"],
      message: "Description cannot be empty",
    });
  }
  if (values.durationValue != null && values.durationValue <= 0) {
    issues.push({
      path: ["durationValue"],
      message: "Duration must be positive",
    });
  }
  return { issues };
}

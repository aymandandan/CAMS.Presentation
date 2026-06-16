import type { CreateMaterialItemRequest, UpdateMaterialItemRequest } from './MaterialItemTypes';

export interface ValidationIssue {
  path: string[];
  message: string;
}

export function validateCreateMaterialItem(
  values: Partial<CreateMaterialItemRequest>
): { issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  if (values.isStockable && (values.initialStock ?? 0) > 0 && !values.storeId) {
    issues.push({ path: ['storeId'], message: 'Store ID is required when creating a stockable item with initial stock.' });
  }

  if (!values.name?.trim()) {
    issues.push({ path: ['name'], message: 'Name is required' });
  }
  if (!values.unitOfMeasureSymbol?.trim()) {
    issues.push({ path: ['unitOfMeasureSymbol'], message: 'Unit of measure is required' });
  }
  if (values.reorderLevel != null && values.reorderLevel < 0) {
    issues.push({ path: ['reorderLevel'], message: 'Reorder level cannot be negative' });
  }
  if (values.unitCostAmount != null && values.unitCostAmount < 0) {
    issues.push({ path: ['unitCostAmount'], message: 'Unit cost amount cannot be negative' });
  }
  if (values.unitCostCurrency && !/^[A-Z]{3}$/.test(values.unitCostCurrency)) {
    issues.push({ path: ['unitCostCurrency'], message: 'Currency must be a 3-letter ISO code (uppercase)' });
  }

  return { issues };
}

export function validateUpdateMaterialItem(
  values: Partial<UpdateMaterialItemRequest>
): { issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  if (!values.id) {
    issues.push({ path: ['id'], message: 'ID is required' });
  }
  if (!values.name?.trim()) {
    issues.push({ path: ['name'], message: 'Name is required' });
  }
  return { issues };
}
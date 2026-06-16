import type { CreateVendorRequest } from '@/domain/vendors/VendorTypes';

interface ValidationIssue {
  path: string[];
  message: string;
}

export function validateVendor(
  values: Partial<CreateVendorRequest>
): { issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  if (!values.name?.trim()) {
    issues.push({ path: ['name'], message: 'Name is required' });
  }

  return { issues };
}
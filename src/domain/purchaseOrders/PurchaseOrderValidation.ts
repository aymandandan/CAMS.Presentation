import type {
  CreatePurchaseOrderRequest,
  PurchaseOrderLineInput,
  UpdatePurchaseOrderRequest,
} from "./PurchaseOrderTypes";

interface ValidationIssue {
  path: string[];
  message: string;
}

function validateLines(lines: PurchaseOrderLineInput[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!lines || lines.length === 0) {
    issues.push({
      path: ["lines"],
      message: "At least one order line is required",
    });
  } else {
    lines.forEach((line, index) => {
      if (!line.itemId) {
        issues.push({
          path: ["lines", String(index), "itemId"],
          message: "Material item is required",
        });
      }
      if (!line.storeId) {
        issues.push({
          path: ["lines", String(index), "storeId"],
          message: "Store is required",
        });
      }
      if (!line.quantity || line.quantity <= 0) {
        issues.push({
          path: ["lines", String(index), "quantity"],
          message: "Quantity must be positive",
        });
      }
      if (!line.unitSymbol?.trim()) {
        issues.push({
          path: ["lines", String(index), "unitSymbol"],
          message: "Unit is required",
        });
      }
      if (!line.unitPriceAmount || line.unitPriceAmount <= 0) {
        issues.push({
          path: ["lines", String(index), "unitPriceAmount"],
          message: "Unit price must be positive",
        });
      }
      if (!line.unitPriceCurrency?.trim()) {
        issues.push({
          path: ["lines", String(index), "unitPriceCurrency"],
          message: "Currency is required",
        });
      }
    });
  }
  return issues;
}

export function validateCreatePurchaseOrder(
  values: Partial<CreatePurchaseOrderRequest>,
): { issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  if (!values.vendorId)
    issues.push({ path: ["vendorId"], message: "Vendor is required" });
  if (!values.orderDate)
    issues.push({ path: ["orderDate"], message: "Order date is required" });
  issues.push(...validateLines(values.lines ?? []));
  return { issues };
}

export function validateUpdatePurchaseOrder(
  values: Partial<UpdatePurchaseOrderRequest>,
): { issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];
  if (!values.id)
    issues.push({ path: ["id"], message: "Order ID is required" });
  if (!values.vendorId)
    issues.push({ path: ["vendorId"], message: "Vendor is required" });
  if (!values.orderDate)
    issues.push({ path: ["orderDate"], message: "Order date is required" });
  issues.push(...validateLines(values.lines ?? []));
  return { issues };
}

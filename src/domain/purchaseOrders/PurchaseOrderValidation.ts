import type { CreatePurchaseOrderRequest } from "./PurchaseOrderTypes";

interface ValidationIssue {
  path: string[];
  message: string;
}

export function validateCreatePurchaseOrder(
  values: Partial<CreatePurchaseOrderRequest>
): { issues: ValidationIssue[] } {
  const issues: ValidationIssue[] = [];

  if (!values.vendorId) {
    issues.push({ path: ["vendorId"], message: "Vendor is required" });
  }
  if (!values.orderDate) {
    issues.push({ path: ["orderDate"], message: "Order date is required" });
  }

  if (!values.lines || values.lines.length === 0) {
    issues.push({ path: ["lines"], message: "At least one order line is required" });
  } else {
    values.lines.forEach((line, index) => {
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

  return { issues };
}
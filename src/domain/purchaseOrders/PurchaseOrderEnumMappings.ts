import { PurchaseOrderStatus } from "./PurchaseOrderTypes";

// Status to number mapping (in case backend expects numbers in queries)
export const purchaseOrderStatusToNumber: Record<PurchaseOrderStatus, number> = {
  [PurchaseOrderStatus.Draft]: 0,
  [PurchaseOrderStatus.Received]: 1,
  [PurchaseOrderStatus.Cancelled]: 2,
};

export const numberToPurchaseOrderStatus: Record<number, PurchaseOrderStatus> = {
  0: PurchaseOrderStatus.Draft,
  1: PurchaseOrderStatus.Received,
  2: PurchaseOrderStatus.Cancelled,
};


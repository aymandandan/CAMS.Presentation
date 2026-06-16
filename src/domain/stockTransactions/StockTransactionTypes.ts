import { SortablePaginationRequestInfo } from "../shared";

// --------------- Enums ---------------
export enum TransactionType {
  Recieve = "Recieve",
  Issue = "Issue",
  Adjust = "Adjust",
  Reserve = "Reserve",
  ReleaseReserve = "ReleaseReserve",
  TransferIn = "TransferIn",
  TransferOut = "TransferOut",
}

// --------------- DTOs ---------------
export interface StockTransactionListItemDto {
  id: string;
  transactionDate: string; // ISO date
  type: string; // TransactionType as string
  itemId: string;
  itemSku: string;
  itemName: string;
  storeId: string;
  storeCode: string;
  storeName: string;
  signedQuantity: number; // positive = increase, negative = decrease
  unit: string;
  referenceId?: string;
  referenceName?: string;
  notes?: string;
}

// --------------- Query Parameters ---------------
export interface GetStockTransactionsQueryParams extends SortablePaginationRequestInfo {
  itemId?: string;
  storeId?: string;
  type?: TransactionType;
  fromDate?: string; // ISO date string
  toDate?: string;
  referenceId?: string;
  referenceName?: string;
}

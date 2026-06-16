import axiosClient from "@/infrastructure/api/axiosClient";
import type {
  StockTransactionListItemDto,
  GetStockTransactionsQueryParams,
} from "@/domain/stockTransactions/StockTransactionTypes";
import type { PaginatedList } from "@/domain/shared";

function extractData<T>(response: any): T {
  const result = response.data;
  if (!result.succeeded) {
    const message =
      result.errors?.[0]?.description ?? result.error ?? "Request failed";
    throw new Error(message);
  }
  return result.data;
}

export async function getStockTransactions(
  params: GetStockTransactionsQueryParams
): Promise<PaginatedList<StockTransactionListItemDto>> {
  const response = await axiosClient.get("/stocktransactions", { params });
  return extractData<PaginatedList<StockTransactionListItemDto>>(response);
}

export async function getStockTransactionById(
  id: string
): Promise<StockTransactionListItemDto> {
  const response = await axiosClient.get(`/stocktransactions/${id}`);
  return extractData<StockTransactionListItemDto>(response);
}
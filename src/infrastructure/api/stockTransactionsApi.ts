import axiosClient from "@/infrastructure/api/axiosClient";
import type {
  StockTransactionListItemDto,
  GetStockTransactionsQueryParams,
} from "@/domain/stockTransactions/StockTransactionTypes";
import type { PaginatedList } from "@/domain/shared";
import { extractData, getErrorMessage } from "@/lib/utils/ResponseUtils";

export async function getStockTransactions(
  params: GetStockTransactionsQueryParams,
): Promise<PaginatedList<StockTransactionListItemDto>> {
  try {
    const response = await axiosClient.get("/stocktransactions", { params });
    return extractData<PaginatedList<StockTransactionListItemDto>>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getStockTransactionById(
  id: string,
): Promise<StockTransactionListItemDto> {
  try {
    const response = await axiosClient.get(`/stocktransactions/${id}`);
    return extractData<StockTransactionListItemDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

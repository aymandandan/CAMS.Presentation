import {
  useQuery,
  keepPreviousData,
} from "@tanstack/react-query";
import type { PaginatedList } from "@/domain/shared";
import { GetStockTransactionsQueryParams, StockTransactionListItemDto } from "@/domain/stockTransactions/StockTransactionTypes";
import { getStockTransactions, getStockTransactionById } from "@/infrastructure/api/stockTransactionsApi";

// ------------------ Query Keys ------------------
const stockTransactionKeys = {
  all: ["stockTransactions"] as const,
  lists: () => [...stockTransactionKeys.all, "list"] as const,
  list: (params: GetStockTransactionsQueryParams) =>
    [...stockTransactionKeys.lists(), params] as const,
  details: () => [...stockTransactionKeys.all, "detail"] as const,
  detail: (id: string) => [...stockTransactionKeys.details(), id] as const,
};

// ------------------ Queries ------------------
export function useStockTransactions(params: GetStockTransactionsQueryParams) {
  return useQuery<PaginatedList<StockTransactionListItemDto>>({
    queryKey: stockTransactionKeys.list(params),
    queryFn: () => getStockTransactions(params),
    placeholderData: keepPreviousData,
  });
}

export function useStockTransaction(id: string) {
  return useQuery<StockTransactionListItemDto>({
    queryKey: stockTransactionKeys.detail(id),
    queryFn: () => getStockTransactionById(id),
    enabled: !!id,
  });
}
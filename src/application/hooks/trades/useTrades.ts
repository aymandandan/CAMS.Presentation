import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllTrades,
  fetchTradeById,
  fetchTradeByCode,
  createTrade,
  updateTrade,
  deleteTrade,
} from "@/infrastructure/api/tradesApi";
import type {
  CreateTradeRequest,
  UpdateTradeRequest,
} from "@/domain/trades/TradeTypes";

// ---- Query Keys ----
export const tradeKeys = {
  all: ["trades"] as const,
  lists: () => [...tradeKeys.all, "list"] as const,
  details: () => [...tradeKeys.all, "detail"] as const,
  detail: (id: string) => [...tradeKeys.details(), id] as const,
  byCode: (code: string) => [...tradeKeys.all, "by-code", code] as const,
};

// ---- Queries ----

export function useTradesQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: tradeKeys.lists(),
    queryFn: fetchAllTrades,
    ...options,
  });
}

export function useTradeQuery(id: string) {
  return useQuery({
    queryKey: tradeKeys.detail(id),
    queryFn: () => fetchTradeById(id),
    enabled: !!id,
  });
}

export function useTradeByCodeQuery(code: string) {
  return useQuery({
    queryKey: tradeKeys.byCode(code),
    queryFn: () => fetchTradeByCode(code),
    enabled: !!code,
  });
}

// ---- Mutations ----

export function useCreateTradeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateTradeRequest) => createTrade(request),
    onSuccess: () => {
      // Invalidate the list – new trade appears
      queryClient.invalidateQueries({ queryKey: tradeKeys.lists() });
    },
  });
}

export function useUpdateTradeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateTradeRequest) => updateTrade(request),
    onSuccess: (_, variables) => {
      // Invalidate list and the specific detail
      queryClient.invalidateQueries({ queryKey: tradeKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: tradeKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteTradeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTrade(id),
    onSuccess: () => {
      // Invalidate list – deleted trade disappears
      queryClient.invalidateQueries({ queryKey: tradeKeys.lists() });
    },
  });
}

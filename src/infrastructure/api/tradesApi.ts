import axiosClient from "@/infrastructure/api/axiosClient";
import type {
  TradeDto,
  CreateTradeRequest,
  UpdateTradeRequest,
} from "@/domain/trades/TradeTypes";
import type { Result } from "@/domain/shared/Result"; // Generic Result type

// Helper to unwrap the standard Result<T> response
function unwrap<T>(response: { data: Result<T> }): T {
  const result = response.data;
  if (!result.succeeded) {
    const firstError = result.errors?.[0];
    throw new Error(
      firstError?.description || result.error || "An unknown error occurred",
    );
  }
  return result.data as T;
}

/**
 * GET /api/trades
 */
export async function fetchAllTrades(): Promise<TradeDto[]> {
  const response = await axiosClient.get<Result<TradeDto[]>>("/trades");
  return unwrap(response);
}

/**
 * GET /api/trades/{id}
 */
export async function fetchTradeById(id: string): Promise<TradeDto> {
  const response = await axiosClient.get<Result<TradeDto>>(`/trades/${id}`);
  return unwrap(response);
}

/**
 * GET /api/trades/by-code?code=...
 */
export async function fetchTradeByCode(code: string): Promise<TradeDto> {
  const response = await axiosClient.get<Result<TradeDto>>("/trades/by-code", {
    params: { code },
  });
  return unwrap(response);
}

/**
 * POST /api/trades
 */
export async function createTrade(
  request: CreateTradeRequest,
): Promise<string> {
  const response = await axiosClient.post<Result<string>>("/trades", request);
  return unwrap(response);
}

/**
 * PUT /api/trades/{id}
 */
export async function updateTrade(request: UpdateTradeRequest): Promise<void> {
  const response = await axiosClient.put<Result>(
    `/trades/${request.id}`,
    request,
  );
  unwrap(response); // void, returns nothing
}

/**
 * DELETE /api/trades/{id}
 */
export async function deleteTrade(id: string): Promise<void> {
  const response = await axiosClient.delete<Result>(`/trades/${id}`);
  unwrap(response);
}

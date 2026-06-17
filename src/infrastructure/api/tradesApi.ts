import axiosClient from "@/infrastructure/api/axiosClient";
import type {
  TradeDto,
  CreateTradeRequest,
  UpdateTradeRequest,
} from "@/domain/trades/TradeTypes";
import type { Result } from "@/domain/shared/Result";
import { extractData, getErrorMessage } from "@/lib/utils/ResponseUtils";

/**
 * GET /api/trades
 */
export async function fetchAllTrades(): Promise<TradeDto[]> {
  try {
    const response = await axiosClient.get<Result<TradeDto[]>>("/trades");
    return extractData<TradeDto[]>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * GET /api/trades/{id}
 */
export async function fetchTradeById(id: string): Promise<TradeDto> {
  try {
    const response = await axiosClient.get<Result<TradeDto>>(`/trades/${id}`);
    return extractData<TradeDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * GET /api/trades/by-code?code=...
 */
export async function fetchTradeByCode(code: string): Promise<TradeDto> {
  try {
    const response = await axiosClient.get<Result<TradeDto>>(
      "/trades/by-code",
      {
        params: { code },
      },
    );
    return extractData<TradeDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * POST /api/trades
 */
export async function createTrade(
  request: CreateTradeRequest,
): Promise<string> {
  try {
    const response = await axiosClient.post<Result<string>>("/trades", request);
    return extractData<string>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * PUT /api/trades/{id}
 */
export async function updateTrade(request: UpdateTradeRequest): Promise<void> {
  try {
    const response = await axiosClient.put<Result>(
      `/trades/${request.id}`,
      request,
    );
    extractData(response); // void, returns nothing
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * DELETE /api/trades/{id}
 */
export async function deleteTrade(id: string): Promise<void> {
  try {
    const response = await axiosClient.delete<Result>(`/trades/${id}`);
    extractData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

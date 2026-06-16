export interface TradeDto {
  id: string; // GUID
  code: string;
  name: string;
  description?: string | null;
}

// Request payloads for mutations
export interface CreateTradeRequest {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateTradeRequest {
  id: string;
  name: string;
  description?: string;
}

// No request body for Delete – ID is passed in URL

import axiosClient from "@/infrastructure/api/axiosClient";
import type {
  PurchaseOrderListItemDto,
  PurchaseOrderDetailsDto,
  CreatePurchaseOrderRequest,
  GetPurchaseOrdersQueryParams,
} from "@/domain/purchaseOrders/PurchaseOrderTypes";
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

export async function getPurchaseOrders(
  params: GetPurchaseOrdersQueryParams
): Promise<PaginatedList<PurchaseOrderListItemDto>> {
  const response = await axiosClient.get("/purchaseorders", { params });
  return extractData<PaginatedList<PurchaseOrderListItemDto>>(response);
}

export async function getPurchaseOrderById(
  id: string
): Promise<PurchaseOrderDetailsDto> {
  const response = await axiosClient.get(`/purchaseorders/${id}`);
  return extractData<PurchaseOrderDetailsDto>(response);
}

export async function createPurchaseOrder(
  data: CreatePurchaseOrderRequest
): Promise<string> {
  const response = await axiosClient.post("/purchaseorders", data);
  return extractData<string>(response);
}

export async function receivePurchaseOrder(id: string): Promise<void> {
  const response = await axiosClient.post(`/purchaseorders/${id}/receive`);
  extractData(response); // result may not have data
}

export async function cancelPurchaseOrder(id: string): Promise<void> {
  const response = await axiosClient.patch(`/purchaseorders/${id}/cancel`);
  extractData(response);
}
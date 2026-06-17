import axiosClient from "@/infrastructure/api/axiosClient";
import type {
  PurchaseOrderListItemDto,
  PurchaseOrderDetailsDto,
  CreatePurchaseOrderRequest,
  GetPurchaseOrdersQueryParams,
} from "@/domain/purchaseOrders/PurchaseOrderTypes";
import type { PaginatedList } from "@/domain/shared";
import { extractData, getErrorMessage } from "@/lib/utils/ResponseUtils";

export async function getPurchaseOrders(
  params: GetPurchaseOrdersQueryParams,
): Promise<PaginatedList<PurchaseOrderListItemDto>> {
  try {
    const response = await axiosClient.get("/purchaseorders", { params });
    return extractData<PaginatedList<PurchaseOrderListItemDto>>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function getPurchaseOrderById(
  id: string,
): Promise<PurchaseOrderDetailsDto> {
  try {
    const response = await axiosClient.get(`/purchaseorders/${id}`);
    return extractData<PurchaseOrderDetailsDto>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function createPurchaseOrder(
  data: CreatePurchaseOrderRequest,
): Promise<string> {
  try {
    const response = await axiosClient.post("/purchaseorders", data);
    return extractData<string>(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function receivePurchaseOrder(id: string): Promise<void> {
  try {
    const response = await axiosClient.post(`/purchaseorders/${id}/receive`);
    extractData(response); // result may not have data
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function cancelPurchaseOrder(id: string): Promise<void> {
  try {
    const response = await axiosClient.patch(`/purchaseorders/${id}/cancel`);
    extractData(response);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

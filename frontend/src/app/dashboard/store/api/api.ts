import api from "@/lib/axios"; 
import { toast } from "sonner";
import {
  ApiResponse,
  TDashboardStats,
  TLojaResponse,
  TMonthlyRevenue,
  TPedidoResponse,
} from "./types"

function handleApiError(error: unknown): never {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    (error as any).response?.data
  ) {
    const backendError = (error as any).response.data;
    toast.error(backendError.message || "Erro inesperado na API.");
    throw new Error(backendError.message || "Erro desconhecido no servidor.");
  }
  toast.error("Sem conexão com o servidor.");
  throw new Error("Sem conexão com o servidor.");
}

export async function getLojasByDono(
  donoId: string
): Promise<TLojaResponse[]> {
  try {
    const response = await api.get<ApiResponse<TLojaResponse[]>>(
      `/lojas/dono/${donoId}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function updateLoja(
  id: string,
  values: Partial<TLojaResponse>
): Promise<TLojaResponse> {
  try {
    const response = await api.put<ApiResponse<TLojaResponse>>(
      `/lojas/${id}`,
      values
    );
    toast.success(response.data?.message || "Loja atualizada com sucesso!");
    return response.data.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function deleteLoja(id: string): Promise<void> {
  try {
    const response = await api.delete(`/lojas/${id}`);
    toast.success((response.data as any)?.message || "Loja removida com sucesso!");
  } catch (error) {
    handleApiError(error);
  }
}

export async function getDashboardStats(
  lojaId: string
): Promise<TDashboardStats> {
  try {
    const { data } = await api.get<ApiResponse<TDashboardStats>>(
      `/pedidos/dashboard/${lojaId}`
    );
    return data.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getMonthlyRevenue(
  lojaId: string
): Promise<TMonthlyRevenue[]> {
  try {
    const { data } = await api.get<ApiResponse<TMonthlyRevenue[]>>(
      `/pedidos/faturamento-mes/${lojaId}`
    );
    return data.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getRecentOrders(
  lojaId: string
): Promise<TPedidoResponse[]> {
  try {
    const params = new URLSearchParams();
    params.append("limit", "5");

    const { data } = await api.get<ApiResponse<TPedidoResponse[]>>(
      `/pedidos/loja/${lojaId}`,
      { params }
    );
    return data.data;
  } catch (error) {
    handleApiError(error);
  }
}
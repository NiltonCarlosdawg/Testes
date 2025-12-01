import api from "../axios";
import { toast } from "sonner";

export enum StatusLoja {
  APROVADO = "aprovado",
  PENDENTE = "pendente",
  ATIVA = "ativa",
  SUSPENSA = "suspensa",
  INATIVA = "inativa",
}

export type TEnderecoComercial = {
  rua: string;
  numero?: string | undefined;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  complemento?: string | undefined;
};

export type TLojaDbRow = {
  id: string;
  dono_id: string;
  nome: string;
  descricao?: string;
  logo_url?: string;
  banner_url?: string;
  status: StatusLoja;
  documento_identificacao?: string;
  email_comercial?: string;
  telefone_comercial?: string;
  endereco_comercial?: TEnderecoComercial | string;
  aprovado_por?: string;
  aprovado_em?: Date;
  created_at: Date;
  updated_at: Date;
};

export type Loja= {
  id: string;
  donoId: string;
  nome: string;
  descricao?: string;
  logoUrl?: string;
  bannerUrl?: string;
  status: StatusLoja;
  documentoIdentificacao?: string;
  emailComercial?: string;
  telefoneComercial?: string;
  enderecoComercial?: TEnderecoComercial;
  aprovadoPor?: string;
  aprovadoEm?: Date;
  createdAt: Date;
  updatedAt: Date;
};


export interface LojaApiResponse {
  status: "success" | "error";
  data: Loja[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  };
}

export interface LojaSingleResponse {
  status: "success" | "error";
  message?: string;
  data: Loja;
}

function handleApiError(error: unknown): never {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    (error as any).response?.data
  ) {
    const backendError = (error as any).response.data;
    toast(backendError.message || "Erro inesperado na API.");
    throw new Error(backendError.message || "Erro desconhecido no servidor.");
  }

  toast("Sem conexão com o servidor.");
  throw new Error("Sem conexão com o servidor.");
}

export async function getLojas(
  page = 1,
  limit = 10,
  search = ""
): Promise<LojaApiResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append("search", search);

    const response = await api.get<LojaApiResponse>("/lojas", { params });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getLojaById(id: string): Promise<Loja> {
  try {
    const response = await api.get<LojaSingleResponse>(`/lojas/${id}`);
    return response.data.data;
  } catch (error) {
    handleApiError(error);
  }
}

/** 🔹 Obter lojas de um dono específico */
export async function getLojasByDono(donoId: string): Promise<Loja[]> {
  try {
    const response = await api.get<LojaApiResponse>(`/lojas/dono/${donoId}`);
    return response.data.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function createLoja(values: Partial<Loja>): Promise<Loja> {
  try {
    const response = await api.post<LojaSingleResponse>("/lojas", values);
    toast(response.data.message || "Loja criada com sucesso!");
    return response.data.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function updateLoja(id: string, values: Partial<Loja>): Promise<Loja> {
  try {
    const response = await api.put<LojaSingleResponse>(`/lojas/${id}`, values);
    toast(response.data?.message || "Loja atualizada com sucesso!");
    return response.data.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function deleteLoja(id: string): Promise<void> {
  try {
    const response = await api.delete(`/lojas/${id}`);
    toast((response.data as any)?.message || "Loja removida com sucesso!");
  } catch (error) {
    handleApiError(error);
  }
}

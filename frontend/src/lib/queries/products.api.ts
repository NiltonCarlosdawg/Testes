import { Product, ProductApiResponse } from "@/types/product";
import api from "../axios";
import { toast } from "sonner";
import { ApiResponse } from "@/types/carrinho.types";

function handleApiError(error: any): never {
  if (error.response?.data) {
    const backendError = error.response.data;
    toast(backendError.message || "Erro inesperado na API.");

    throw new Error(
      backendError.message ||
        `Erro desconhecido: ${error.response.status}`
    );
  }

  toast("Sem conexão com o servidor.");
  throw new Error("Sem conexão com o servidor.");
}


export async function getCategories() {
  try {
    const response = await api.get("/categorias");
    return response.data.data;
  } catch (error: any) {
    handleApiError(error);
  }
}


export async function getProducts(filters: any) {
  try {
    const params = new URLSearchParams();

    Object.entries(filters || {}).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params.append(key, value.join(","));
      } else if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await api.get("/produtos", { params });
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
}


export async function getFilterOptions() {
  try {
    const response = await api.get("/produtos/filters");
    return response.data.data;
  } catch (error: any) {
    handleApiError(error);
  }
}


export async function createProduct(formData: FormData) {
  try {
    const response = await api.post("/produtos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    toast(response.data.message || "Produto criado com sucesso.");
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
}


export async function getProductById(id: string): Promise<Product> {
  try {
    const response = await api.get<ApiResponse<Product>>(`/produtos/${id}`);
    return response.data.data
  } catch (error) {
    handleApiError(error);
  }
}

export async function getProductByLoja(id: string): Promise<Product[]> {
  try {
    const response = await api.get<ApiResponse<Product[]>>(`/produtos/loja/${id}`);
    return response.data.data
  } catch (error) {
    handleApiError(error);
  }
}

export async function updateProduct(id: string, values: Product) {
  try {
    const response = await api.put(`/produtos/${id}`, values);
    toast(response.data.message || "Produto atualizado com sucesso.");
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
}


export async function deleteProduct(id: string) {
  try {
    const response = await api.delete(`/produtos/${id}`);
    toast(response.data.message || "Produto removido com sucesso.");
    return response.data;
  } catch (error: any) {
    handleApiError(error);
  }
}

export async function getRelatedProducts(categoryId: string, currentId: string): Promise<Product[]> {
  try {
    const response = await api.get<ProductApiResponse>("/produtos", {
      params: { limit: 10 },
    });
    return response.data.data.filter(p => p.id !== currentId);
  } catch (error: any) {
    handleApiError(error);
  }
}

export const getProductReviews = async (id: string) => {
  return [
    { id: '1', rating: 5, comment: 'Ótimo produto!', author: 'João' },
    { id: '2', rating: 4, comment: 'Gostei bastante.', author: 'Maria' },
    {id: '2', rating: 4, comment: 'Gostei Muito.', author: 'MariaJota', user:id}
  ];
};

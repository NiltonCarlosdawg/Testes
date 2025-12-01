import api from '@/lib/axios'
import { revalidatePath } from 'next/cache'
import { ApiResponse, TCarrinhoItemWithProductResponse } from '@/types/carrinho.types'

export const getCarrinhoByUser = async (): Promise<ApiResponse<TCarrinhoItemWithProductResponse[]>> => {
  const { data } = await api.get('/carrinho/user')
  return data
}

export const updateCarrinhoItem = async (id: string, payload: { quantidade: number }) => {
  'use server'
  await api.put(`/carrinho/${id}`, payload)
  revalidatePath('/checkout')
  revalidatePath('/cart')
}

export const deleteCarrinhoItem = async (id: string) => {
  'use server'
  await api.delete(`/carrinho/${id}`)
  revalidatePath('/checkout')
  revalidatePath('/cart')
}

export async function criarItemCarrinho(payload: any) {
  try {
    const res = await api.post("/carrinho", payload);
    return res.data;
  } catch (error: any) {
    throw error;
  }
}

export async function listarCarrinho(params?: any) {
  try {
    const res = await api.get("/carrinho", { params });
    return res.data;
  } catch (error: any) {
    throw error;
  }
}

export async function buscarItemPorId(id: string) {
  try {
    const res = await api.get(`/carrinho/${id}`);
    return res.data;
  } catch (error: any) {
    throw error;
  }
}

export async function listarCarrinhoDoUsuario(): Promise<{
  status: string;
  data: TCarrinhoItemWithProductResponse[];
}> {
  try {
    const res = await api.get("/carrinho/user");
    return res.data;
  } catch (error: any) {
    throw error;
  }
}

export async function atualizarItemCarrinho(
  id: string,
  payload: { quantidade: number }
) {
  try {
    const res = await api.put(`/carrinho/${id}`, payload);
    return res.data;
  } catch (error: any) {
    throw error;
  }
}

export async function deletarItemCarrinho(id: string) {
  try {
    const res = await api.delete(`/carrinho/${id}`);
    return res.data;
  } catch (error: any) {
    throw error;
  }
}
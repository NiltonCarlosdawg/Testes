'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckIcon, TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { Minus, Plus, Package, Truck, Shield, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useUpdateCarrinhoItem, useDeleteCarrinhoItem } from '@/lib/queries/useCarrinho';
import Breadcrumb from '@/shared/Breadcrumb';
import ButtonPrimary from '@/shared/Button/ButtonPrimary';
import Cookies from "js-cookie";
import ButtonSecondary from '@/shared/Button/ButtonSecondary';
import { useRouter } from "next/navigation";

const CartPage = () => {

  const router = useRouter(); 

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (!token) {
      Cookies.remove("user")
      router.push("/login"); 
    }
  }, [router]);

  const {
    items: cart,
    updateQuantity,
    removeItem,
    loadFromServer,
  } = useCartStore();

  const updateMutation = useUpdateCarrinhoItem();
  const deleteMutation = useDeleteCarrinhoItem();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsInitialLoading(true);
      await loadFromServer();
      setIsInitialLoading(false);
    };
    load();
  }, [loadFromServer]);

  const subtotal = cart.reduce((acc, item) => {
    const preco = (item.produto?.preco || 0) 
    return acc + (preco * item.quantidade);
  }, 0);

  const shippingEstimate = subtotal > 100 ? 0 : 15;
  const taxEstimate = subtotal * 0.1;
  const total = subtotal + shippingEstimate + taxEstimate;

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
    
    try {
      await updateMutation.mutateAsync({
        id: itemId,
        data: { quantidade: newQuantity }
      });
    } catch (error) {
      await loadFromServer();
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm('Tem certeza que deseja remover este item do carrinho?')) return;
    
    // Remove localmente primeiro
    removeItem(itemId);
    
    try {
      await deleteMutation.mutateAsync(itemId);
    } catch (error) {
      await loadFromServer();
    }
  };

  const renderProduct = (item: any, index: number) => {
    const produto = item.produto;
    const variacao = item.variacao;
    const preco = (produto?.preco || 0)
    const precoTotal = preco * item.quantidade;

    return (
      <div
        key={item.id}
        className="group relative flex gap-4 border-b border-neutral-200 py-6 last:border-b-0 sm:gap-6 sm:py-8 dark:border-neutral-700"
      >
        {/* IMAGEM DO PRODUTO */}
        <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-40 sm:w-32">
          {produto?.imagens?.[0]?.url && (
            <Image
              fill
              src={produto.imagens[0].url}
              alt={produto.titulo || ''}
              sizes="200px"
              className="rounded-xl object-cover"
              priority={index < 3}
            />
          )}
          <Link href={`/produtos/${produto?.slug || produto?.id}`} className="absolute inset-0" />
        </div>

        {/* DETALHES DO PRODUTO */}
        <div className="flex flex-1 flex-col">
          {/* Cabeçalho: Título + Preço */}
          <div className="flex justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-base font-semibold text-neutral-900 line-clamp-2 dark:text-neutral-100">
                <Link 
                  href={`/produtos/${produto?.slug || produto?.id}`}
                  className="hover:text-primary-600 transition-colors"
                >
                  {produto?.titulo}
                </Link>
              </h3>

              {/* Variações */}
              {variacao && (
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                  {variacao.cor && (
                    <div className="flex items-center gap-1.5">
                      <div 
                        className="h-4 w-4 rounded-full border border-neutral-300 dark:border-neutral-600"
                        style={{ backgroundColor: variacao.cor }}
                      />
                      <span>Cor: {variacao.cor}</span>
                    </div>
                  )}
                  {variacao.tamanho && (
                    <div className="flex items-center gap-1.5">
                      <Package size={16} strokeWidth={1.5} />
                      <span>Tamanho: {variacao.tamanho}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Preço Unitário */}
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                AOA {preco.toFixed(2)} cada
              </p>

              {/* Status */}
              <div className="mt-3">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <CheckIcon className="h-3.5 w-3.5" strokeWidth={2} />
                  <span>Em Estoque</span>
                </div>
              </div>
            </div>

            {/* Preço Total Desktop */}
            <div className="hidden sm:block">
              <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                AOA {precoTotal.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Footer: Quantidade + Ações */}
          <div className="mt-auto flex items-center justify-between gap-4 pt-4">
            {/* Controle de Quantidade */}
            <div className="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-1 py-1 dark:border-neutral-600 dark:bg-neutral-800">
              <button
                onClick={() => handleQuantityChange(item.id, item.quantidade - 1)}
                disabled={item.quantidade <= 1 || updateMutation.isPending}
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-neutral-700"
                aria-label="Diminuir quantidade"
              >
                {updateMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Minus size={16} strokeWidth={2} />
                )}
              </button>
              <span className="min-w-[2rem] text-center text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {item.quantidade}
              </span>
              <button
                onClick={() => handleQuantityChange(item.id, item.quantidade + 1)}
                disabled={updateMutation.isPending}
                className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-neutral-700"
                aria-label="Aumentar quantidade"
              >
                {updateMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} strokeWidth={2} />
                )}
              </button>
            </div>

            {/* Preço Total Mobile */}
            <div className="sm:hidden">
              <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                AOA {precoTotal.toFixed(2)}
              </p>
            </div>

            {/* Botão Remover */}
            <button
              onClick={() => handleRemoveItem(item.id)}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-1.5 text-sm font-medium text-red-600 transition-colors hover:text-red-700 disabled:opacity-50"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TrashIcon className="h-4 w-4" strokeWidth={2} />
              )}
              <span className="hidden sm:inline">Remover</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isInitialLoading) {
    return (
      <div className="nc-CartPage">
        <main className="container py-16 lg:py-28">
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-600" />
              <p className="mt-4 text-sm text-neutral-500">Carregando carrinho...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="nc-CartPage">
      <main className="container py-16 lg:py-28">
        {/* Cabeçalho */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-neutral-100">
            Carrinho de Compras
          </h1>
          <Breadcrumb
            breadcrumbs={[{ id: 1, name: 'Início', href: '/' }]}
            currentPage="Carrinho"
            className="mt-4"
          />
        </div>

        {cart.length === 0 ? (
          /* CARRINHO VAZIO */
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 py-20 dark:border-neutral-700">
            <div className="mb-6 rounded-full bg-neutral-100 p-6 dark:bg-neutral-800">
              <ShoppingCartIcon className="h-16 w-16 text-neutral-400" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Seu carrinho está vazio
            </h3>
            <p className="mb-8 text-neutral-500 dark:text-neutral-400">
              Adicione produtos para começar suas compras
            </p>
            <ButtonPrimary href="/produtos">
              Explorar Produtos
            </ButtonPrimary>
          </div>
        ) : (
          /* CARRINHO COM ITENS */
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
            {/* LISTA DE PRODUTOS */}
            <div className="flex-1">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Itens ({cart.length})
                  </h2>
                </div>
                <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {cart.map((item, index) => renderProduct(item, index))}
                </div>
              </div>
            </div>

            {/* RESUMO DO PEDIDO */}
            <div className="lg:w-[400px] xl:w-[440px]">
              <div className="sticky top-8 space-y-6">
                {/* Card do Resumo */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 dark:border-neutral-700 dark:bg-neutral-900">
                  <h3 className="mb-6 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Resumo do Pedido
                  </h3>

                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                      <span>Subtotal</span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        AOA {subtotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                      <span>
                        Envio {subtotal > 100 && (
                          <span className="ml-1 text-emerald-600 dark:text-emerald-400">(Grátis!)</span>
                        )}
                      </span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        AOA {shippingEstimate.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                      <span>Impostos</span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        AOA {taxEstimate.toFixed(2)}
                      </span>
                    </div>

                    <div className="border-t border-neutral-200 pt-4 dark:border-neutral-700">
                      <div className="flex justify-between text-base font-semibold text-neutral-900 dark:text-neutral-100">
                        <span>Total</span>
                        <span className="text-lg">AOA {total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {subtotal < 100 && (
                    <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                      <p>
                        <strong>Falta pouco!</strong> Adicione mais AOA {(100 - subtotal).toFixed(2)} para frete grátis
                      </p>
                    </div>
                  )}

                  <div className="mt-6 space-y-3">
                    <ButtonPrimary href="/checkout" className="w-full" >
                      Finalizar Compra
                    </ButtonPrimary>
                    <ButtonSecondary href="/produtos" className="w-full">
                      Continuar Comprando
                    </ButtonSecondary>
                  </div>
                </div>

                {/* Benefícios */}
                <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary-50 p-2 dark:bg-primary-900/20">
                      <Truck className="h-5 w-5 text-primary-600 dark:text-primary-400" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        Envio rápido
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Receba em até 7 dias úteis
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-emerald-50 p-2 dark:bg-emerald-900/20">
                      <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        Compra segura
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Seus dados protegidos
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
import { useCartStore } from './useCartStore';
import { v4 as uuidv4 } from 'uuid';
import { TCarrinhoItemWithProductResponse } from '@/types/carrinho.types';

export const useAddToCart = () => {
  const addItem = useCartStore((s) => s.addItem);

  return (produto: any, variacao?: any, quantidade = 1) => {
    const localId = `local-${uuidv4()}`;

    const item: TCarrinhoItemWithProductResponse = {
      id: localId,
      userId: 'temp',
      produtoId: produto.id,
      variacaoId: variacao?.id || null,
      quantidade,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      produto: {
        id: produto.id,
        titulo: produto.titulo,
        slug: produto.slug,
        preco: produto.preco,
        precoPromocional: produto.precoPromocional,
        imagens: produto.imagens,
      },
      variacao: variacao
        ? {
            id: variacao.id,
            cor: variacao.cor,
            tamanho: variacao.tamanho,
            preco: variacao.preco,
            estoque: variacao.estoque,
          }
        : null,
    };

    addItem(item);
  };
};

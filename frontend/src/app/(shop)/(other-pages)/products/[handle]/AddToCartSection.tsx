'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NcInputNumber from '@/components/shop/NcInputNumber'
import ProductForm from '@/components/shop/ProductForm/ProductForm'
import AddToCardButton from '@/components/shop/AddToCardButton'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'

interface AddToCartSectionProps {
  product: any
}

export default function AddToCartSection({ product }: AddToCartSectionProps) {
  const router = useRouter()
  const [quantitySelected, setQuantitySelected] = useState(1)
  
  const featuredImage = product.imagens && product.imagens.length > 0 ? product.imagens[0] : null

  const handleBuyNow = () => {
    router.push('/checkout')
  }

  return (
    <ProductForm product={product}>
      <fieldset className="flex flex-col gap-y-8">
        {/* VARIANTES (se tiveres) */}
        <div className="flex flex-col gap-y-6">
          {/* <ProductColorOptions options={[]} defaultColor="" /> */}
          {/* <ProductSizeOptions options={[]} defaultSize="" /> */}
        </div>

        {/* SEÇÃO DE QUANTIDADE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Quantidade
            </label>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {product.quantidadeEstoque} disponíveis
            </span>
          </div>
          <NcInputNumber 
            defaultValue={1} 
            min={1}
            max={product.quantidadeEstoque}
            onChange={(value) => setQuantitySelected(value)}
            className="w-full"
          />
        </div>

        {/* BOTÕES DE AÇÃO */}
        <div className="flex flex-col gap-3 pt-2">
          {/* BOTÃO ADICIONAR AO CARRINHO */}
          <AddToCardButton
            produtoId={product.id}
            as="button"
            className="w-full flex items-center justify-center gap-2.5 rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-medium text-white shadow-lg hover:bg-neutral-800 active:scale-[0.98] transition-all duration-150"
            title={product.titulo}
            imageUrl={featuredImage?.url || ''}
            price={product.preco}
            quantity={quantitySelected}
            color={product.marca}
          >
            <ShoppingBagIcon className="size-5" strokeWidth={2} />
            <span>Adicionar ao carrinho</span>
          </AddToCardButton>

          {/* BOTÃO COMPRAR AGORA */}
          <button
            type="button"
            onClick={handleBuyNow}
            className="w-full rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] transition-all duration-150"
          >
            Comprar agora
          </button>
        </div>

        {/* INFO ADICIONAL */}
        <div className="flex items-start gap-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 px-4 py-3">
          <svg 
            className="size-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
          <div className="flex-1">
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              <span className="font-semibold">Entrega rápida</span> • Frete grátis acima de AOA 150
            </p>
          </div>
        </div>
      </fieldset>
    </ProductForm>
  )
}
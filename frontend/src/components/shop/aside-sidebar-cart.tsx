'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronDownIcon, TrashIcon } from '@heroicons/react/20/solid'
import { Loader2, ShoppingBag } from 'lucide-react'
import clsx from 'clsx'
import {
  useGetCarrinhoByUser,
  useUpdateCarrinhoItem,
  useDeleteCarrinhoItem,
} from '@/lib/queries/useCarrinho'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonSecondary from '@/shared/Button/ButtonSecondary'
import { Link } from '@/shared/link'
import Prices from '@/components/shop/Prices'
import { Aside } from '@/components/shop/aside/aside'
import { TCarrinhoItemWithProductResponse } from '@/types/carrinho.types'

interface Props {
  className?: string
}

const AsideSidebarCart = ({ className = '' }: Props) => {
  const { data: cartData, isLoading } = useGetCarrinhoByUser()
  const updateItem = useUpdateCarrinhoItem()
  const deleteItem = useDeleteCarrinhoItem()
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())
  const cart = (cartData?.data ?? [])

  const subtotal = cart.reduce((acc, item) => {
    const basePrice =
      item.variacao?.preco ??
      item.produto?.precoPromocional ??
      item.produto?.preco ??
      0

    return acc + basePrice * item.quantidade
  }, 0)

  const shippingEstimate = subtotal > 100 ? 0 : 15
  const taxEstimate = subtotal * 0.1
  const total = subtotal + shippingEstimate + taxEstimate

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setUpdatingItems(prev => new Set(prev).add(itemId))

    try {
      await updateItem.mutateAsync({ id: itemId, data: { quantidade: newQuantity } })
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    await deleteItem.mutateAsync(itemId)
  }

  return (
    <Aside openFrom="right" type="cart" heading="Carrinho de Compras">
      <div className={clsx('flex h-full flex-col', className)}>
        {/* CONTENT */}
        <div className="hidden-scrollbar flex-1 overflow-x-hidden overflow-y-auto py-6">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-4 text-center">
              <ShoppingBag className="mb-4 h-16 w-16 text-neutral-300 dark:text-neutral-600" />
              <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Carrinho vazio
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Adicione produtos para começar suas compras
              </p>
            </div>
          ) : (
            <div className="flow-root">
              <ul role="list" className="-my-6 divide-y divide-neutral-900/10 dark:divide-neutral-100/10">
                {cart.map(item => (
                  <CartProduct
                    key={item.id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemoveItem}
                    isUpdating={updatingItems.has(item.id)}
                    isDeleting={deleteItem.isPending}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {cart.length > 0 && (
          <section className="mt-auto grid shrink-0 gap-4 border-t border-neutral-900/10 py-6 dark:border-neutral-100/10">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between font-medium text-neutral-900 dark:text-neutral-100">
                <p>Subtotal</p>
                <p>AOA {subtotal.toFixed(2)}</p>
              </div>

              <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                <p>Envio</p>
                <p className={clsx(shippingEstimate === 0 && 'text-emerald-600 dark:text-emerald-400')}>
                  {shippingEstimate === 0 ? 'Grátis!' : `AOA ${shippingEstimate.toFixed(2)}`}
                </p>
              </div>

              <div className="flex justify-between text-neutral-500 dark:text-neutral-400">
                <p>Impostos</p>
                <p>AOA {taxEstimate.toFixed(2)}</p>
              </div>

              <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-semibold text-neutral-900 dark:border-neutral-700 dark:text-neutral-100">
                <p>Total</p>
                <p>AOA {total.toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <ButtonSecondary href={'/cart'}>Ver carrinho</ButtonSecondary>
              <ButtonPrimary href={'/checkout'}>Finalizar</ButtonPrimary>
            </div>

            <div className="mt-6 flex justify-center text-center text-sm text-neutral-500 dark:text-neutral-400">
              <p className="text-xs">
                ou{' '}
                <Link href={'/collections/all'} className="text-xs font-medium uppercase hover:text-primary-600">
                  Continuar Comprando →
                </Link>
              </p>
            </div>
          </section>
        )}
      </div>
    </Aside>
  )
}

interface CartProductProps {
  item: TCarrinhoItemWithProductResponse
  onQuantityChange: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  isUpdating: boolean
  isDeleting: boolean
}

const CartProduct = ({ item, onQuantityChange, onRemove, isUpdating, isDeleting }: CartProductProps) => {
  const produto = item.produto
  const variacao = item.variacao

  const basePrice =
    variacao?.preco ??
    produto?.precoPromocional ??
    produto?.preco ??
    0

  return (
    <div className="flex py-6">
      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
        {produto?.imagens?.[0]?.url && (
          <Image
            fill
            src={produto.imagens[0].url}
            alt={produto.titulo || 'Imagem do produto'}
            className="object-contain"
            sizes="200px"
          />
        )}
        <Link className="absolute inset-0" href={`/produtos/${produto?.slug}`} />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div className="flex justify-between">
          <div className="flex-1 pr-2">
            <h3 className="text-base font-medium line-clamp-2">
              <Link href={`/produtos/${produto?.slug}`}>{produto?.titulo}</Link>
            </h3>

            {variacao && (
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {variacao.cor} {variacao.tamanho && `| ${variacao.tamanho}`}
              </p>
            )}
          </div>

          <Prices price={basePrice * item.quantidade} className="mt-0.5 shrink-0" />
        </div>

        <div className="mt-auto flex items-end justify-between pt-3 text-sm">
          <div className="relative inline-grid w-full max-w-20 grid-cols-1">
            <select
              name={`quantity-${item.id}`}
              aria-label={`Quantidade, ${produto?.titulo}`}
              className="appearance-none rounded-md py-1 ps-3 pe-8 text-xs outline outline-1 outline-neutral-900/10 disabled:opacity-50 dark:outline-white/15"
              value={item.quantidade}
              onChange={e => onQuantityChange(item.id, Number(e.target.value))}
              disabled={isUpdating}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>

            {isUpdating ? (
              <Loader2 className="absolute right-2 top-1/2 size-4 translate-y-[-50%] animate-spin" />
            ) : (
              <ChevronDownIcon className="absolute right-2 top-1/2 size-4 translate-y-[-50%]" />
            )}
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.id)}
            disabled={isDeleting}
            className="flex items-center gap-1 font-medium text-red-600 hover:text-red-500 disabled:opacity-50 dark:text-red-500"
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <TrashIcon className="h-3.5 w-3.5" />
            )}
            <span className="text-xs">Remover</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AsideSidebarCart

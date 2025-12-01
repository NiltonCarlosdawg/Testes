'use client'

import { useTransition, useOptimistic } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import NcInputNumber from '@/components/shop/NcInputNumber'
import Prices from '@/components/shop/Prices'
import Breadcrumb from '@/shared/Breadcrumb'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { Link } from '@/shared/link'
import { Coordinate01Icon, InformationCircleIcon, PaintBucketIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Information from './Information'

type CheckoutClientWrapperProps = {
  items: any[]
  user: any
  subtotal: number
  envio: number
  imposto: number
  total: number
  handleConfirmOrder: any
  handleUpdateQuantity: (id: string, quantidade: number) => Promise<{ success: boolean; message: string }>
  handleRemoveItem: (id: string) => Promise<{ success: boolean; message: string }>
}

type OptimisticAction = 
  | { type: 'UPDATE_QUANTITY'; id: string; quantidade: number }
  | { type: 'REMOVE_ITEM'; id: string }

const CheckoutClientWrapper = ({
  items: initialItems,
  user,
  envio,
  handleConfirmOrder,
  handleUpdateQuantity,
  handleRemoveItem,
}: CheckoutClientWrapperProps) => {
  const [isPending, startTransition] = useTransition()
  
  const [optimisticItems, updateOptimisticItems] = useOptimistic(
    initialItems,
    (state, action: OptimisticAction) => {
      if (action.type === 'UPDATE_QUANTITY') {
        return state.map(item => 
          item.id === action.id 
            ? { ...item, quantidade: action.quantidade }
            : item
        )
      }
      if (action.type === 'REMOVE_ITEM') {
        return state.filter(item => item.id !== action.id)
      }
      return state
    }
  )

  const subtotal = optimisticItems.reduce(
    (acc, item) => acc + item.produto.preco * item.quantidade, 
    0
  )
  const imposto = subtotal * 0.14
  const total = subtotal + envio + imposto

  const onUpdateQuantity = async (id: string, quantidade: number) => {
    if (quantidade < 1) return
    startTransition(() => {
      updateOptimisticItems({ type: 'UPDATE_QUANTITY', id, quantidade })
    })

    const result = await handleUpdateQuantity(id, quantidade)
    
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  const onRemoveItem = async (id: string) => {
    startTransition(() => {
      updateOptimisticItems({ type: 'REMOVE_ITEM', id })
    })
    const result = await handleRemoveItem(id)
    
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  const renderProduct = (item: any) => {
    const { id, produto, quantidade } = item
    const { nome, preco, imagens, cor, tamanho, slug } = produto

    return (
      <div key={id} className="relative flex py-8 first:pt-0 last:pb-0 sm:py-10 xl:py-12">
        <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:w-32">
          {imagens?.[0] && (
            <Image
              fill
              src={imagens[0]?.url}
              alt={nome}
              sizes="300px"
              className="object-contain object-center"
              priority
            />
          )}
          <Link href={'/produtos/' + slug} className="absolute inset-0"></Link>
        </div>

        <div className="ml-3 flex flex-1 flex-col sm:ml-6">
          <div>
            <div className="flex justify-between">
              <div className="flex-[1.5]">
                <h3 className="text-base font-semibold">
                  <Link href={'/produtos/' + slug}>{nome}</Link>
                </h3>
                <div className="mt-1.5 flex text-sm text-neutral-600 sm:mt-2.5 dark:text-neutral-300">
                  <div className="flex items-center gap-x-2">
                    <HugeiconsIcon icon={PaintBucketIcon} size={16} color="currentColor" strokeWidth={1.5} />
                    <span>{cor}</span>
                  </div>
                  <span className="mx-4 border-l border-neutral-200 dark:border-neutral-700"></span>
                  <div className="flex items-center gap-x-2">
                    <HugeiconsIcon icon={Coordinate01Icon} size={16} color="currentColor" strokeWidth={1.5} />
                    <span>{tamanho}</span>
                  </div>
                </div>

                <div className="relative mt-3 flex w-full justify-between sm:hidden">
                  <NcInputNumber 
                    className="relative z-10" 
                    defaultValue={quantidade}
                    onChange={(value) => onUpdateQuantity(id, value)}
                  />
                  <Prices contentClass="py-1 px-2 md:py-1.5 md:px-2.5 text-sm font-medium h-full" price={preco} />
                </div>
              </div>

              <div className="hidden flex-1 justify-end sm:flex">
                <Prices price={preco} className="mt-0.5" />
              </div>
            </div>
          </div>

          <div className="mt-auto flex items-end justify-between pt-4 text-sm">
            <div className="hidden sm:block">
              <NcInputNumber 
                className="relative z-10" 
                defaultValue={quantidade}
                onChange={(value) => onUpdateQuantity(id, value)}
              />
            </div>

            <button
              type="button"
              onClick={() => onRemoveItem(id)}
              disabled={isPending}
              className="relative z-10 mt-3 flex items-center text-sm font-medium text-red-600 hover:text-red-500 disabled:opacity-50"
            >
              Remover
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="container py-16 lg:pt-20 lg:pb-28">
      <div className="mb-16">
        <h1 className="mb-5 block text-3xl font-semibold lg:text-4xl">Finalizar Compra</h1>
        <Breadcrumb
          breadcrumbs={[
            { id: 1, name: 'Início', href: '/' },
            { id: 2, name: 'Carrinho', href: '/carrinho' },
          ]}
          currentPage="Checkout"
        />
      </div>

      <div className="flex flex-col lg:flex-row">
        <div className="flex-1">
          <Information 
            onConfirm={handleConfirmOrder.bind(null, {
              items: optimisticItems,
              user,
              subtotal,
              envio,
              imposto,
              total
            })} 
            user={user} 
          />
        </div>

        <div className="my-10 shrink-0 border-t lg:mx-10 lg:my-0 lg:border-t-0 lg:border-l xl:lg:mx-14 2xl:mx-16" />

        <div className="w-full lg:w-[36%]">
          <h3 className="text-lg font-semibold">Resumo da Encomenda</h3>
          <div className="mt-8 divide-y divide-neutral-200/70 dark:divide-neutral-700">
            {optimisticItems.map(renderProduct)}
          </div>

          <div className="mt-10 border-t border-neutral-200/70 pt-6 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            <div className="mt-4 flex justify-between py-2.5">
              <span>Subtotal</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                {subtotal.toLocaleString('pt-AO')} AOA
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <span>Envio</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                {envio.toLocaleString('pt-AO')} AOA
              </span>
            </div>
            <div className="flex justify-between py-2.5">
              <span>Imposto (14%)</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                {imposto.toLocaleString('pt-AO')} AOA
              </span>
            </div>
            <div className="flex justify-between pt-4 text-base font-semibold text-neutral-900 dark:text-neutral-200">
              <span>Total</span>
              <span>{total.toLocaleString('pt-AO')} AOA</span>
            </div>
          </div>

          <form action={handleConfirmOrder.bind(null, {
            items: optimisticItems,
            user,
            subtotal,
            envio,
            imposto,
            total
          })}>
            <ButtonPrimary type="submit" className="mt-8 w-full">
              Confirmar Encomenda
            </ButtonPrimary>
          </form>

          <div className="mt-5 flex items-center justify-center text-sm text-neutral-500 dark:text-neutral-400">
            <p className="relative block pl-5">
              <HugeiconsIcon
                icon={InformationCircleIcon}
                size={16}
                color="currentColor"
                className="absolute top-0.5 -left-1"
                strokeWidth={1.5}
              />
              Saiba mais sobre{` `}
              <Link href="#" className="font-medium text-neutral-900 underline dark:text-neutral-200">
                Impostos
              </Link>
              {` `}e{` `}
              <Link href="#" className="font-medium text-neutral-900 underline dark:text-neutral-200">
                Envio
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default CheckoutClientWrapper
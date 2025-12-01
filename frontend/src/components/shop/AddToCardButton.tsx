'use client'

import Prices from '@/components/shop/Prices'
import { useAddCarrinhoItem } from '@/lib/queries/useCarrinho'
import { Link } from '@/shared/link'
import { Transition } from '@headlessui/react'
import Image from 'next/image'
import React, { ComponentType, ElementType, FC } from 'react'
import toast from 'react-hot-toast'

// -------------------------------------
// Notify Toast
// -------------------------------------
interface NotifyAddToCartProps {
  show: boolean
  imageUrl: string
  title: string
  quantity: number
  size?: string
  color?: string
  price: number
}

export const NotifyAddToCart: FC<NotifyAddToCartProps> = ({ show, imageUrl, price, quantity, title }) => {
  return (
    <Transition
      appear
      as={'div'}
      show={show}
      className="pointer-events-auto w-full max-w-md rounded-2xl bg-white p-4 text-neutral-900 shadow-lg ring-1 ring-black/5 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-white/10"
      enter="transition-all duration-150"
      enterFrom="opacity-0 translate-x-20"
      enterTo="opacity-100 translate-x-0"
      leave="transition-all duration-150"
      leaveFrom="opacity-100 translate-x-0"
      leaveTo="opacity-0 translate-x-20"
    >
      <p className="mt-1 block text-base leading-none font-semibold">Adicionado ao carrinho!</p>

      <div className="mt-6 flex">
        <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
          <Image src={imageUrl} alt={title} fill sizes="100px" className="object-contain object-center" />
        </div>

        <div className="ml-4 flex flex-1 flex-col">
          <div className="flex justify-between">
            <h3 className="text-base font-medium">{title}</h3>
            <Prices price={price} className="mt-0.5" />
          </div>

          <div className="flex flex-1 items-end justify-between text-sm">
            <p className="text-neutral-400">{`Qty ${quantity}`}</p>
            <Link href="/cart" className="font-medium text-primary-600 dark:text-primary-500">
              Visualizar carrinho
            </Link>
          </div>
        </div>
      </div>
    </Transition>
  )
}

// -------------------------------------
// Button Props
// -------------------------------------
interface AddToCardButtonProps {
  produtoId: string
  variacaoId?: string | null
  quantity: number
  imageUrl: string
  title: string
  price: number
  size?: string
  color?: string
  as?: ElementType | ComponentType<any>
  className?: string
  children?: React.ReactNode
}

// -------------------------------------
// Button
// -------------------------------------
const AddToCardButton = ({
  produtoId,
  variacaoId,
  quantity,
  imageUrl,
  price,
  title,
  size,
  color,
  children,
  className,
  as,
  ...props
}: AddToCardButtonProps) => {
  const addItem = useAddCarrinhoItem()
  const Component = as || 'button'

  const handleAdd = () => {
    addItem.mutate(
      { produtoId, variacaoId, quantidade: quantity },
      {
        onSuccess: () => {
          toast.custom(
            (t) => (
              <NotifyAddToCart
                show={t.visible}
                imageUrl={imageUrl}
                quantity={quantity}
                size={size}
                color={color}
                title={title}
                price={price}
              />
            ),
            { position: 'top-right', duration: 4000 }
          )
        },
        onError: () => {
          toast.error('Não foi possível adicionar ao carrinho')
        },
      }
    )
  }

  return (
    <Component className={className} onClick={handleAdd} {...props}>
      {children}
    </Component>
  )
}

export default AddToCardButton

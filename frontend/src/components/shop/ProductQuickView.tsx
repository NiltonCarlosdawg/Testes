'use client'

import AccordionInfo from '@/components/shop/AccordionInfo'
import LikeButton from '@/components/shop/LikeButton'
import NcInputNumber from '@/components/shop/NcInputNumber'
import Prices from '@/components/shop/Prices'
import { Link } from '@/shared/link'
import { NoSymbolIcon, ShoppingBagIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import { FC, useState } from 'react'
import { Divider } from './Divider'
import ProductForm from './ProductForm/ProductForm'
import { useAside } from './aside'
import { useGetProductById } from '@/lib/queries/product'
import AddToCardButton from './AddToCardButton'

interface ProductQuickViewProps {
  className?: string
}

const ProductQuickView: FC<ProductQuickViewProps> = ({ className }) => {
  const { productQuickViewHandle: handle } = useAside()
  const [quantitySelected, setQuantitySelected] = useState(1) // <-- Estado da quantidade
  const productId = handle

  const { data: apiResponse, isLoading, isError } = useGetProductById(productId)

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center min-h-[400px]`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 dark:border-neutral-100"></div>
      </div>
    )
  }

  if (isError || !apiResponse?.data) {
    return (
      <div className={`${className} flex items-center justify-center min-h-[400px]`}>
        <p className="text-neutral-600 dark:text-neutral-400">Erro ao carregar produto</p>
      </div>
    )
  }

  const produto = apiResponse.data
  const imagens = produto.imagens
  const featuredImage = imagens && imagens.length > 0 ? imagens[0] : null

  const renderStatus = () => {
    const status = produto.quantidadeEstoque > 0 ? 'Disponível' : 'Esgotado'
    const CLASSES =
      'absolute top-3 start-3 px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-900 nc-shadow-lg rounded-full flex items-center justify-center text-neutral-700 text-neutral-900 dark:text-neutral-300'

    return (
      <div className={CLASSES}>
        {produto.quantidadeEstoque > 0 ? (
          <>
            <SparklesIcon className="h-3.5 w-3.5" />
            <span className="ms-1 leading-none">{status}</span>
          </>
        ) : (
          <>
            <NoSymbolIcon className="h-3.5 w-3.5" />
            <span className="ms-1 leading-none">{status}</span>
          </>
        )}
      </div>
    )
  }

  const renderSectionContent = () => {
    return (
      <div className="space-y-8">
        {/* CABEÇALHO */}
        <div>
          <h2 className="text-3xl font-semibold">
            <Link href={`/products/${handle}`}>{produto.titulo}</Link>
          </h2>

          <div className="mt-5 flex flex-wrap items-center justify-start gap-x-4 gap-y-1.5 sm:gap-x-5 rtl:justify-end">
            <Prices contentClass="py-1 px-2 md:py-1.5 md:px-3 text-lg font-semibold" price={produto.preco} />
            <div className="h-6 border-s border-neutral-300 dark:border-neutral-700"></div>
            <div className="flex items-center">
              <Link href={'/products/' + handle} className="flex items-center text-sm font-medium">
                <StarIcon className="h-5 w-5 pb-px text-yellow-400" />
                <div className="ms-1.5 flex">
                  <span>4.5</span>
                  <span className="mx-2 block">·</span>
                  <span className="text-neutral-600 underline dark:text-neutral-400">0 avaliações</span>
                </div>
              </Link>
              <span className="mx-2.5 hidden sm:block">·</span>
              <div className="hidden items-center text-sm sm:flex">
                <SparklesIcon className="h-3.5 w-3.5" />
                <span className="ms-1 leading-none">{produto.quantidadeEstoque > 0 ? 'Disponível' : 'Esgotado'}</span>
              </div>
            </div>
          </div>
        </div>


        <ProductForm product={produto}>
          <fieldset className="flex flex-col gap-y-8">
            {/* QUANTIDADE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Quantidade
                </label>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {produto.quantidadeEstoque} disponíveis
                </span>
              </div>
              <NcInputNumber
                defaultValue={1}
                min={1}
                max={produto.quantidadeEstoque}
                onChange={(value) => setQuantitySelected(value)}
                className="w-full"
              />
            </div>

            {/* BOTÕES DE AÇÃO – MESMO LAYOUT DA PÁGINA DO PRODUTO */}
            <div className="flex flex-col gap-3 pt-2">
              {/* ADICIONAR AO CARRINHO */}
              <AddToCardButton
                produtoId={produto.id}
                as="button"
                className="w-full flex items-center justify-center gap-2.5 rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-medium text-white shadow-lg hover:bg-neutral-800 active:scale-[0.98] transition-all duration-150"
                title={produto.titulo}
                imageUrl={featuredImage?.url || ''}
                price={produto.preco}
                quantity={quantitySelected}
                color={produto.marca}
              >
                <ShoppingBagIcon className="size-5" strokeWidth={2} />
                <span>Adicionar ao carrinho</span>
              </AddToCardButton>
            </div>

            {/* INFO ADICIONAL (opcional) */}
            <div className="flex items-start gap-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 px-4 py-3">
              <svg className="size-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div className="flex-1">
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  <span className="font-semibold">Entrega rápida</span> • Frete grátis acima de AOA 150
                </p>
              </div>
            </div>
          </fieldset>
        </ProductForm>
        <Divider />

        <AccordionInfo
          data={[
            {
              name: 'Descrição',
              content: produto.descricao || 'Sem descrição disponível.',
            },
            {
              name: 'Informações do Produto',
              content: `<ul class="list-disc list-inside leading-7">
                  <li>SKU: ${produto.sku}</li>
                  <li>Estoque: ${produto.quantidadeEstoque} unidades disponíveis</li>
                  <li>Condição: ${produto.condicao}</li>
                  <li>Marca: ${produto.marca || 'N/A'}</li>
                  <li>Modelo: ${produto.modelo || 'N/A'}</li>
                  <li>Código de Barras: ${produto.codigoBarras || 'N/A'}</li>
                </ul>`,
            },
            {
              name: 'Envio e Devolução',
              content: 'Oferecemos frete grátis para pedidos acima de R$ 150. Se você não estiver satisfeito com sua compra, pode devolvê-la dentro de 30 dias para reembolso total.',
            },
            {
              name: 'Instruções de Cuidado',
              content: 'Lavar à máquina com água fria e cores semelhantes. Não usar alvejante. Secar em temperatura baixa. Passar em temperatura baixa se necessário. Não lavar a seco.',
            },
          ]}
        />

        <div className="mt-6 flex text-sm text-neutral-500">
          <p className="text-xs">
            ou{' '}
            <Link href={'/products/' + handle} className="text-xs font-medium text-neutral-900 uppercase dark:text-neutral-100">
              Ir para página do produto <span aria-hidden="true"> →</span>
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="lg:flex">
        <div className="w-full lg:w-[50%]">
          <div className="relative">
            <div className="aspect-w-16 aspect-h-16">
              {produto.imagens[0]?.url && (
                <Image
                  src={produto.imagens[0].url}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="w-full rounded-xl object-cover"
                  alt={produto.titulo}
                />
              )}
            </div>
            {renderStatus()}
            <LikeButton className="absolute end-3 top-3" />
          </div>

          <div className="mt-3 hidden grid-cols-2 gap-3 sm:mt-6 sm:gap-6 lg:grid xl:mt-5 xl:gap-5">
            {[produto.imagens[1], produto.imagens[2]].map((imagem, index) => {
              if (!imagem?.url) return null
              return (
                <div key={imagem.id || index} className="aspect-w-3 aspect-h-4">
                  <Image
                    fill
                    src={imagem.url}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="w-full rounded-xl object-cover"
                    alt={produto.titulo}
                  />
                </div>
              )
            })}
          </div>
        </div>

        <div className="w-full pt-6 lg:w-[50%] lg:ps-7 lg:pt-0 xl:ps-8">
          {renderSectionContent()}
        </div>
      </div>
    </div>
  )
}

export default ProductQuickView
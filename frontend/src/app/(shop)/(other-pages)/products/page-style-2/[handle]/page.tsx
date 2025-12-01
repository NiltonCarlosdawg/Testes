// src/app/produto/[handle]/mobile-page.tsx
import { getProductById, getRelatedProducts, getProductReviews } from '@/lib/queries/products.api'
import AccordionInfo from '@/components/shop/AccordionInfo'
import { Divider } from '@/components/shop/Divider'
import LikeButton from '@/components/shop/LikeButton'
import NcInputNumber from '@/components/shop/NcInputNumber'
import Prices from '@/components/shop/Prices'
import ProductForm from '@/components/shop/ProductForm/ProductForm'
import SectionSliderProductCard from '@/components/shop/SectionSliderProductCard'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import { StarIcon } from '@heroicons/react/24/solid'
import { ShoppingBag03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { notFound } from 'next/navigation'
import GalleryImages from '../../GalleryImages'
import Policy from '../../Policy'
import ProductReviews from '../../ProductReviews'
import ProductStatus from '../../ProductStatus'

export default async function MobilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const product = await getProductById(handle).catch(() => null)
  if (!product) return notFound()

  const relatedProducts = await getRelatedProducts(product.categoriaId, product.id)
  const reviews = await getProductReviews(handle)

  const galleryImages = product.imagens.sort((a, b) => a.posicao - b.posicao).map(i => i.url)

  const renderSidebar = () => (
    <div className="listingSectionSidebar__wrap lg:shadow-lg p-5">
      <div className="flex items-center justify-between">
        <Prices price={product.preco} contentClass="text-xl" />
        <a href="#reviews" className="flex items-center text-sm">
          <StarIcon className="size-5 text-orange-400" />
          <span className="ml-1">4.8 · 12 avaliações</span>
        </a>
      </div>

      <ProductForm product={product} className="mt-6">
        <NcInputNumber defaultValue={1} max={product.quantidadeEstoque} />
        <ButtonPrimary className="mt-4 w-full" type="submit">
          <HugeiconsIcon icon={ShoppingBag03Icon} size={20} />
          <span className="ml-2">Adicionar</span>
        </ButtonPrimary>
      </ProductForm>
    </div>
  )

  return (
    <div>
      <div className="container mt-8">
        <div className="relative">
          <GalleryImages images={galleryImages} gridType="grid4" />
          <LikeButton className="absolute top-3 left-3" />
        </div>
      </div>

      <div className="container mt-9 flex flex-col gap-y-10">
        <div>
          <h1 className="text-2xl font-semibold">{product.titulo}</h1>
          <div className="mt-4 flex items-center gap-2">
            <ProductStatus status={product.quantidadeEstoque > 0 ? 'In Stock' : 'Sold Out'} />
          </div>
        </div>

        <div className="block lg:hidden">{renderSidebar()}</div>

        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700" />
        <AccordionInfo />
        <Policy />

        <Divider />
        <ProductReviews reviewNumber={12} rating={4.8} reviews={reviews} />
        <Divider />

        <SectionSliderProductCard
          data={relatedProducts}
          heading="Também compraram"
          className="text-2xl font-semibold"
        />
      </div>
    </div>
  )
}
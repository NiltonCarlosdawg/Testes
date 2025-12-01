import AccordionInfo from '@/components/shop/AccordionInfo'
import { Divider } from '@/components/shop/Divider'
import LikeButton from '@/components/shop/LikeButton'
import Prices from '@/components/shop/Prices'
import SectionPromo2 from '@/components/shop/SectionPromo2'
import SectionSliderProductCard from '@/components/shop/SectionSliderProductCard'
import { getProductById, getRelatedProducts, getProductReviews } from '@/lib/queries/products.api'
import Breadcrumb from '@/shared/Breadcrumb'
import { StarIcon } from '@heroicons/react/24/solid'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import GalleryImages from '../GalleryImages'
import Policy from '../Policy'
import ProductReviews from '../ProductReviews'
import ProductStatus from '../ProductStatus'
import AddToCartSection from './AddToCartSection'

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params
  const product = await getProductById(handle).catch(() => null)
  return {
    title: product?.titulo || 'Produto não encontrado',
    description: product?.descricao || 'Detalhes do produto',
  }
}

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const product = await getProductById(handle).catch(() => null)
  if (!product) return notFound()

  const relatedProducts = await getRelatedProducts(product.categoriaId, product.id)
  const reviews = await getProductReviews(handle)

  const galleryImages = product.imagens
    .sort((a, b) => a.posicao - b.posicao)
    .map(img => img.url)

  const renderRightSide = () => (
    <div className="w-full pt-10 lg:w-[45%] lg:pt-0 lg:pl-7 xl:pl-9 2xl:pl-10">
      <div className="sticky top-8 flex flex-col gap-y-10">
        <div>
          <Breadcrumb 
            breadcrumbs={[
              { id: 1, name: 'Home', href: '/' }, 
              { id: 2, name: product.marca, href: '/' }
            ]} 
            currentPage={product.titulo} 
          />
          <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">{product.titulo}</h1>
          <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2.5 sm:gap-x-6">
            <Prices price={product.preco} />
            <div className="hidden h-7 border-l border-neutral-300 sm:block dark:border-neutral-700" />
            <div className="flex items-center gap-x-2">
              <a href="#reviews" className="flex items-center text-sm font-medium">
                <StarIcon className="size-5 pb-px text-yellow-400" />
                <span className="ms-1.5">
                  <span>4.8</span>
                  <span className="mx-2">·</span>
                  <span className="text-neutral-600 underline dark:text-neutral-400">12 avaliações</span>
                </span>
              </a>
              <ProductStatus status={product.quantidadeEstoque > 0 ? 'In Stock' : 'Sold Out'} />
            </div>
          </div>
        </div>

        {/* COMPONENTE CLIENT COM OS BOTÕES */}
        <AddToCartSection product={product} />

        <Divider />
        <AccordionInfo />
        <div className="hidden xl:block"><Policy /></div>
      </div>
    </div>
  )

  const renderDetailSection = () => (
    <div>
      <h2 className="text-2xl font-semibold">Detalhes do Produto</h2>
      <div 
        className="prose prose-sm mt-7 sm:prose sm:max-w-4xl dark:prose-invert" 
        dangerouslySetInnerHTML={{ __html: product.descricao.replace(/\n/g, '<br>') }} 
      />
    </div>
  )

  const renderLeftSide = () => (
    <div className="w-full lg:w-[55%]">
      <div className="relative">
        <GalleryImages images={galleryImages} gridType="grid5" />
        <LikeButton className="absolute top-3 left-3" />
      </div>
    </div>
  )

  return (
    <main className="container mt-5 lg:mt-11">
      <div className="lg:flex">
        {renderLeftSide()}
        {renderRightSide()}
      </div>

      <div className="mt-12 flex flex-col gap-y-10 sm:mt-16 sm:gap-y-16">
        <div className="block xl:hidden"><Policy /></div>
        {renderDetailSection()}
        <Divider />
        <ProductReviews reviewNumber={12} rating={4.8} reviews={reviews} />
        <Divider />
        <SectionSliderProductCard
          data={relatedProducts}
          heading="Clientes também compraram"
          subHeading=""
          className="mb-12 text-neutral-900 dark:text-neutral-50 text-3xl font-semibold"
        />
        <div className="pb-20 lg:pt-16 xl:pb-28"><SectionPromo2 /></div>
      </div>
    </main>
  )
}
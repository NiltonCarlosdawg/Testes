// src/app/(shop)/page.tsx
import BackgroundSection from '@/components/shop/BackgroundSection/BackgroundSection'
import { Divider } from '@/components/shop/Divider'
import SectionGridFeatureItems from '@/components/shop/SectionGridFeatureItems'
import SectionGridMoreExplore from '@/components/shop/SectionGridMoreExplore/SectionGridMoreExplore'
import SectionHero2 from '@/components/shop/SectionHero/SectionHero2'
import SectionHowItWork from '@/components/shop/SectionHowItWork/SectionHowItWork'
import SectionPromo2 from '@/components/shop/SectionPromo2'
import SectionSliderLargeProduct from '@/components/shop/SectionSliderLargeProduct'
import SectionSliderProductCard from '@/components/shop/SectionSliderProductCard'
import { getCategories, getProducts } from '@/lib/queries/products.api'

export default async function HomePage() {
  const [categories, productsRes] = await Promise.all([
    getCategories(),
    getProducts({ limit: 40 })
  ])

  const products = productsRes?.data || []
  const newArrivals = products.slice(0, 8)
  const bestSellers = products.slice(8, 16)
  const flashSale = products.filter((p: any) => p.preco_promocional).slice(0, 8)

  return (
    <div className="nc-PageHome relative overflow-hidden">
      <SectionHero2 />

      <div className="container relative my-20 space-y-24 lg:my-28 lg:space-y-32">
        <SectionSliderProductCard data={newArrivals} heading="Novidades" subHeading="Os mais recentes" />
        <Divider />
        <SectionHowItWork />

        <div className="relative">
          <BackgroundSection />
          <SectionGridMoreExplore
            groupCollections={[
              {
                id: '1',
                title: 'Explorar categorias',
                iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"/></svg>',
                collections: (categories || []).slice(0, 9).map((cat: any) => ({
                  id: cat.id,
                  name: cat.nome,
                  href: `/produtos?categoria=${cat.slug || cat.id}`,
                  thumbnail: cat.imagem || '/placeholder.jpg',
                }))
              }
            ]}
          />
        </div>

        <SectionSliderProductCard data={bestSellers} heading="Mais Vendidos" subHeading="Os favoritos" />
        
        {flashSale.length > 0 && (
          <>
            <SectionPromo2 />
            <SectionSliderLargeProduct products={flashSale} />
          </>
        )}

        <SectionGridFeatureItems data={products.slice(0, 12)} />
      </div>
    </div>
  )
}
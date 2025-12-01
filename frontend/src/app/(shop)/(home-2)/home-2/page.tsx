import { Divider } from '@/components/shop/Divider'
import Heading from '@/components/shop/Heading/Heading'
import SectionCollectionSlider from '@/components/shop/SectionCollectionSlider'
import SectionGridFeatureItems from '@/components/shop/SectionGridFeatureItems'
import SectionHero3 from '@/components/shop/SectionHero/SectionHero3'
import SectionHowItWork from '@/components/shop/SectionHowItWork/SectionHowItWork'
import SectionPromo1 from '@/components/shop/SectionPromo1'
import SectionPromo3 from '@/components/shop/SectionPromo3'
import SectionSliderLargeProduct from '@/components/shop/SectionSliderLargeProduct'
import SectionSliderProductCard from '@/components/shop/SectionSliderProductCard'
import SectionMagazine5 from '@/components/shop/blog/SectionMagazine5'
import { getBlogPosts, getCollections } from '@/data/data'
import { getProducts } from '@/data/data2'
import ButtonSecondary from '@/shared/Button/ButtonSecondary'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home 2',
  description:
    'Ciseco is a modern and elegant template for Next.js, Tailwind CSS, and TypeScript. It is designed to be simple and easy to use, with a focus on performance and accessibility.',
  keywords: ['Next.js', 'Tailwind CSS', 'TypeScript', 'Ciseco', 'Headless UI', 'Fashion', 'E-commerce'],
}

async function PageHome2() {
  const allCollections = await getCollections()
  const featuredCollections = allCollections.slice(7, 11)
  const products = await getProducts()
  const carouselProducts2 = products.slice(3, 10)
  const carouselProducts3 = products.slice(2, 6)
  const blogPosts = await getBlogPosts()

  return (
    <div className="nc-PageHome2 relative">
      <div className="container">
        <SectionHero3 />
      </div>

      <div className="relative container my-24 flex flex-col gap-y-24 lg:my-36 lg:gap-y-36">
        <SectionHowItWork />
        <SectionSliderProductCard data={carouselProducts2} subHeading="New Sports equipment" />
        <SectionPromo3 />
        <SectionSliderLargeProduct products={carouselProducts3} />
      </div>

      <SectionCollectionSlider collections={featuredCollections} />

      <div className="relative container my-24 flex flex-col gap-y-24 lg:my-36 lg:gap-y-36">
        <SectionGridFeatureItems data={products} />
        <Divider />
        <div>
          <Heading headingDim="From the Ciseco blog">The latest news</Heading>
          <SectionMagazine5 posts={blogPosts} />
          <div className="mt-20 flex justify-center">
            <ButtonSecondary href="/blog">Show all blog articles</ButtonSecondary>
          </div>
        </div>
        <Divider />
        <SectionPromo1 />
      </div>
    </div>
  )
}

export default PageHome2

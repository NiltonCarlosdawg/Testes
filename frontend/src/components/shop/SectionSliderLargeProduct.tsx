'use client'

import Heading from '@/components/shop/Heading/Heading'
import { useCarouselArrowButtons } from '@/hooks/use-carousel-arrow-buttons'
import useEmblaCarousel from 'embla-carousel-react'
import Link from 'next/link'
import { FC } from 'react'
import ProductCardLarge from './ProductCardLarge'
import { ArrowUpRight } from 'lucide-react'
import { Product } from '@/types/product'

export interface SectionSliderLargeProductProps {
  className?: string
  products: Product[]
}

const SectionSliderLargeProduct: FC<SectionSliderLargeProductProps> = ({
  className = '',
  products,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ slidesToScroll: 'auto' })
  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = useCarouselArrowButtons(emblaApi)

  return (
    <div className={`nc-SectionSliderLargeProduct ${className}`}>
      <Heading
        isCenter={false}
        hasNextPrev
        headingDim="Destaques da semana"
        prevBtnDisabled={prevBtnDisabled}
        nextBtnDisabled={nextBtnDisabled}
        onClickPrev={onPrevButtonClick}
        onClickNext={onNextButtonClick}
      >
        Escolhidos por especialistas
      </Heading>

      <div className="embla" ref={emblaRef}>
        <div className="-ms-5 embla__container sm:-ms-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="embla__slide basis-full ps-5 sm:basis-2/3 sm:ps-8 lg:basis-1/2 xl:basis-2/5 2xl:basis-1/3"
            >
              <ProductCardLarge product={product} />
            </div>
          ))}

          <Link
            href="/collections/all"
            className="group relative block embla__slide basis-full ps-5 sm:basis-2/3 sm:ps-8 lg:basis-1/2 xl:basis-2/5 2xl:basis-1/3"
          >
            <div className="relative h-[410px] overflow-hidden rounded-2xl">
              <div className="h-[410px] bg-black/5 dark:bg-neutral-800"></div>
              <div className="absolute inset-x-10 inset-y-6 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <span className="text-xl font-semibold">Mais itens</span>
                  <ArrowUpRight
                    size={24}
                    className="absolute left-full ms-2 group-hover:scale-110 transition-transform"
                    strokeWidth={1.5}
                  />
                </div>
                <span className="mt-1 text-sm">Mostrar mais</span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SectionSliderLargeProduct
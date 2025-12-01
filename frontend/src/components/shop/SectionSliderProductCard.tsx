'use client'

import Heading from '@/components/shop/Heading/Heading'
import { useCarouselArrowButtons } from '@/hooks/use-carousel-arrow-buttons'
import type { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import { FC } from 'react'
import ProductCard from './ProductCard'
import { Product } from '@/types/product'

export interface SectionSliderProductCardProps {
  className?: string
  heading?: string
  subHeading?: string
  data: Product[]
  emblaOptions?: EmblaOptionsType
}

const SectionSliderProductCard: FC<SectionSliderProductCardProps> = ({
  className = '',
  heading = 'Novidades',
  subHeading = 'Os mais recentes na loja',
  data,
  emblaOptions = { slidesToScroll: 'auto' },
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions)
  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = useCarouselArrowButtons(emblaApi)

  return (
    <div className={`nc-SectionSliderProductCard ${className}`}>
      <Heading
        headingDim={subHeading}
        hasNextPrev
        prevBtnDisabled={prevBtnDisabled}
        nextBtnDisabled={nextBtnDisabled}
        onClickPrev={onPrevButtonClick}
        onClickNext={onNextButtonClick}
      >
        {heading}
      </Heading>

      <div className="embla" ref={emblaRef}>
        <div className="-ms-5 embla__container sm:-ms-8">
          {data.map((product) => (
            <div
              key={product.id}
              className="embla__slide basis-[86%] ps-5 sm:ps-8 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <ProductCard data={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SectionSliderProductCard
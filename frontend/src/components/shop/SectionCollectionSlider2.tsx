'use client'

import Heading from '@/components/shop/Heading/Heading'
import { useCarouselArrowButtons } from '@/hooks/use-carousel-arrow-buttons'
import clsx from 'clsx'
import type { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import Link from 'next/link'
import { FC } from 'react'
import CollectionCard2 from './CollectionCard2'
import { ArrowUpRight } from 'lucide-react'

interface Category {
  id: string;
  nome: string;
  imagem?: string;
}

export interface SectionCollectionSlider2Props {
  className?: string
  collections: Category[]
  heading?: string
  headingDim?: string
  emblaOptions?: EmblaOptionsType
}

const SectionCollectionSlider2: FC<SectionCollectionSlider2Props> = ({
  heading = 'Compre por departamento',
  headingDim = 'Explore as categorias',
  className,
  collections,
  emblaOptions = { slidesToScroll: 'auto' },
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions)
  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = useCarouselArrowButtons(emblaApi)

  return (
    <div className={clsx(className)}>
      <Heading
        hasNextPrev
        headingDim={headingDim}
        prevBtnDisabled={prevBtnDisabled}
        nextBtnDisabled={nextBtnDisabled}
        onClickPrev={onPrevButtonClick}
        onClickNext={onNextButtonClick}
      >
        {heading}
      </Heading>

      <div className="embla" ref={emblaRef}>
        <div className="-ms-5 embla__container sm:-ms-8">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="embla__slide basis-[86%] ps-5 sm:ps-8 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <CollectionCard2 collection={collection} />
            </div>
          ))}

          <div className="embla__slide basis-[86%] ps-5 sm:ps-8 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
            <div className="group aspect-w-1 relative h-0 w-full flex-1 overflow-hidden rounded-2xl bg-neutral-100 aspect-h-1">
              <div className="absolute inset-x-10 inset-y-6 flex flex-col justify-center sm:items-center">
                <div className="relative flex text-neutral-900">
                  <span className="text-lg font-semibold">Mais coleções</span>
                  <ArrowUpRight
                    size={24}
                    className="absolute left-full ms-2 group-hover:scale-110 transition-transform"
                    strokeWidth={1.5}
                  />
                </div>
                <span className="mt-1 text-sm text-neutral-800">Mostrar mais</span>
              </div>
              <Link
                href="/collections/all"
                className="absolute inset-0 bg-black/10 opacity-0 transition-opacity group-hover:opacity-100"
              ></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SectionCollectionSlider2
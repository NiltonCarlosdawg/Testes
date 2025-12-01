'use client';

import NcImage from '@/shared/NcImage/NcImage';
import { Link } from '@/shared/link';
import { StarIcon } from '@heroicons/react/24/solid';
import { FC } from 'react';
import Prices from './Prices';
import { Product } from '@/types/product';

export interface Props {
  className?: string;
  product: Product;
}

const ProductCardLarge: FC<Props> = ({ className, product }) => {
  const { titulo, preco, imagens, marca } = product;
  const handle = titulo
  const rating = 4.5;
  const reviewNumber = 0;
  const selectedOptions = marca ? [{ name: 'Color', value: marca }] : [];
  const color = selectedOptions.find((option) => option.name === 'Color')?.value;

  return (
    <div className={`CollectionCard2 group relative ${className}`}>
      <div className="relative flex flex-col">
        {imagens?.[0]?.url && (
          <NcImage
            containerClassName="aspect-8/5 bg-neutral-100 rounded-2xl overflow-hidden relative"
            className="rounded-2xl object-contain"
            fill
            src={imagens[0].url}
            alt={titulo || 'Product image'}
            sizes="400px"
          />
        )}
        <div className="mt-2.5 grid grid-cols-3 gap-x-2.5">
          {imagens?.[1]?.url && (
            <NcImage
              containerClassName="w-full h-24 sm:h-28 relative"
              className="rounded-2xl object-cover"
              src={imagens[1].url}
              alt={titulo || 'Product image'}
              fill
              sizes="150px"
            />
          )}
          {imagens?.[2]?.url && (
            <NcImage
              containerClassName="w-full h-24 sm:h-28 relative"
              className="rounded-2xl object-cover"
              src={imagens[2].url}
              alt={titulo || 'Product image'}
              fill
              sizes="150px"
            />
          )}
          {imagens?.[3]?.url && (
            <NcImage
              containerClassName="w-full h-24 sm:h-28 relative"
              className="h-full w-full rounded-2xl object-cover"
              src={imagens[3].url}
              alt={titulo || 'Product image'}
              fill
              sizes="150px"
            />
          )}
        </div>
      </div>

      <div className="relative mt-5 flex justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold sm:text-xl">{titulo}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-1 text-neutral-500 dark:text-neutral-400">
            {color && (
              <span className="text-sm">
                <span className="line-clamp-1">{color}</span>
              </span>
            )}
            {color && (
              <span className="h-5 border-l border-neutral-200 sm:mx-2 dark:border-neutral-700"></span>
            )}
            <StarIcon className="h-4 w-4 text-orange-400" />
            <span className="text-sm">
              <span className="line-clamp-1">
                {rating} ({reviewNumber} reviews)
              </span>
            </span>
          </div>
        </div>
        <Prices className="mt-0.5" price={preco || 1} />
      </div>
      <Link href={`/products/${handle}`} className="absolute inset-0"></Link>
    </div>
  );
};

export default ProductCardLarge;
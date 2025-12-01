'use client';

import NcImage from '@/shared/NcImage/NcImage';
import { Link } from '@/shared/link';
import { ArrowsPointingOutIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { FC } from 'react';
import AddToCardButton from './AddToCardButton';
import LikeButton from './LikeButton';
import Prices from './Prices';
import ProductStatus from './ProductStatus';
import { useAside } from './aside';
import { Product } from '@/types/product';

interface Props {
  className?: string;
  data: Product;
  isLiked?: boolean;
}

const ProductCard: FC<Props> = ({ className = '', data, isLiked }) => {
  const { id, titulo, preco, precoOriginal, marca, imagens, quantidadeEstoque, createdAt } = data;
  const handle = data.id
  const { open: openAside, setProductQuickViewHandle } = useAside();

  const getStatus = (): string | undefined => {
    if (quantidadeEstoque === 0) {
      return 'Sold Out';
    }
    if (precoOriginal && preco < precoOriginal) {
      const discount = Math.round(((precoOriginal - preco) / precoOriginal) * 100);
      return `${discount}% Discount`;
    }
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 30) {
      return 'New in';
    }
    if (quantidadeEstoque < 10) {
      return 'limited edition';
    }
    return undefined;
  };

  const status = getStatus();
  const featuredImage = imagens && imagens.length > 0 ? imagens[0] : null;
  const precoEmReais = preco;

  const renderGroupButtons = () => {
    return (
      <div className="invisible absolute inset-x-1 bottom-0 flex justify-center gap-1.5 opacity-0 transition-all group-hover:visible group-hover:bottom-4 group-hover:opacity-100">
        <AddToCardButton
          produtoId={id}
          as={'button'}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-xs/normal text-white shadow-lg hover:bg-neutral-800"
          title={titulo}
          imageUrl={featuredImage?.url || ''}
          price={precoEmReais}
          quantity={1}
          color={marca}
        >

          <ShoppingBagIcon className="-ml-1 size-3.5" />
          <span>Add</span>
        </AddToCardButton>

        <button
          className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-xs/normal text-neutral-950 shadow-lg hover:bg-neutral-50"
          type="button"
          onClick={() => {
            setProductQuickViewHandle(id);
            openAside('product-quick-view');
          }}
        >
          <ArrowsPointingOutIcon className="-ml-1 size-3.5" />
          <span>Quick view</span>
        </button>
      </div>
    );
  };

  return (
    <div className={`product-card relative flex flex-col bg-transparent ${className}`}>
      <Link href={'/products/' + handle} className="absolute inset-0"></Link>

      <div className="group relative z-1 shrink-0 overflow-hidden rounded-3xl bg-neutral-50 dark:bg-neutral-300">
        <Link href={'/products/' + handle} className="block">
          {featuredImage?.url ? (
            <NcImage
              containerClassName="flex aspect-w-11 aspect-h-12 w-full h-0"
              src={featuredImage.url}
              className="h-full w-full object-cover"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 40vw"
              alt={titulo}
            />
          ) : (
            <div className="flex aspect-w-11 aspect-h-12 w-full h-0 items-center justify-center bg-neutral-200 dark:bg-neutral-400">
              <span className="text-neutral-400 dark:text-neutral-600">Sem imagem</span>
            </div>
          )}
        </Link>
        <ProductStatus status={status} />
        <LikeButton liked={isLiked} className="absolute end-3 top-3 z-10" />
        {renderGroupButtons()}
      </div>

      <div className="space-y-4 px-2.5 pt-5 pb-2.5">
        <div>
          <h2 className="nc-ProductCard__title text-base font-semibold transition-colors">{titulo}</h2>
          {marca && <p className={`mt-1 text-sm text-neutral-500 dark:text-neutral-400`}>{marca}</p>}
        </div>

        <div className="flex items-end justify-between">
          <Prices price={precoEmReais} />
          <div className="mb-0.5 flex items-center">
            <StarIcon className="h-5 w-5 pb-px text-amber-400" />
            <span className="ms-1 text-sm text-neutral-500 dark:text-neutral-400">
              4.5 (0 reviews)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
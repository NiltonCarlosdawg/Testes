'use client';

import { useGetProducts } from '@/lib/queries/product';
import { columns } from './product-tables/columns';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { Product } from '@/types/product';
import { ProductTable } from './product-tables';

export default function ProductListingPage() {
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [pageLimit] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [search] = useQueryState('name', parseAsString.withDefault(''));
  const [category] = useQueryState('category', parseAsString.withDefault(''));

  const { data, isLoading, error } = useGetProducts({page, limit: pageLimit, search, categories: [category]});

  if (isLoading) {
    return <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />;
  }

  if (error) {
    return <div>Erro ao carregar produtos: {error.message}</div>;
  }

  const products: Product[] = data?.data || [];
  const totalItems = data?.pagination.total || 0;

  return (
    <ProductTable
      data={products}
      totalItems={totalItems}
      columns={columns}
    />
  );
}
'use client';
import { useGetLojas } from '@/lib/queries/useLoja';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { Loja } from '@/lib/queries/loja.api';
import { StoreTable } from './store-tables';

export default function StoreListingPage() {
  const [page] = useQueryState('page', parseAsInteger.withDefault(1));
  const [pageLimit] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [search] = useQueryState('search', parseAsString.withDefault(''));

  const { data, isLoading, error } = useGetLojas(page, pageLimit, search);

  if (isLoading) {
    return <DataTableSkeleton columnCount={6} rowCount={8} filterCount={1} />;
  }

  if (error) {
    return <div>Erro ao carregar lojas: {error.message}</div>;
  }

  const lojas: Loja[] = data?.data || [];
  const totalItems = data?.pagination?.total || 0;

  return (
    <StoreTable
      data={lojas}
      totalItems={totalItems}
    />
  );
}
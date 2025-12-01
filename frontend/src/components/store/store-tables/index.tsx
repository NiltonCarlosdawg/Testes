'use client';
import { useState } from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { parseAsInteger, useQueryState } from 'nuqs';
import { Loja } from '@/lib/queries/loja.api';
import { createColumns } from './columns';
import { StoreDetailsDialog } from '../components/StoreDetailsDialog';

interface StoreTableParams {
  data: Loja[];
  totalItems: number;
}

export function StoreTable({ data, totalItems }: StoreTableParams) {
  const [selectedStore, setSelectedStore] = useState<Loja | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const pageCount = Math.ceil(totalItems / pageSize);

  const handleViewStore = (store: Loja) => {
    setSelectedStore(store);
    setDialogOpen(true);
  };

  const columns = createColumns({ onViewStore: handleViewStore });

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    shallow: false,
    debounceMs: 500,
  });

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table} accessKey='nome' />
      </DataTable>

      <StoreDetailsDialog 
        store={selectedStore}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
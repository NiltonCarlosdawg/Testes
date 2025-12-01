import { ColumnDef } from '@tanstack/react-table';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

export const columns: ColumnDef<Product, unknown>[] = [
  {
    accessorKey: 'titulo',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Título
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('titulo') as string}</div>,
  },
  {
    accessorKey: 'preco',
    header: 'Preço',
    cell: ({ row }) => {
      const preco = row.getValue('preco') as number;
      return <div>AOA {preco.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: 'quantidadeEstoque',
    header: 'Estoque',
    cell: ({ row }) => <div>{row.getValue('quantidadeEstoque') as number}</div>,
  },
  {
    accessorKey: 'condicao',
    header: 'Condição',
    cell: ({ row }) => <div>{row.getValue('condicao') as string}</div>,
  },
  {
    id: 'actions',
    header: 'Ações',
    cell: ({ row }) => (
      <Link href={`/dashboard/product/${row.original.id}`}>
        <Button variant="outline">Editar</Button>
      </Link>
    ),
  },
];
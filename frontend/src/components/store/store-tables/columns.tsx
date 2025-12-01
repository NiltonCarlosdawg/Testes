'use client';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Loja, StatusLoja } from '@/lib/queries/loja.api';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';
import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';

const statusColors = {
  [StatusLoja.PENDENTE]: 'bg-yellow-500',
  [StatusLoja.ATIVA]: 'bg-green-500',
  [StatusLoja.INATIVA]: 'bg-red-500',
};

interface ColumnsProps {
  onViewStore: (store: Loja) => void;
}

export const createColumns = ({ onViewStore }: ColumnsProps): ColumnDef<Loja>[] => [
  {
    accessorKey: 'nome',
    header: 'Nome da Loja',
    cell: ({ row }) => (
      <div 
        className="text-blue-600 hover:underline cursor-pointer"
        onClick={() => onViewStore(row.original)}
      >
        {row.getValue('nome')}
      </div>
    ),
  },
  {
    accessorKey: 'emailComercial',
    header: 'Email',
    cell: ({ row }) => row.getValue('emailComercial') || '-',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as StatusLoja;
      return (
        <Badge className={`${statusColors[status]} text-white`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const loja = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onViewStore(loja)}>
              <IconEye className="h-4 w-4 mr-2" /> Ver
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/store/${loja.id}/edit`} className="flex items-center gap-2">
                <IconEdit className="h-4 w-4" /> Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <IconTrash className="h-4 w-4 mr-2" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
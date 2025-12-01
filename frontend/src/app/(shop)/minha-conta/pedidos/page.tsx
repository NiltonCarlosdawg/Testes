'use client';

import Link from 'next/link';
import { Package, Truck, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função para formatar Kwanza (AOA)
const formatKwanza = (value: number) => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
  }).format(value);
};

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'canceled';

const orders = [
  {
    id: '2025-0891',
    date: new Date('2025-11-15'),
    total: 485000,
    status: 'shipped' as OrderStatus,
    items: 3,
  },
  {
    id: '2025-0878',
    date: new Date('2025-11-10'),
    total: 172500,
    status: 'delivered' as OrderStatus,
    items: 1,
  },
  {
    id: '2025-0865',
    date: new Date('2025-11-05'),
    total: 338000,
    status: 'paid' as OrderStatus,
    items: 2,
  },
];

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  paid: { label: 'Pago', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: 'Entregue', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  canceled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function OrdersPage() {
  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
        <h2 className="text-2xl font-semibold mb-2">Ainda não tens pedidos</h2>
        <p className="text-gray-500">Os teus pedidos vão aparecer aqui quando comprares algo</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Package className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Os Meus Pedidos</h1>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const StatusIcon = statusConfig[order.status].icon;

          return (
            <Card key={order.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-semibold text-lg">Pedido #{order.id}</h3>
                    <Badge className={statusConfig[order.status].color}>
                      <StatusIcon className="w-4 h-4 mr-1" />
                      {statusConfig[order.status].label}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Realizado em {format(order.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                    <p>{order.items} {order.items === 1 ? 'item' : 'itens'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold">{formatKwanza(order.total)}</p>
                  </div>

                  <Button asChild size="lg">
                    <Link href={`/minha-conta/pedidos/${order.id}`}>
                      Ver detalhes
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
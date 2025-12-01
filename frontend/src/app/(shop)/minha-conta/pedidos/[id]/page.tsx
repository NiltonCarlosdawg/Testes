'use client';

import { Package, Truck, CheckCircle, CreditCard, MapPin, Smartphone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatKwanza = (value: number) => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
  }).format(value);
};

const order = {
  id: '2025-0891',
  date: new Date('2025-11-15'),
  status: 'shipped' as const,
  trackingCode: 'AO251115789XZ',
  paymentMethod: 'Multicaixa •••• 9876',
  shippingAddress: 'Rua Amílcar Cabral, nº 45\nBairro Morro Bento\nTalatona, Luanda\nAngola',
  total: 485000,
  items: [
    { name: 'Samsung Galaxy S24 Ultra 512GB', price: 420000, qty: 1 },
    { name: 'Capa de Silicone Preta', price: 25000, qty: 1 },
    { name: 'Película de Vidro Temperado', price: 40000, qty: 1 },
  ],
};

const steps = [
  { label: 'Pagamento confirmado', date: '15/11/2025 14:32', completed: true },
  { label: 'Pedido em separação', date: '16/11/2025 09:15', completed: true },
  { label: 'Saiu para entrega', date: '17/11/2025 11:20', completed: true },
  { label: 'Entregue', date: null, completed: false },
];

const getStepIcon = (index: number) => {
  const icons = [CheckCircle, Package, Truck, CheckCircle];
  return icons[index];
};

export default function OrderDetailPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 lg:pb-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Pedido #{order.id}</h1>
            <p className="text-sm text-muted-foreground">
              Realizado em {format(order.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Truck className="w-4 h-4 mr-1" />
            Em trânsito
          </Badge>
        </div>
      </div>

      {/* Timeline */}
      <Card className="p-6 lg:p-8">
        <h2 className="text-xl font-semibold mb-6">Estado da entrega</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = getStepIcon(index);
            const isActive = step.completed;
            const isCurrent = index === 2;

            return (
              <div key={index} className="flex flex-col items-center text-center">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all ${
                    isActive
                      ? 'bg-primary text-white ring-4 ring-primary/20'
                      : isCurrent
                      ? 'bg-primary/20 text-primary ring-4 ring-primary/30'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                  }`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <p className={`text-sm font-medium ${isActive || isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </p>
                {step.date && (
                  <p className="text-xs text-muted-foreground mt-1">{step.date}</p>
                )}
              </div>
            );
          })}
        </div>

        {order.trackingCode && (
          <div className="mt-8 p-5 bg-primary/5 rounded-xl border border-primary/20 text-center">
            <p className="text-sm">
              <strong>Código de rastreio:</strong>{' '}
              <span className="font-mono text-primary font-semibold">{order.trackingCode}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Pode acompanhar no site dos Correios de Angola ou EMT
            </p>
          </div>
        )}
      </Card>

      {/* Conteúdo principal */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Produtos */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-5">Itens do pedido</h2>
            <div className="space-y-5">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 pb-5 border-b last:border-0 last:pb-0">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-20 h-20 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{item.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Quantidade: {item.qty}
                    </p>
                    <p className="text-lg font-bold text-primary mt-2">
                      {formatKwanza(item.price * item.qty)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between text-xl font-bold">
                <span>Total pago</span>
                <span className="text-primary">{formatKwanza(order.total)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Resumo lateral */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              {order.paymentMethod.includes('Multicaixa') ? (
                <Smartphone className="w-5 h-5 text-purple-600" />
              ) : (
                <CreditCard className="w-5 h-5" />
              )}
              Método de pagamento
            </h3>
            <p className="text-sm text-foreground font-medium">{order.paymentMethod}</p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5" />
              Endereço de entrega
            </h3>
            <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
              {order.shippingAddress}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
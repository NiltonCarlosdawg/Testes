import { Package } from 'lucide-react';

export default function OrdersPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Package className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Meus Pedidos</h1>
      </div>

      <div className="text-center py-16 text-gray-500">
        <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
        <p>Você ainda não tem nenhum pedido</p>
      </div>
    </div>
  );
}

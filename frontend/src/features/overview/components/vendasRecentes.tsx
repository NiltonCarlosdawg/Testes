import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import setCurrencyFormat from '@/hooks/setCurrency'
import { TPedido } from '@/lib/queries/orders.api'

interface VendasRecentesProps {
  pedidos: TPedido[]
}

export function VendasRecentes({ pedidos }: VendasRecentesProps) {
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Vendas Recentes</CardTitle>
        <CardDescription>
          {pedidos.length} vendas recentes para processar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {pedidos.map((pedido) => (
            <div key={pedido.id} className='flex items-center'>
              <Avatar className='h-9 w-9'>
                <AvatarFallback>
                  {pedido.compradorId.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className='ml-4 space-y-1'>
                <p className='text-sm leading-none font-medium'>
                  Pedido #{pedido.numeroPedido}
                </p>
                <p className='text-muted-foreground text-sm'>
                  ID Comprador: {pedido.compradorId.substring(0, 8)}...
                </p>
              </div>
              <div className='ml-auto font-medium'>
                {setCurrencyFormat(pedido.total)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
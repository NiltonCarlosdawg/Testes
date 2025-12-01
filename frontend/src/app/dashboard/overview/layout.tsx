import PageContainer from '@/components/layout/page-container'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from '@/components/ui/card'
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react'
import React from 'react'
import { getDashboard } from '@/lib/queries/orders.api' 
import setCurrencyFormat from '@/hooks/setCurrency'


export default async function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats,
}: {
  sales: React.ReactNode
  pie_stats: React.ReactNode
  bar_stats: React.ReactNode
  area_stats: React.ReactNode
}) {
  const { data: dashboardData } = await getDashboard('019a0c76-c744-781b-9aa4-33cb80ff40ec')
  // ---

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Olá, Bem-vindo de volta 👋
          </h2>
        </div>

        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          {/* Card 1: Faturamento Total */}
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Faturamento Total</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {setCurrencyFormat(dashboardData.faturamentoTotal)}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  +12.5% {/* Dado estático, precisa de cálculo de % */}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Tendência de alta este mês{' '}
                <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                Total faturado (pedidos pagos)
              </div>
            </CardFooter>
          </Card>

          {/* Card 2: Total de Pedidos */}
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Total de Pedidos</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {dashboardData.totalPedidos}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  +5% {/* Dado estático */}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                +10 pedidos esta semana {/* Dado estático */}
              </div>
              <div className='text-muted-foreground'>
                Todos os pedidos (exceto cancelados)
              </div>
            </CardFooter>
          </Card>

          {/* Card 3: Pedidos Pagos */}
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Pedidos Pagos</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {dashboardData.pedidosPagos}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  +12.5%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Ótima taxa de conversão{' '}
                <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                Pedidos com pagamento confirmado
              </div>
            </CardFooter>
          </Card>

          {/* Card 4: Pedidos Pendentes */}
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Pendentes de Envio</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {dashboardData.pedidosPendentes}{' '}
                {/* Nota: API envia 'pedidosPendentes' (status=pendente), não 'pendentes de envio' */}
              </CardTitle>
              <CardAction>
                <Badge variant='outline' className='text-destructive'>
                  <IconTrendingDown />
                  Atenção
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Aguardando preparação e envio
              </div>
              <div className='text-muted-foreground'>
                Pedidos pagos/confirmados
              </div>
            </CardFooter>
          </Card>
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>{bar_stats}</div>
          <div className='col-span-4 md:col-span-3'>
            {/* sales arallel routes */}
            {sales}
          </div>
          <div className='col-span-4'>{area_stats}</div>
          <div className='col-span-4 md:col-span-3'>{pie_stats}</div>
        </div>
      </div>
    </PageContainer>
  )
}
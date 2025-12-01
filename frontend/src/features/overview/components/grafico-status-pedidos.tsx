"use client"

import * as React from 'react'
import { IconTrendingUp } from '@tabler/icons-react'
import { Label, Pie, PieChart } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { TDashboardStats } from '@/types/pedidos.types'

const chartConfig = {
  total: {
    label: 'Total',
  },
  pendentes: {
    label: 'Pendentes',
    color: 'hsl(var(--chart-1))', // Cor 1
  },
  pagos: {
    label: 'Pagos',
    color: 'hsl(var(--chart-2))', // Cor 2
  },
  enviados: {
    label: 'Enviados',
    color: 'hsl(var(--chart-3))', // Cor 3
  },
} satisfies ChartConfig

interface GraficoStatusProps {
  data: TDashboardStats
}

export function GraficoStatusPedidos({ data }: GraficoStatusProps) {
  const chartData = [
    {
      status: 'pendentes',
      total: data.pedidosPendentes,
      fill: 'var(--color-pendentes)',
    },
    {
      status: 'pagos',
      total: data.pedidosPagos,
      fill: 'var(--color-pagos)',
    },
    {
      status: 'enviados',
      total: data.pedidosEnviados,
      fill: 'var(--color-enviados)',
    },
  ]

  const totalPedidos = data.totalPedidos

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Distribuição de Status</CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            Distribuição de status dos pedidos na loja.
          </span>
          <span className='@[540px]/card:hidden'>Status dos pedidos</span>
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square h-[250px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey='total'
              nameKey='status'
              innerRadius={60}
              strokeWidth={2}
              stroke='var(--background)'
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalPedidos.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground text-sm'
                        >
                          Total Pedidos
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        <div className='flex items-center gap-2 leading-none font-medium'>
          {chartConfig.pagos.label} lidera com{' '}
          {((data.pedidosPagos / totalPedidos) * 100).toFixed(1)}%{' '}
          <IconTrendingUp className='h-4 w-4' />
        </div>
        <div className='text-muted-foreground leading-none'>
          Baseado em todos os pedidos não cancelados
        </div>
      </CardFooter>
    </Card>
  )
}
"use client"

import { IconTrendingUp } from '@tabler/icons-react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

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
import { TMonthlyRevenue } from '@/types/pedidos.types'
import setCurrencyFormat from '@/hooks/setCurrency'


const chartConfig = {
  faturamento: {
    label: 'Faturamento',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

interface GraficoFaturamentoProps {
  data: TMonthlyRevenue[]
}

export function GraficoFaturamento({ data }: GraficoFaturamentoProps) {
  // Formata os dados para o gráfico (converte mês para um formato legível)
  const chartData = data.map((item) => ({
    mes: new Date(item.mes).toLocaleString('pt-BR', {
      month: 'short',
      year: 'numeric',
    }),
    faturamento: item.faturamento,
  }))

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardTitle>Gráfico de Faturamento</CardTitle>
        <CardDescription>
          Faturamento total (pedidos pagos) nos últimos meses.
        </CardDescription>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <AreaChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <defs>
              <linearGradient id='fillFaturamento' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-faturamento)'
                  stopOpacity={1.0}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-faturamento)'
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='mes'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <YAxis
              tickFormatter={(value) => setCurrencyFormat(Number(value))}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator='dot'
                  formatter={(value) => setCurrencyFormat(Number(value))}
                />
              }
            />
            <Area
              dataKey='faturamento'
              type='natural'
              fill='url(#fillFaturamento)'
              stroke='var(--color-faturamento)'
              stackId='a'
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className='flex w-full items-start gap-2 text-sm'>
          <div className='grid gap-2'>
            <div className='flex items-center gap-2 leading-none font-medium'>
              Tendência de alta de 5.2% este mês{' '}
              {/* Dado estático, precisa de cálculo */}
              <IconTrendingUp className='h-4 w-4' />
            </div>
            <div className='text-muted-foreground flex items-center gap-2 leading-none'>
              Dados dos últimos 6 meses
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
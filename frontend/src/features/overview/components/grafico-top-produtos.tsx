"use client"

import * as React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { TTopProduto } from '@/types/pedidos.types'

const chartConfig = {
  total_vendido: {
    label: 'Total Vendido',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

interface GraficoTopProdutosProps {
  data: TTopProduto[]
}

export function GraficoTopProdutos({ data }: GraficoTopProdutosProps) {
  const chartData = data.map((item) => ({
    ...item,
    titulo: item.titulo.length > 20 ? item.titulo.substring(0, 20) + '...' : item.titulo,
  }))

  return (
    <Card className='@container/card !pt-3'>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b !p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 !py-0'>
          <CardTitle>Gráfico de Top Produtos</CardTitle>
          <CardDescription>
            <span className='hidden @[540px]/card:block'>
              Produtos mais vendidos na loja (por quantidade)
            </span>
            <span className='@[540px]/card:hidden'>Mais vendidos</span>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <BarChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <defs>
              <linearGradient id='fillBar' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='0%'
                  stopColor='var(--primary)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='100%'
                  stopColor='var(--primary)'
                  stopOpacity={0.2}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='titulo'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <YAxis
              dataKey='total_vendido'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
              content={
                <ChartTooltipContent
                  className='w-[150px]'
                  nameKey='total_vendido'
                  labelKey='titulo' 
                />
              }
            />
            <Bar
              dataKey='total_vendido'
              fill='url(#fillBar)'
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
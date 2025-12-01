import { GraficoFaturamento } from '@/features/overview/components/grafico-faturamento'
import { getFaturamentoMes } from '@/lib/queries/orders.api'

export default async function AreaStats() {
  const { data: faturamento } = await getFaturamentoMes('019a0c76-c744-781b-9aa4-33cb80ff40ec')

  return <GraficoFaturamento data={faturamento} />
}
import { GraficoStatusPedidos } from '@/features/overview/components/grafico-status-pedidos'
import { getDashboard } from '@/lib/queries/orders.api'

export default async function Stats() {
  const { data: dashboardData } = await getDashboard('019a0c76-c744-781b-9aa4-33cb80ff40ec')

  return <GraficoStatusPedidos data={dashboardData} />
}
import { VendasRecentes } from "@/features/overview/components/vendasRecentes"
import { getPedidosPendentesEnvio } from '@/lib/queries/orders.api'

export default async function Sales() {
  const { data: pedidos } = await getPedidosPendentesEnvio('019a0c76-c744-781b-9aa4-33cb80ff40ec', 1, 5)

  return <VendasRecentes pedidos={pedidos} />
}
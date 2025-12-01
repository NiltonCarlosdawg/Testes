import { GraficoTopProdutos } from "@/features/overview/components/grafico-top-produtos"
import { getTopProdutos } from "@/lib/queries/orders.api"

export default async function BarStats() {
  const { data: topProdutos } = await getTopProdutos('019a0c76-c744-781b-9aa4-33cb80ff40ec')

  return <GraficoTopProdutos data={topProdutos} />
}
import StoreProfile from "@/components/store/StoreProfile";
import { notFound } from "next/navigation";
import { getLojaById } from "@/lib/queries/loja.api";
import { getProductByLoja } from "@/lib/queries/products.api";
import ProductCard from "@/components/shop/ProductCard";


export default async function LojaPage() {
  const id = "019a0c76-c744-781b-9aa4-33cb80ff40ec"

  try {
    // Busca loja e produtos em paralelo
    const [loja, produtos] = await Promise.all([
      getLojaById(id),
      getProductByLoja(id),
    ]);

    if (!loja) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-7xl mx-auto px-4">
          <StoreProfile loja={loja} totalItems={produtos.length} />
          <div className="grid flex-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
            {produtos.map((item) => (
              <ProductCard data={item} key={item.id} />
            ))}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Erro ao carregar loja
          </h2>
          <p className="text-gray-600">
            Tente novamente mais tarde ou volte à página inicial.
          </p>
        </div>
      </div>
    );
  }
}
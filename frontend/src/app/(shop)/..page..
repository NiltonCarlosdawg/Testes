// src/app/page.tsx
import Header from '@/components/shop/Header/Header';
import ProductGrid from '@/components/store/ProductsGrid';

export const metadata = {
  title: 'Kitroca - A app tudo-em-um para segunda mão',
  description: 'Compra e vende artigos em segunda mão de forma simples e segura.',
};

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <section className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">Destaques do dia</h2>
          <ProductGrid category="destaques" limit={20} />
        </section>

        <section className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">Novidades</h2>
          <ProductGrid category="novos" limit={20} />
        </section>
      </main>
    </>
  );
}
// src/app/vender/page.tsx
import Header from '@/components/shop/Header/Header';
import { Button } from '@/components/ui/button';
import { Camera, Upload } from 'lucide-react'; // ← ESSA LINHA ESTAVA FALTANDO

export const metadata = { 
  title: 'Vender um artigo - Kitroca' 
};

export default function SellPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Vender um artigo</h1>
        
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center border-2 border-dashed border-gray-200">
          <div className="w-32 h-32 bg-gray-100 border-4 border-dashed border-gray-300 rounded-2xl mx-auto mb-8 flex items-center justify-center">
            <Camera className="h-16 w-16 text-gray-400" />
          </div>
          
          <p className="text-lg text-gray-600 mb-8">
            Arraste fotos aqui ou clique para fazer upload
          </p>
          
          <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white">
            <Upload className="mr-2 h-5 w-5" />
            Escolher fotos
          </Button>
        </div>
      </main>
    </>
  );
}
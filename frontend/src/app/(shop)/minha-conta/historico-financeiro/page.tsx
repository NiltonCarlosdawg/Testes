'use client';

import { CreditCard } from 'lucide-react';   // ← ADICIONA ESTA LINHA
import { Card } from '@/components/ui/card';

export default function FinancialHistoryPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <CreditCard className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Histórico Financeiro</h1>
      </div>

      <Card className="p-8 text-center text-gray-500">
        <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-20" />
        <p>Em breve verás aqui todos os teus pagamentos, parcelas e extrato completo.</p>
      </Card>
    </div>
  );
}
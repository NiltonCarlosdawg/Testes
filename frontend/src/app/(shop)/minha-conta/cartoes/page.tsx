'use client';

import { useState } from 'react';
import { CreditCard, Plus, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

import AddPaymentMethodModal from '@/components/account/AddPaymentMethodModal';

type PaymentMethod = {
  id: string;
  type: 'multicaixa_express' | 'multicaixa_card' | 'unitel_money' | 'visa' | 'mastercard';
  displayName: string;
  last4: string;
  exp?: string;
  isDefault: boolean;
};

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'multicaixa_express', displayName: 'Multicaixa Express', last4: '7890', isDefault: true },
    { id: '2', type: 'unitel_money', displayName: 'Unitel Money', last4: '9234', isDefault: false },
    { id: '3', type: 'visa', displayName: 'Cartão Visa', last4: '4242', exp: '09/28', isDefault: false },
  ]);

  const [modalOpen, setModalOpen] = useState(false);

  const removeMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(m => m.id !== id));
    toast.success('Método removido');
  };

  const setDefault = (id: string) => {
    setPaymentMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
    toast.success('Definido como principal');
  };

  const handleSuccess = () => {
    toast.success('Método de pagamento adicionado com sucesso!');
    // Aqui no futuro recarregas do backend
  };

  const getMethodIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'multicaixa_express':
        return <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">MCX</div>;
      case 'multicaixa_card':
        return <div className="w-14 h-14 bg-purple-700 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">MC</div>;
      case 'unitel_money':
        return <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">UM</div>;
      case 'visa':
        return <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">VISA</div>;
      case 'mastercard':
        return <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">MC</div>;
    }
  };

  return (
    <>
      <div className="space-y-6 pb-20 lg:pb-8">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-primary" />
          <h1 className="text-2xl lg:text-3xl font-bold">Métodos de Pagamento</h1>
        </div>

        {/* Alerta de segurança */}
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <Shield className="h-5 w-5" />
          <AlertDescription>
            Pagamentos 100% seguros e criptografados. Nunca guardamos dados completos.
          </AlertDescription>
        </Alert>

        {/* Lista de métodos salvos */}
        <div className="space-y-5">
          {paymentMethods.length === 0 ? (
            <Card className="p-16 text-center border-dashed">
              <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-lg text-muted-foreground">Nenhum método adicionado</p>
            </Card>
          ) : (
            paymentMethods.map((method) => (
              <Card
                key={method.id}
                className={`p-5 transition-all duration-200 ${
                  method.isDefault
                    ? 'ring-2 ring-primary shadow-xl bg-primary/5'
                    : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    {getMethodIcon(method.type)}

                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">{method.displayName}</span>
                        {method.isDefault && (
                          <Badge variant="default" className="font-medium">
                            Principal
                          </Badge>
                        )}
                      </div>
                      <p className="font-mono text-lg mt-1">•••• •••• •••• {method.last4}</p>
                      {method.exp && (
                        <p className="text-sm text-muted-foreground">Validade {method.exp}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDefault(method.id)}
                      >
                        Tornar principal
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMethod(method.id)}
                    >
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}

          {/* BOTÃO NOVO — ESTILO BANCO DIGITAL ANGOLANO */}
          <Button
            onClick={() => setModalOpen(true)}
            className="w-full h-32 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col items-center justify-center gap-3 border-4 border-white/20"
          >
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Plus className="h-10 w-10" />
            </div>
            <span>Adicionar novo método</span>
            <span className="text-sm font-normal opacity-90">
              Multicaixa • Unitel Money • Visa • Mastercard
            </span>
          </Button>
        </div>
      </div>

      {/* Modal com os 5 métodos reais */}
      <AddPaymentMethodModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
}
'use client';

import { useState } from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type PaymentType =
  | 'multicaixa_express'
  | 'multicaixa_card'
  | 'unitel_money'
  | 'visa'
  | 'mastercard';

interface AddPaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AddPaymentMethodModal({
  open,
  onOpenChange,
  onSuccess,
}: AddPaymentMethodModalProps) {
  const [step, setStep] = useState<'select' | PaymentType>('select');

  // Estados dos formulários
  const [mcxNumber, setMcxNumber] = useState('');
  const [mcxPin, setMcxPin] = useState('');
  const [unitelNumber, setUnitelNumber] = useState('');
  const [visaNumber, setVisaNumber] = useState('');
  const [visaName, setVisaName] = useState('');
  const [visaExpiry, setVisaExpiry] = useState('');
  const [visaCvv, setVisaCvv] = useState('');
  const [masterNumber, setMasterNumber] = useState('');
  const [masterName, setMasterName] = useState('');
  const [masterExpiry, setMasterExpiry] = useState('');
  const [masterCvv, setMasterCvv] = useState('');

  const handleSave = (type: PaymentType) => {
    const messages: Record<PaymentType, string> = {
      multicaixa_express: 'Multicaixa Express adicionado!',
      multicaixa_card: 'Cartão Multicaixa adicionado!',
      unitel_money: 'Unitel Money adicionado!',
      visa: 'Cartão Visa adicionado!',
      mastercard: 'Cartão Mastercard adicionado!',
    };

    toast.success(messages[type]);
    onSuccess?.();
    onOpenChange(false);
    setStep('select');
    // Reset todos os campos
    setMcxNumber(''); setMcxPin(''); setUnitelNumber('');
    setVisaNumber(''); setVisaName(''); setVisaExpiry(''); setVisaCvv('');
    setMasterNumber(''); setMasterName(''); setMasterExpiry(''); setMasterCvv('');
  };

  const formatCard = (v: string) => v.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
  const formatExpiry = (v: string) => v.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2').slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); setStep('select'); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {step !== 'select' && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-4"
              onClick={() => setStep('select')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <DialogTitle className="text-center pr-8 text-xl">
            {step === 'select' ? 'Escolhe o método de pagamento' : 'Configurar método'}
          </DialogTitle>
        </DialogHeader>

        {/* PASSO 1: Seleção */}
        {step === 'select' && (
          <div className="space-y-6 py-4">
            {/* Métodos nacionais */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Métodos nacionais</h3>
              <div className="grid gap-3">
                <Card className="p-4 cursor-pointer hover:ring-2 hover:ring-primary transition-all" onClick={() => setStep('multicaixa_express')}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">MCX</div>
                    <div>
                      <h4 className="font-bold">Multicaixa Express</h4>
                      <p className="text-xs text-muted-foreground">Pagamento digital via EMIS</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 cursor-pointer hover:ring-2 hover:ring-primary transition-all" onClick={() => setStep('multicaixa_card')}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-700 rounded-xl flex items-center justify-center text-white font-bold text-xl">MC</div>
                    <div>
                      <h4 className="font-bold">Cartão Multicaixa (Nacional)</h4>
                      <p className="text-xs text-muted-foreground">Cartão bancário angolano</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 cursor-pointer hover:ring-2 hover:ring-primary transition-all" onClick={() => setStep('unitel_money')}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">UM</div>
                    <div>
                      <h4 className="font-bold">Unitel Money</h4>
                      <p className="text-xs text-muted-foreground">Carteira mobile da Unitel</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Cartões internacionais */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Cartões internacionais</h3>
              <div className="grid gap-3">
                <Card className="p-4 cursor-pointer hover:ring-2 hover:ring-primary transition-all" onClick={() => setStep('visa')}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">VISA</div>
                    <div>
                      <h4 className="font-bold">Cartão Visa</h4>
                      <p className="text-xs text-muted-foreground">Débito ou crédito internacional</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 cursor-pointer hover:ring-2 hover:ring-primary transition-all" onClick={() => setStep('mastercard')}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">MC</div>
                    <div>
                      <h4 className="font-bold">Cartão Mastercard</h4>
                      <p className="text-xs text-muted-foreground">Débito ou crédito internacional</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Formulários individuais */}
        {step === 'multicaixa_express' && (
          <div className="space-y-5 py-4">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mb-4">MCX</div>
              <h3 className="text-xl font-bold">Multicaixa Express</h3>
            </div>
            <div><Label>Número de telemóvel</Label><Input placeholder="9xx xxx xxx" value={mcxNumber} onChange={e => setMcxNumber(e.target.value)} /></div>
            <div><Label>PIN Multicaixa Express</Label><Input type="password" placeholder="••••" maxLength={4} value={mcxPin} onChange={e => setMcxPin(e.target.value.slice(0,4))} /></div>
            <Button className="w-full" onClick={() => handleSave('multicaixa_express')}>
              <Check className="mr-2 h-5 w-5" /> Guardar Multicaixa Express
            </Button>
          </div>
        )}

        {step === 'multicaixa_card' && (
          <div className="space-y-5 py-4 text-center">
            <div className="mx-auto w-20 h-20 bg-purple-700 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mb-4">MC</div>
            <h3 className="text-xl font-bold">Em breve</h3>
            <p className="text-muted-foreground">Integração com cartões Multicaixa físicos está em desenvolvimento com a EMIS.</p>
            <Button variant="outline" className="w-full" onClick={() => setStep('select')}>Voltar</Button>
          </div>
        )}

        {step === 'unitel_money' && (
          <div className="space-y-5 py-4">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mb-4">UM</div>
              <h3 className="text-xl font-bold">Unitel Money</h3>
            </div>
            <div><Label>Número Unitel Money</Label><Input placeholder="9xx xxx xxx" value={unitelNumber} onChange={e => setUnitelNumber(e.target.value)} /></div>
            <Button className="w-full" onClick={() => handleSave('unitel_money')}>
              <Check className="mr-2 h-5 w-5" /> Guardar Unitel Money
            </Button>
          </div>
        )}

        {step === 'visa' && (
          <div className="space-y-5 py-4">
            <div className="text-center mb-6">
              <div className="mx-auto w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">VISA</div>
            </div>
            <div><Label>Número do cartão</Label><Input placeholder="0000 0000 0000 0000" value={visaNumber} onChange={e => setVisaNumber(formatCard(e.target.value))} className="font-mono" /></div>
            <div><Label>Nome no cartão</Label><Input placeholder="Ex: Maria Santos" value={visaName} onChange={e => setVisaName(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Validade</Label><Input placeholder="MM/AA" value={visaExpiry} onChange={e => setVisaExpiry(formatExpiry(e.target.value))} /></div>
              <div><Label>CVV</Label><Input placeholder="123" maxLength={3} value={visaCvv} onChange={e => setVisaCvv(e.target.value.slice(0,3))} /></div>
            </div>
            <Button className="w-full" onClick={() => handleSave('visa')}>
              <Check className="mr-2 h-5 w-5" /> Guardar Cartão Visa
            </Button>
          </div>
        )}

        {step === 'mastercard' && (
          <div className="space-y-5 py-4">
            <div className="text-center mb-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">MC</div>
            </div>
            <div><Label>Número do cartão</Label><Input placeholder="0000 0000 0000 0000" value={masterNumber} onChange={e => setMasterNumber(formatCard(e.target.value))} className="font-mono" /></div>
            <div><Label>Nome no cartão</Label><Input placeholder="Ex: João Pedro" value={masterName} onChange={e => setMasterName(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Validade</Label><Input placeholder="MM/AA" value={masterExpiry} onChange={e => setMasterExpiry(formatExpiry(e.target.value))} /></div>
              <div><Label>CVV</Label><Input placeholder="123" maxLength={3} value={masterCvv} onChange={e => setMasterCvv(e.target.value.slice(0,3))} /></div>
            </div>
            <Button className="w-full" onClick={() => handleSave('mastercard')}>
              <Check className="mr-2 h-5 w-5" /> Guardar Cartão Mastercard
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
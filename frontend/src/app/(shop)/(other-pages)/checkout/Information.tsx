'use client'

import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonThird from '@/shared/Button/ButtonThird'
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset'
import { Subheading } from '@/shared/heading'
import { Input } from '@/shared/input'
import { Radio, RadioField, RadioGroup } from '@/shared/radio'
import {
  CreditCardIcon,
  CreditCardPosIcon,
  InternetIcon,
  Route02Icon,
  Tick02Icon,
  UserCircle02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import Link from 'next/link'
import { useState } from 'react'

type Tab = 'ContactInfo' | 'ShippingAddress' | 'PaymentMethod'

type CheckoutData = {
  telefone: string
  endereco: {
    nome: string
    apelido: string
    morada: string
    apartamento: string
    cidade: string
    provincia: string
    codigoPostal: string
  }
  metodoPagamento: 'multicaixa' | 'transferencia'
}

type InformationProps = {
  user: any
  onConfirm: (data: CheckoutData) => Promise<{ success: boolean; whatsappUrl: string }>
}

const Information = ({ user, onConfirm }: InformationProps) => {
  const [tabActive, setTabActive] = useState<Tab>('ContactInfo')
  const [formData, setFormData] = useState<CheckoutData>({
    telefone: user.telefone || '',
    endereco: {
      nome: user.primeiroNome || '',
      apelido: user.ultimoNome || '',
      morada: '',
      apartamento: '',
      cidade: 'Luanda',
      provincia: 'Luanda',
      codigoPostal: '',
    },
    metodoPagamento: 'multicaixa',
  })

  const handleScrollToEl = (id: string) => {
    const element = document.getElementById(id)
    setTimeout(() => element?.scrollIntoView({ behavior: 'smooth' }), 80)
  }

  const handleNext = (nextTab: Tab) => {
    setTabActive(nextTab)
    handleScrollToEl(nextTab)
  }

  const handleConfirm = async () => {
    const result = await onConfirm(formData)
    if (result.success && result.whatsappUrl) {
      window.open(result.whatsappUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Contact Info */}
      
      <div id="ContactInfo" className="scroll-mt-5 rounded-xl border">
        <TabHeader
          title="Contato"
          icon={UserCircle02Icon}
          value={`${formData.endereco.nome || user.primeiroNome} ${formData.endereco.apelido || user.ultimoNome} / ${formData.telefone || 'Sem telefone'}`}
          onClickChange={() => handleNext('ContactInfo')}
        />
        <div className={clsx('border-t px-4 py-7 sm:px-6', tabActive !== 'ContactInfo' && 'invisible hidden')}>
          <ContactInfo
            user={user}
            telefone={formData.telefone}
            onUpdate={(telefone) => setFormData({ ...formData, telefone })}
            onClose={() => handleNext('ShippingAddress')}
          />
        </div>
      </div>

      {/* Endereço */}
      <div id="ShippingAddress" className="scroll-mt-5 rounded-xl border">
        <TabHeader
          title="Endereço de entrega"
          icon={Route02Icon}
          value={formData.endereco.morada ? `${formData.endereco.morada}, ${formData.endereco.cidade}` : 'Luanda, Angola'}
          onClickChange={() => handleNext('ShippingAddress')}
        />
        <div className={clsx('border-t px-4 py-7 sm:px-6', tabActive !== 'ShippingAddress' && 'invisible hidden')}>
          <ShippingAddress
            data={formData.endereco}
            onUpdate={(endereco) => setFormData({ ...formData, endereco })}
            onClose={() => handleNext('PaymentMethod')}
          />
        </div>
      </div>

      {/* Pagamento */}
      <div id="PaymentMethod" className="scroll-mt-5 rounded-xl border">
        <TabHeader
          title="Método de pagamento"
          icon={CreditCardPosIcon}
          value={formData.metodoPagamento === 'multicaixa' ? 'Multicaixa / EMIS' : 'Transferência Bancária'}
          onClickChange={() => handleNext('PaymentMethod')}
        />
        <div className={clsx('border-t px-4 py-7 sm:px-6', tabActive !== 'PaymentMethod' && 'invisible hidden')}>
          <PaymentMethod
            metodo={formData.metodoPagamento}
            onChange={(metodo) => setFormData({ ...formData, metodoPagamento: metodo })}
            onConfirm={handleConfirm}
            onBack={() => handleNext('ShippingAddress')}
          />
        </div>
      </div>
    </div>
  )
}

const TabHeader = ({ title, icon, value, onClickChange }: { title: string; icon: any; value: string; onClickChange: () => void }) => (
  <div className="flex flex-col items-start gap-5 p-5 sm:flex-row sm:p-6">
    <HugeiconsIcon icon={icon} size={24} className="sm:mt-1.5" />
    <div className="sm:pl-3">
      <h3 className="flex items-center gap-3 text-neutral-700 dark:text-neutral-400">
        <span className="tracking-tight uppercase">{title}</span>
        <HugeiconsIcon icon={Tick02Icon} size={24} className="mb-1 text-primary-500" />
      </h3>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
    <button
      className="rounded-lg bg-neutral-50 px-4 py-2 text-sm font-medium hover:bg-neutral-100 sm:ml-auto dark:bg-neutral-800 dark:hover:bg-neutral-700"
      onClick={onClickChange}
      type="button"
    >
      Alterar
    </button>
  </div>
)

const ContactInfo = ({ user, telefone, onUpdate, onClose }: any) => (
  <form onSubmit={(e) => { e.preventDefault(); onClose() }}>
    <Fieldset>
      <FieldGroup>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-lg font-semibold">Informações de contato</h3>
          <p className="text-sm">
            Não tem conta? <Link href="/login" className="font-medium underline">Entrar</Link>
          </p>
        </div>
        <Field className="max-w-lg">
          <Label>Telefone</Label>
          <Input
            value={telefone}
            onChange={(e) => onUpdate(e.target.value)}
            type="tel"
            name="phone"
            required
          />
        </Field>
        <Field className="max-w-lg">
          <Label>Email</Label>
          <Input value={user.email} type="email" readOnly />
        </Field>

        <div className="flex flex-wrap gap-2.5 pt-4">
          <ButtonPrimary type="submit">Próximo: Endereço</ButtonPrimary>
          <ButtonThird type="button" onClick={onClose}>Cancelar</ButtonThird>
        </div>
      </FieldGroup>
    </Fieldset>
  </form>
)

const ShippingAddress = ({ data, onUpdate, onClose }: any) => (
  <form onSubmit={(e) => { e.preventDefault(); onClose() }}>
    <Fieldset>
      <FieldGroup>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4">
          <Field>
            <Label>Nome</Label>
            <Input value={data.nome} onChange={(e) => onUpdate({ ...data, nome: e.target.value })} required />
          </Field>
          <Field>
            <Label>Apelido</Label>
            <Input value={data.apelido} onChange={(e) => onUpdate({ ...data, apelido: e.target.value })} required />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-4">
          <Field className="sm:col-span-2">
            <Label>Morada</Label>
            <Input value={data.morada} onChange={(e) => onUpdate({ ...data, morada: e.target.value })} required />
          </Field>
          <Field>
            <Label>Apartamento</Label>
            <Input placeholder="Opcional" value={data.apartamento} onChange={(e) => onUpdate({ ...data, apartamento: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4">
          <Field>
            <Label>Cidade</Label>
            <Input value={data.cidade} onChange={(e) => onUpdate({ ...data, cidade: e.target.value })} required />
          </Field>
          <Field>
            <Label>Província</Label>
            <Input value={data.provincia} onChange={(e) => onUpdate({ ...data, provincia: e.target.value })} required />
          </Field>
          <Field>
            <Label>Código Postal</Label>
            <Input placeholder="0000" value={data.codigoPostal} onChange={(e) => onUpdate({ ...data, codigoPostal: e.target.value })} />
          </Field>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-6">
          <ButtonPrimary type="submit">Próximo: Pagamento</ButtonPrimary>
          <ButtonThird type="button" onClick={onClose}>Cancelar</ButtonThird>
        </div>
      </FieldGroup>
    </Fieldset>
  </form>
)

const PaymentMethod = ({ metodo, onChange, onConfirm, onBack }: any) => {
  const [pending, setPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending(true)
    await onConfirm()
    setPending(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Fieldset>
        <FieldGroup>
          <RadioGroup name="payment" value={metodo} onChange={onChange}>
            <RadioField>
              <Radio value="multicaixa" />
              <Label className="flex items-center gap-3">
                <HugeiconsIcon icon={CreditCardIcon} size={24} />
                <span>Multicaixa / EMIS</span>
              </Label>
            </RadioField>
            {metodo === 'multicaixa' && (
              <div className="mt-4 ml-8 text-sm text-neutral-600">
                <p>Pague via Multicaixa ou EMIS. Enviaremos os dados após confirmação.</p>
              </div>
            )}

            <RadioField className="mt-4">
              <Radio value="transferencia" />
              <Label className="flex items-center gap-3">
                <HugeiconsIcon icon={InternetIcon} size={24} />
                <span>Transferência Bancária</span>
              </Label>
            </RadioField>
            {metodo === 'transferencia' && (
              <div className="mt-4 ml-8 text-sm text-neutral-600">
                <Subheading>IBAN: AO06 0006 0000 1234 5678 9012 3</Subheading>
                <p>Titular: Loja Online</p>
              </div>
            )}
          </RadioGroup>

          <div className="flex flex-wrap gap-2.5 pt-6">
            <ButtonPrimary type="submit" className="min-w-56" disabled={pending}>
              {pending ? 'Enviando...' : 'Confirmar Encomenda'}
            </ButtonPrimary>
            <ButtonThird type="button" onClick={onBack}>Voltar</ButtonThird>
          </div>
        </FieldGroup>
      </Fieldset>
    </form>
  )
}

export default Information
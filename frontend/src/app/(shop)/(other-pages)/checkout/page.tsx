import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCarrinhoByUser } from '@/lib/queries/cart.api'
import { getWhatsAppOrderUrl } from '@/services/whatsapp.service'
import { getProfile, User } from '@/lib/queries/auth.api'
import { Product } from '@/types/product'
import CheckoutClientWrapper from './checkout-client-wrapper'
import { atualizarItemCarrinho, deletarItemCarrinho } from "@/lib/queries/cart.api"
import { revalidatePath } from 'next/cache'

export const metadata: Metadata = {
  title: 'Finalizar Compra',
  description: 'Página de checkout eficiente para sua loja online',
}

const CheckoutPage = async () => {
  const carrinhoRes = await getCarrinhoByUser()
  const perfilRes = await getProfile()

  const items = carrinhoRes.data
  const user = perfilRes.data

  if (!items || items.length === 0) {
    redirect('/carrinho')
  }

  const subtotal = items.reduce((acc, item) => acc + item.produto.preco * item.quantidade, 0)
  const envio = 1500 
  const imposto = subtotal * 0.14
  const total = subtotal + envio + imposto

  const handleConfirmOrder = async (orderData: {
    items: Product[],
    user: User,
    subtotal: number,
    envio: number,
    imposto: number,
    total: number
  }) => {
    'use server'

    const { items, user, subtotal, envio, imposto, total } = orderData

    const produtos = items.map((item: any) => ({
      nome: item.produto.nome,
      quantidade: item.quantidade,
      preco: item.produto.preco,
      cor: item.produto.cor,
      tamanho: item.produto.tamanho,
    }))

    const mensagem = `
*Nova Encomenda Recebida!*

*Cliente:* ${user.primeiroNome} ${user.ultimoNome}
*Email:* ${user.email}
*Telefone:* ${user.telefone || 'Não informado'}

*Itens:*
${produtos.map(p => `• ${p.nome} (x${p.quantidade}) - ${p.cor}, ${p.tamanho} - ${(p.preco * p.quantidade).toLocaleString('pt-AO')} AOA`).join('\n')}

*Subtotal:* ${subtotal.toLocaleString('pt-AO')} AOA
*Envio:* ${envio.toLocaleString('pt-AO')} AOA
*Imposto:* ${imposto.toLocaleString('pt-AO')} AOA
*Total:* ${total.toLocaleString('pt-AO')} AOA

*Aguarde contato para pagamento e entrega.*
    `.trim()

    const whatsappUrl = await getWhatsAppOrderUrl(mensagem)
    redirect(whatsappUrl)
  }

  const handleUpdateQuantity = async (id: string, quantidade: number) => {
    'use server'
    
    if (quantidade < 1) {
      return { success: false, message: 'Quantidade inválida' }
    }

    try {
      await atualizarItemCarrinho(id, { quantidade })
      revalidatePath('/checkout')
      return { success: true, message: 'Quantidade atualizada!' }
    } catch (error) {
      return { success: false, message: 'Erro ao atualizar quantidade' }
    }
  }

  const handleRemoveItem = async (id: string) => {
    'use server'
    
    try {
      await deletarItemCarrinho(id)
      revalidatePath('/checkout')
    
      const updatedCart = await getCarrinhoByUser()
      if (!updatedCart.data || updatedCart.data.length === 0) {
        redirect('/carrinho')
      }
      
      return { success: true, message: 'Produto removido!' }
    } catch (error) {
      return { success: false, message: 'Erro ao remover produto' }
    }
  }

  return (
    <CheckoutClientWrapper
      items={items}
      user={user}
      subtotal={subtotal}
      envio={envio}
      imposto={imposto}
      total={total}
      handleConfirmOrder={handleConfirmOrder}
      handleUpdateQuantity={handleUpdateQuantity}
      handleRemoveItem={handleRemoveItem}
    />
  )
}

export default CheckoutPage
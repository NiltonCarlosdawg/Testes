import api from '@/lib/axios'

export const sendWhatsAppOrder = async (message: string) => {
  'use server'
  const phone = '244951996865' 
  const text = encodeURIComponent(message)

  await api.post('https://api.whatsapp.com/send', null, {
    params: { phone, text },
  })
}

  export const getWhatsAppOrderUrl = async (message: string) => {
    'use server'
    const phone = '244951996865' 
    const text = encodeURIComponent(message)
   
    return `https://wa.me/${phone}?text=${text}`
  }
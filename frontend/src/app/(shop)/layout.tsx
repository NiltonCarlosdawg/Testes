import '@/styles/shop.css'
import { Poppins } from 'next/font/google'
import Aside from '@/components/shop/aside'


const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={poppins.className}>
      <Aside.Provider>
        {children}
      </Aside.Provider>
    </div>
  )
}
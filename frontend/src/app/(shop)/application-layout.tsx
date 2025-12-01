import Footer from '@/components/shop/Footer'
import Header from '@/components/shop/Header/Header'
import AsideProductQuickView from '@/components/shop/aside-product-quickview'
import AsideSidebarCart from '@/components/shop/aside-sidebar-cart'
import AsideSidebarNavigation from '@/components/shop/aside-sidebar-navigation'
import 'rc-slider/assets/index.css'
import React, { ReactNode } from 'react'

interface ComponentProps {
  children: ReactNode
  header?: ReactNode
  footer?: ReactNode
}

const ApplicationLayout: React.FC<ComponentProps> = ({ children, header, footer }) => {
  return (
    <div>
      {header ? header : <Header />}
      {children}
      {footer ? footer : <Footer />}

      {/* ASIDES */}
      <AsideSidebarNavigation />
      <AsideSidebarCart />
      <AsideProductQuickView />
    </div>
  )
}

export { ApplicationLayout }

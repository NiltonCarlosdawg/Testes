// src/app/minha-conta/layout.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  Package, Heart, User, CreditCard, Menu, LogOut, X,
  Sun, Moon, Home, ArrowLeft
} from 'lucide-react';
import { useTheme } from 'next-themes';

const menuItems = [
  { href: '/minha-conta/pedidos', icon: Package, label: 'Os Meus Pedidos', id: 'orders' },
  { href: '/minha-conta/wishlist', icon: Heart, label: 'Favoritos', id: 'wishlist' },
  { href: '/minha-conta/perfil', icon: User, label: 'Os Meus Dados', id: 'profile' },
  { href: '/minha-conta/cartoes', icon: CreditCard, label: 'Métodos de Pagamento', id: 'cards' },
  { href: '/minha-conta/historico-financeiro', icon: CreditCard, label: 'Histórico Financeiro', id: 'finance' },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background">
      {/* CABEÇALHO DA SIDEBAR COM BOTÃO HOME */}
      <div className="p-5 border-b">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-teal-600 hover:text-teal-700">
            <Home className="h-6 w-6" />
            <span className="font-bold text-lg">Kitroca</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link key={item.id} href={item.href} onClick={() => setMobileOpen(false)}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-3 h-12 text-left"
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-3">
        <Button
          variant="outline"
          className="w-full justify-center gap-3 relative"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="font-medium">Alterar tema</span>
        </Button>

        <Button variant="destructive" className="w-full justify-start gap-3">
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sair</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* HEADER MOBILE COM BOTÃO VOLTAR */}
      <header className="lg:hidden sticky top-0 z-50 bg-background border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          {/* BOTÃO VOLTAR PARA HOME (MOBILE) */}
          <Button asChild variant="ghost" size="sm">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Início</span>
            </Link>
          </Button>

          <h1 className="text-xl font-bold">Minha Conta</h1>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* MOBILE DRAWER */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-80 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* DESKTOP SIDEBAR (com logo + home no topo) */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-0 h-screen bg-background border-r shadow-sm">
            <SidebarContent />
          </div>
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 p-4 lg:p-8 pb-20 lg:pb-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* ESPAÇO EXTRA NO MOBILE */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
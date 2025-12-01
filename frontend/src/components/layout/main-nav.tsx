// src/components/layout/main-nav.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Store,
  FileText,
  Wallet,
  User,
  Kanban,
  LogOut,
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Lojas',
    icon: Store,
    children: [
      { name: 'Todas as lojas', href: '/lojas' },
      { name: 'Criar nova loja', href: '/lojas/nova' },
      { name: 'Configurações', href: '/lojas/configuracoes' },
    ],
  },
  { name: 'Relatório Financeiro', href: '/relatorio-financeiro', icon: FileText },
  {
    name: 'Saques',
    icon: Wallet,
    children: [
      { name: 'Solicitar saque', href: '/saques' },
      { name: 'Histórico de saques', href: '/saques/historico' },
    ],
  },
  {
    name: 'Conta',
    icon: User,
    children: [
      { name: 'Meu perfil', href: '/conta/perfil' },
      { name: 'Segurança', href: '/conta/seguranca' },
      { name: 'Notificações', href: '/conta/notificacoes' },
      { name: 'Sair', href: '#', destructive: true, icon: LogOut },
    ],
  },
  { name: 'Kanban', href: '/kanban', icon: Kanban },
];

interface MainNavigationProps {
  onNavigate?: () => void;
  className?: string;
}

// Desktop – menu com hover bonito
function DesktopMenu({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="hidden md:flex items-center gap-1">
      {menuItems.map((item) => {
        const Icon = item.icon;

        // Itens com submenu
        if (item.children) {
          return (
            <div key={item.name} className="relative group">
              <button className="flex items-center gap-2 h-9 px-4 rounded-md text-sm font-medium hover:bg-accent transition-colors">
                <Icon className="h-4 w-4" />
                {item.name}
              </button>

              <div className="absolute top-full left-0 mt-1 w-64 bg-popover border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-2">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      onClick={(e) => {
                        if (child.destructive) {
                          e.preventDefault();
                          document.getElementById('logout-btn')?.click();
                        }
                        onNavigate?.();
                      }}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent block",
                        child.destructive && "text-destructive hover:bg-destructive/10"
                      )}
                    >
                      {child.icon && <child.icon className="h-4 w-4" />}
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        }

        // Itens simples – CORRIGIDO AQUI
        return (
          <Link
            key={item.name}
            href={item.href!}
            onClick={onNavigate}
            className="flex items-center gap-2 h-9 px-4 rounded-md text-sm font-medium hover:bg-accent transition-colors"
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

// Mobile – menu limpo e funcional
function MobileMenu({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 py-4">
      {menuItems.map((item) => {
        const Icon = item.icon;

        if (item.children) {
          return (
            <div key={item.name}>
              <div className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-muted-foreground">
                <Icon className="h-5 w-5" />
                {item.name}
              </div>
              <div className="ml-9 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.name}
                    href={child.href}
                    onClick={(e) => {
                      if (child.destructive) {
                        e.preventDefault();
                        document.getElementById('logout-btn')?.click();
                      }
                      onNavigate?.();
                    }}
                    className={cn(
                      "block rounded-md px-4 py-2 text-sm hover:bg-accent",
                      child.destructive && "text-destructive"
                    )}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item.name}
            href={item.href!}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <Icon className="h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

export default function MainNavigation({ onNavigate, className }: MainNavigationProps) {
  return (
    <>
      <div className={cn("hidden md:block", className)}>
        <DesktopMenu onNavigate={onNavigate} />
      </div>
      <div className={cn("md:hidden", className)}>
        <MobileMenu onNavigate={onNavigate} />
      </div>
    </>
  );
}
// src/components/Header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Camera, MessageCircle, Heart, Globe, ChevronDown, Menu, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import MainNavigation from '@/components/layout/main-nav';
import Cookies from 'js-cookie';
import NotificationModal from '@/components/NotificationModal';

const TOTAL_MESSAGES_UNREAD = 4;

const categorias = [
  "Mulher", "Homem", "Criança", "Casa", "Eletrônica",
  "Livros e Multimédia", "Hobbies e Coleções", "Desporto", "Sobre", "A nossa Plataforma"
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userCookie = Cookies.get('user');
  const user = userCookie ? JSON.parse(userCookie) : null;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">

          {/* ESQUERDA */}
          <div className="flex items-center gap-6">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <MainNavigation onNavigate={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>

            <Link href="/" className="text-2xl font-bold text-teal-600">
              Kitroca
            </Link>
          </div>

          {/* PESQUISA CENTRAL */}
          <div className="flex-1 max-w-4xl mx-8">
            <div className="relative">
              <Input
                type="search"
                placeholder="Pesquisar artigos"
                className="h-12 pl-12 pr-36 text-base rounded-full border-gray-300 shadow-sm focus:border-teal-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchQuery && (location.href = `/produtos?q=${searchQuery}`)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-500" />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 text-teal-600 hover:bg-teal-50"
              >
                <Camera className="h-5 w-5" />
                <span className="hidden sm:inline">Foto</span>
              </Button>
            </div>
          </div>

          {/* DIREITA – AÇÕES */}
          <div className="flex items-center gap-3">

            <Button asChild size="icon" variant="ghost" className="hidden sm:flex">
              <Link href="/vender"><Upload className="h-5 w-5" /></Link>
            </Button>

            {/* MENSAGENS */}
            <Button asChild variant="ghost" size="icon" className="relative">
              <Link href="/mensagens">
                <MessageCircle className="h-5 w-5" />
                {TOTAL_MESSAGES_UNREAD > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-teal-600 text-white font-medium">
                    {TOTAL_MESSAGES_UNREAD}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* NOTIFICAÇÕES */}
            <NotificationModal />

            {/* FAVORITOS */}
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>

            <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white hidden md:flex">
              <Link href="/vender">Vender agora</Link>
            </Button>

            {/* AVATAR – AGORA VAI PARA /minha-conta */}
            {user ? (
              <Button asChild variant="ghost" className="flex items-center gap-2 p-1">
                <Link href="/minha-conta" className="flex items-center gap-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>{user.primeiroNome?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="ghost">
                <Link href="/login">Entrar</Link>
              </Button>
            )}

            <Button variant="ghost" size="sm" className="gap-1">
              <Globe className="h-4 w-4" />
              PT <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </header>

      {/* BARRA DE CATEGORIAS */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-8 overflow-x-auto py-3 scrollbar-hide">
            {categorias.map((cat) => (
              <Link
                key={cat}
                href={`/categoria/${cat.toLowerCase().replace(/ /g, '-')}`}
                className="whitespace-nowrap text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
              >
                {cat}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* PESQUISA MOBILE */}
      <div className="md:hidden border-b bg-white px-4 py-3">
        <div className="relative">
          <Input placeholder="Pesquisar artigos..." className="h-12 pl-12 pr-24 rounded-full" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-500" />
          <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-teal-600">
            <Camera className="h-5 w-5" />
            Foto
          </Button>
        </div>
      </div>
    </>
  );
}
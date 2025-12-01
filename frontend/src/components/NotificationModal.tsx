// src/components/NotificationModal.tsx
'use client';

import React, { useState } from 'react';
import { Bell, MessageCircle, Heart, Package, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Notification {
  id: number;
  type: 'message' | 'like' | 'sale' | 'offer' | 'system';
  title: string;
  message: string;
  avatar?: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  { id: 1, type: 'message', title: 'Ana Silva', message: 'Olá! Ainda tens o vestido disponível?', avatar: 'https://i.pravatar.cc/150?img=1', time: '2 minutos atrás', read: false },
  { id: 2, type: 'like', title: '12 pessoas', message: 'gostaram do teu artigo "iPhone 14 Pro"', time: '15 minutos atrás', read: false },
  { id: 3, type: 'sale', title: 'Venda concluída', message: 'Vendeste o teu "MacBook Air M1" por €890', time: '1 hora atrás', read: false },
  { id: 4, type: 'offer', title: 'Nova oferta recebida', message: '€120 pelo teu "PS5 + 2 comandos"', time: '3 horas atrás', read: true },
  { id: 5, type: 'system', title: 'Dica de vendas', message: 'Artigos com mais de 3 fotos vendem até 3x mais rápido.', time: '5 horas atrás', read: true },
];

export default function NotificationModal() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message': return <MessageCircle className="h-5 w-5 text-blue-600" />;
      case 'like': return <Heart className="h-5 w-5 text-red-600" />;
      case 'sale': return <Package className="h-5 w-5 text-green-700" />;
      case 'offer': return <div className="h-5 w-5 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs font-bold">€</div>;
      case 'system': return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-600 text-white font-medium">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">Notificações</SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-sm">
                <Check className="h-4 w-4 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">Não tens notificações novas</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    "p-4 hover:bg-gray-50 transition-colors cursor-pointer",
                    !notif.read && "bg-blue-50/50"
                  )}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      {notif.avatar ? (
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={notif.avatar} />
                          <AvatarFallback>{notif.title[0]}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          {getIcon(notif.type)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900">{notif.title}</p>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                    </div>

                    {!notif.read && (
                      <div className="flex-shrink-0 self-center">
                        <div className="h-2 w-2 bg-blue-600 rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
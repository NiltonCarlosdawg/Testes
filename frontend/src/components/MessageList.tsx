// src/components/MessageList.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const conversations = [
  { id: 1, name: 'Ana Silva', lastMessage: 'Sim, ainda está disponível. Pode vir buscar amanhã?', time: '2 min', unread: 3, avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: 2, name: 'João Mendes', lastMessage: 'Boa tarde! Aceitas €180?', time: '15 min', unread: 1, avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: 3, name: 'Maria Costa', lastMessage: 'Obrigada! Recebi tudo perfeito', time: '1h', unread: 0, avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 4, name: 'Pedro Almeida', lastMessage: 'Podes enviar mais fotos do interior?', time: '3h', unread: 0, avatar: 'https://i.pravatar.cc/150?img=7' },
];

export default function MessageList() {
  const params = useParams();
  const selectedId = params?.id ? Number(params.id) : null;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const showChat = selectedId && !isMobile;

  // Se estiver no mobile e tiver um chat aberto → mostra apenas o chat (página separada)
  if (selectedId && isMobile) {
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-10 bg-white border-b flex items-center gap-3 p-4">
          <Link href="/mensagens">
            <button className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversations.find(c => c.id === selectedId)?.avatar} />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{conversations.find(c => c.id === selectedId)?.name}</p>
            <p className="text-xs text-gray-500">Online</p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center h-96">
          <div className="text-center text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">Chat em desenvolvimento</p>
          </div>
        </div>
      </div>
    );
  }

  // Mobile + Desktop: Lista de conversas (ou split view no desktop)
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-6">
          
          {/* LISTA DE CONVERSAS (sempre visível no desktop, único no mobile) */}
          <div className={showChat ? "hidden lg:block" : "block"}>
            <div className="bg-white border-b lg:border-b-0 lg:border-r lg:rounded-l-lg lg:shadow-sm h-screen lg:h-auto">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Conversas</h2>
              </div>
              <div className="divide-y">
                {conversations.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/mensagens/${conv.id}`}
                    className={cn(
                      "block p-4 hover:bg-gray-50 transition-colors",
                      selectedId === conv.id && "bg-teal-50 lg:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={conv.avatar} />
                          <AvatarFallback>{conv.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 truncate">{conv.name}</p>
                          <span className="text-xs text-gray-500">{conv.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-0.5">{conv.lastMessage}</p>
                      </div>
                      {conv.unread > 0 && (
                        <Badge className="bg-teal-600 text-white text-xs">
                          {conv.unread}
                        </Badge>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* CHAT ABERTO (apenas desktop ou mobile em página separada) */}
          {showChat && (
            <div className="hidden lg:block lg:col-span-2 bg-white rounded-r-lg shadow-sm h-screen">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conversations.find(c => c.id === selectedId)?.avatar} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{conversations.find(c => c.id === selectedId)?.name}</p>
                    <p className="text-xs text-green-600">Online</p>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p>Seleciona uma conversa para ver as mensagens</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PLACEHOLDER MOBILE (quando não tem chat aberto) */}
          {!showChat && (
            <div className="hidden lg:flex lg:col-span-2 items-center justify-center h-screen bg-white rounded-r-lg shadow-sm">
              <div className="text-center text-gray-500">
                <MessageCircle className="h-20 w-20 mx-auto mb-6 text-gray-300" />
                <p className="text-lg">Seleciona uma conversa para começar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
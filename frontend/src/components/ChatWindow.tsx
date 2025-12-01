// src/components/ChatWindow.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Paperclip, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'other';
  time: string;
  date: string;
}

const conversations = {
  1: { name: 'Ana Silva', avatar: 'https://i.pravatar.cc/150?img=1', online: true },
  2: { name: 'João Mendes', avatar: 'https://i.pravatar.cc/150?img=3', online: false },
  3: { name: 'Maria Costa', avatar: 'https://i.pravatar.cc/150?img=5', online: true },
  4: { name: 'Pedro Almeida', avatar: 'https://i.pravatar.cc/150?img=7', online: false },
};

const mockMessages: Record<number, Message[]> = {
  1: [
   { id: 1, text: 'Olá! Ainda tens o vestido disponível?', sender: 'other', time: '14:32', date: 'Hoje' },
    { id: 2, text: 'Sim, ainda está disponível! Tamanho M, como novo', sender: 'me', time: '14:35', date: 'Hoje' },
    { id: 3, text: 'Perfeito! Pode ser amanhã às 18h em Lisboa?', sender: 'other', time: '14:36', date: 'Hoje' },
  ],
  2: [
    { id: 1, text: 'Boa tarde! Aceitas €180 pelo iPhone?', sender: 'other', time: '12:15', date: 'Hoje' },
    { id: 2, text: 'O preço é firme, €220. Está impecável', sender: 'me', time: '12:20', date: 'Hoje' },
  ],
};

export default function ChatWindow({ userId }: { userId: number }) {
  const [messages, setMessages] = useState<Message[]>(mockMessages[userId] || []);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const user = conversations[userId as keyof typeof conversations] || { name: 'Usuário', avatar: '', online: false };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMsg: Message = {
      id: messages.length + 1,
      text: input,
      sender: 'me',
      time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      date: 'Hoje',
    };

    setMessages([...messages, newMsg]);
    setInput('');

    // Simula resposta automática após 2 segundos
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: 'Obrigado! Pode ser',
        sender: 'other',
        time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
        date: 'Hoje',
      }]);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen lg:h-[calc(100vh-64px)] bg-white">
      {/* HEADER DO CHAT */}
      <div className="sticky top-0 z-10 bg-white border-b flex items-center gap-3 p-4">
        <Link href="/mensagens" className="lg:hidden">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>

        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <p className="font-semibold text-base">{user.name}</p>
          <p className="text-xs text-gray-500">
            {user.online ? 
              <span className="text-green-600">Online</span> : 
              'Visto pela última vez hoje'
            }
          </p>
        </div>
      </div>

      {/* MENSAGENS */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.sender === 'me'
                    ? 'bg-teal-600 text-white rounded-tr-none'
                    : 'bg-gray-100 text-gray-900 rounded-tl-none'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-teal-100' : 'text-gray-500'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div ref={scrollRef} />
      </ScrollArea>

      {/* INPUT DE ENVIO */}
      <div className="border-t bg-white p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="h-5 w-5 text-gray-500" />
          </Button>

          <Input
            placeholder="Escreve uma mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
            className="flex-1 h-12 rounded-full"
          />

          <Button
            size="icon"
            className="rounded-full bg-teal-600 hover:bg-teal-700 shrink-0"
            onClick={sendMessage}
            disabled={!input.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
// src/app/mensagens/[id]/page.tsx
import Header from '@/components/shop/Header/Header';
import ChatWindow from '@/components/ChatWindow';
import { notFound } from 'next/navigation';

// Next.js 15+ → params é uma Promise
interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Chat - Kitroca',
};

/**
 * Página de chat individual
 * Rota: /mensagens/[id]
 */
export default async function ChatPage({ params }: PageProps) {
  // Aguarda o parâmetro dinâmico (obrigatório no Next.js 15)
  const { id } = await params;

  // Validação simples do ID
  const userId = Number(id);
  if (isNaN(userId) || userId <= 0) {
    notFound(); // 404 se o ID for inválido
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
        <ChatWindow userId={userId} />
      </main>
    </>
  );
}
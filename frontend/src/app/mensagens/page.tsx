// src/app/mensagens/page.tsx
import Header from '@/components/shop/Header/Header';
import MessageList from '@/components/MessageList';

export const metadata = {
  title: 'Mensagens - Kitroca',
};

export default function MessagesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <h1 className="text-2xl font-semibold mb-6">Mensagens</h1>
          <MessageList />
        </div>
      </main>
    </>
  );
}
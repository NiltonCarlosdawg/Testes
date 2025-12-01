'use client';

import { useGetLojaById } from '@/lib/queries/useLoja';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconEdit } from '@tabler/icons-react';
import Link from 'next/link';
import Image from 'next/image';

interface StoreViewPageProps {
  storeId: string;
}

export default function StoreViewPage({ storeId }: StoreViewPageProps) {
  const { data: store, isLoading } = useGetLojaById(storeId);

  if (isLoading) return <div>Carregando...</div>;
  if (!store) return <div>Loja não encontrada.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{store.nome}</h1>
          <Badge className="mt-2" variant={store.status === 'aprovado' ? 'default' : store.status === 'rejeitado' ? 'destructive' : 'secondary'}>
            {store.status}
          </Badge>
        </div>
        <Button asChild>
          <Link href={`/dashboard/store/${storeId}/edit`}>
            <IconEdit className="mr-2 h-4 w-4" /> Editar
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Informações</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Email:</strong> {store.emailComercial || '—'}</p>
            <p><strong>Telefone:</strong> {store.telefoneComercial || '—'}</p>
            <p><strong>Descrição:</strong> {store.descricao || '—'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Endereço Comercial</CardTitle></CardHeader>
          <CardContent>
            {store.enderecoComercial ? (
              <div className="space-y-1 text-sm">
                <p>{store.enderecoComercial.rua}, {store.enderecoComercial.numero}</p>
                <p>{store.enderecoComercial.bairro} — {store.enderecoComercial.cidade}/{store.enderecoComercial.estado}</p>
                <p>CEP: {store.enderecoComercial.cep}</p>
                {store.enderecoComercial.complemento && <p>{store.enderecoComercial.complemento}</p>}
              </div>
            ) : (
              <p className="text-muted-foreground">Não informado</p>
            )}
          </CardContent>
        </Card>
      </div>

      {(store.logoUrl || store.bannerUrl) && (
        <Card>
          <CardHeader><CardTitle>Imagens</CardTitle></CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            {store.logoUrl && <Image src={store.logoUrl} alt="Logo" className="h-32 rounded-lg object-cover" />}
            {store.bannerUrl && <Image src={store.bannerUrl} alt="Banner" className="h-32 w-full max-w-md rounded-lg object-cover" />}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
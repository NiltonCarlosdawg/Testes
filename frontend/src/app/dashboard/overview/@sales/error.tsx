'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { IconAlertCircle } from '@tabler/icons-react';

export default function SalesError({ error }: { error: Error }) {
  return (
    <Alert variant='destructive'>
      <IconAlertCircle className='h-4 w-4' />
      <AlertTitle>Erro</AlertTitle>
      <AlertDescription>
        Falha ao carregar dados de venda: {error.message}
      </AlertDescription>
    </Alert>
  );
}

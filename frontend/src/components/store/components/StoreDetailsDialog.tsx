// features/stores/components/StoreDetailsDialog.tsx
'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loja } from '@/lib/queries/loja.api';
import {
  useGetDashboardStats,
  useGetMonthlyRevenue,
  useGetRecentOrders,
} from '@/app/dashboard/store/api/hooks';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';

// Importar o StoreAdminPage dinamicamente SEM SSR
const StoreAdminPage = dynamic(
  () => import('./StoreAdminPage'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <ArrowPathIcon className="w-8 h-8 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    )
  }
);

interface StoreDetailsDialogProps {
  store: Loja | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StoreDetailsDialog({ store, open, onOpenChange }: StoreDetailsDialogProps) {
  const lojaId = store?.id;
  const { data: stats, isLoading: isLoadingStats } = useGetDashboardStats(lojaId);
  const { data: monthlyRevenue, isLoading: isLoadingRevenue } = useGetMonthlyRevenue(lojaId);
  const { data: recentOrders, isLoading: isLoadingOrders } = useGetRecentOrders(lojaId);
  const isLoading = !!lojaId && (isLoadingStats || isLoadingRevenue || isLoadingOrders);

  if (!store) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[98vw] !h-[98vh] !max-w-none !max-h-none !p-0 rounded-lg">
        <div className="h-full flex flex-col overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b shrink-0 bg-background">
            <DialogTitle>Detalhes da Loja: {store.nome}</DialogTitle>
            <DialogDescription>
              Visualize as informações completas e estatísticas da loja
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <ArrowPathIcon className="w-8 h-8 animate-spin" />
                <span className="ml-2">A carregar dados da loja...</span>
              </div>
            ) : stats && monthlyRevenue && recentOrders ? (
              <StoreAdminPage
                store={store}
                stats={stats}
                monthlyRevenue={monthlyRevenue}
                recentOrders={recentOrders}
              />
            ) : (
              <div className="py-10 text-center text-muted-foreground">
                Não foi possível carregar os dados da loja.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
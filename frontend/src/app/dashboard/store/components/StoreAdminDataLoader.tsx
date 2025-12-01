"use client";

import {
  useGetLojasByDono,
  useGetDashboardStats,
  useGetMonthlyRevenue,
  useGetRecentOrders,
} from "../api/hooks";
import { ArrowPathIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import StoreAdminPage from "./StoreAdminPage";

const DONO_ID = "019a5b70-461a-7527-903e-bf7ff84d688c";

export default function StoreAdminDataLoader() {
  const {
    data: lojas,
    isLoading: isLoadingLoja,
    isError: isErrorLoja,
  } = useGetLojasByDono(DONO_ID);
  const store = lojas?.[0];
  const lojaId = store?.id;

  const { data: stats, isLoading: isLoadingStats } =
    useGetDashboardStats(lojaId);
  const { data: monthlyRevenue, isLoading: isLoadingRevenue } =
    useGetMonthlyRevenue(lojaId);
  const { data: recentOrders, isLoading: isLoadingOrders } =
    useGetRecentOrders(lojaId);

  const isLoading =
    isLoadingLoja ||
    (!!lojaId && (isLoadingStats || isLoadingRevenue || isLoadingOrders));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <ArrowPathIcon className="w-8 h-8 animate-spin" />
        <span className="ml-2">A carregar dados da loja...</span>
      </div>
    );
  }

  if (isErrorLoja) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-red-500">
        <ExclamationCircleIcon className="w-8 h-8" />
        <span className="ml-2">Erro ao carregar a loja.</span>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <ExclamationCircleIcon className="w-8 h-8" />
        <span className="ml-2">Nenhuma loja encontrada para este usuário.</span>
      </div>
    );
  }

  if (!stats || !monthlyRevenue || !recentOrders) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <ArrowPathIcon className="w-8 h-8 animate-spin" />
        <span className="ml-2">A carregar dados do dashboard...</span>
      </div>
    );
  }

  return (
    <StoreAdminPage
      store={store}
      stats={stats}
      monthlyRevenue={monthlyRevenue}
      recentOrders={recentOrders}
    />
  );
}
import { useQuery } from "@tanstack/react-query";
import {
  getLojasByDono,
  getDashboardStats,
  getMonthlyRevenue,
  getRecentOrders,
} from "./api";

export const useGetLojasByDono = (donoId: string) => {
  return useQuery({
    queryKey: ["lojaByDono", donoId],
    queryFn: () => getLojasByDono(donoId),
    enabled: !!donoId,
  });
};

export const useGetDashboardStats = (lojaId?: string) => {
  return useQuery({
    queryKey: ["dashboardStats", lojaId],
    queryFn: () => getDashboardStats(lojaId!),
    enabled: !!lojaId,
  });
};

export const useGetMonthlyRevenue = (lojaId?: string) => {
  return useQuery({
    queryKey: ["monthlyRevenue", lojaId],
    queryFn: () => getMonthlyRevenue(lojaId!),
    enabled: !!lojaId,
  });
};

export const useGetRecentOrders = (lojaId?: string) => {
  return useQuery({
    queryKey: ["recentOrders", lojaId],
    queryFn: () => getRecentOrders(lojaId!),
    enabled: !!lojaId,
  });
};
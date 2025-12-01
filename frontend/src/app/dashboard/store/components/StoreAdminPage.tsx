"use client";

import { useMemo, useState, FC, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  BuildingStorefrontIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PencilSquareIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  CheckIcon,
  IdentificationIcon,
  ClockIcon,
  XMarkIcon,
  TrashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLoja, deleteLoja } from "../api/api";
import Image from "next/image";

import {
  TLojaResponse,
  TDashboardStats,
  TMonthlyRevenue,
  TPedidoResponse,
} from "../api/types";
import { formatCurrency, formatDate } from "../api/utils";
import {
  StatusLojaBadge,
  StatusPagamentoBadge,
  StatusPedidoBadge,
} from "./StatusBadges";
import InfoBlock from "./InfoBlock";

interface StoreAdminPageProps {
  store: TLojaResponse;
  stats: TDashboardStats;
  monthlyRevenue: TMonthlyRevenue[];
  recentOrders: TPedidoResponse[];
}

const StoreAdminPage: FC<StoreAdminPageProps> = ({
  store,
  stats,
  monthlyRevenue,
  recentOrders,
}) => {
  const [formData, setFormData] = useState<TLojaResponse>(store);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartTheme, setChartTheme] = useState<"light" | "dark">("light");
  const queryClient = useQueryClient();

  // --- MUTATIONS ---
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: Partial<TLojaResponse>;
    }) => updateLoja(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lojaByDono", store.donoId],
      });
      handleCloseModal();
    },
    onError: () => {
      // O handleApiError na função api.ts já trata o toast
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLoja(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lojaByDono", store.donoId],
      });
      handleCloseModal();
      // TODO: Redirecionar o usuário para outra página, ex: /dashboard
    },
    onError: () => {
      // O handleApiError na função api.ts já trata o toast
    },
  });

  // Hook do Gráfico
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setChartTheme(isDark ? "dark" : "light");
    };
    checkTheme();
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          checkTheme();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // Handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      enderecoComercial: {
        rua: prev.enderecoComercial?.rua || "",
        bairro: prev.enderecoComercial?.bairro || "",
        cidade: prev.enderecoComercial?.cidade || "",
        estado: prev.enderecoComercial?.estado || "",
        cep: prev.enderecoComercial?.cep || "",
        ...prev.enderecoComercial,
        [name]: value,
      },
    }));
  };
  const handleOpenModal = () => {
    setFormData(store);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ id: formData.id, values: formData });
  };

  const handleDeleteStore = () => {
    if (
      window.confirm(
        `Tem a certeza que quer apagar a loja "${formData.nome}"? Esta ação é irreversível.`
      )
    ) {
      deleteMutation.mutate(formData.id);
    }
  };

  // Configuração do Gráfico
  const chartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        id: "store-sales-activity",
        height: 350,
        type: "area",
        toolbar: { show: false },
        fontFamily: "Inter, sans-serif",
      },
      xaxis: {
        categories: monthlyRevenue.map((s) => s.mes),
        labels: {
          style: {
            colors: chartTheme === "dark" ? "#9CA3AF" : "#6B7280",
            fontSize: "12px",
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: {
            colors: chartTheme === "dark" ? "#9CA3AF" : "#6B7280",
            fontSize: "12px",
          },
          formatter: (value) => `${(value / 1000).toFixed(0)}k`,
        },
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.1,
          stops: [0, 90, 100],
        },
      },
      dataLabels: { enabled: false },
      tooltip: {
        theme: chartTheme,
        x: { format: "MMM" },
        y: {
          formatter: (value) => formatCurrency(value),
          title: {
            formatter: () => "Faturamento (AOA)",
          },
        },
      },
      grid: {
        borderColor: chartTheme === "dark" ? "#374151" : "#E5E7EB",
        strokeDashArray: 4,
      },
      colors: ["#3B82F6"],
    }),
    [monthlyRevenue, chartTheme]
  );
  const chartSeries = useMemo(
    () => [
      {
        name: "Faturamento (AOA)",
        data: monthlyRevenue.map((s) => s.faturamento),
      },
    ],
    [monthlyRevenue]
  );

  return (
    <div className="p-4 md:p-8 bg-background text-foreground min-h-screen font-sans">
      {/* --- Cabeçalho da Página --- */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6 mb-8 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-shrink-0">
          <Image
            src={
              store.logoUrl ||
              `https://placehold.co/80x80/3B82F6/FFFFFF?text=${store.nome
                .charAt(0)
                .toUpperCase()}`
            }
            alt={`${store.nome} logo`}
            width={80}
            height={80}
            className="w-20 h-20 rounded-full object-cover border-2 border-border"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://placehold.co/80x80/3B82F6/FFFFFF?text=${store.nome
                  .charAt(0)
                  .toUpperCase()}`;
            }}
          />
        </div>
        <div className="flex-grow text-center sm:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {store.nome}
          </h1>
          <p className="text-sm text-muted-foreground">
            <StatusLojaBadge status={store.status} />
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Membro desde: {formatDate(store.createdAt)}
          </p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <PencilSquareIcon className="w-5 h-5" />
          Editar Loja
        </button>
      </div>

      {/* --- Grelha Principal --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* --- Coluna da Esquerda (Detalhes da Loja) --- */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6 border-b border-border pb-3">
              Detalhes da Loja
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
              <InfoBlock
                icon={BuildingStorefrontIcon}
                label="Nome da Loja"
                value={store.nome}
              />
              <InfoBlock
                icon={IdentificationIcon}
                label="Documento (NIF)"
                value={store.documentoIdentificacao}
              />
              <InfoBlock
                icon={EnvelopeIcon}
                label="Email de Contacto"
                value={store.emailComercial}
              />
              <InfoBlock
                icon={PhoneIcon}
                label="Telefone"
                value={store.telefoneComercial}
              />

              <div className="sm:col-span-2">
                <InfoBlock icon={MapPinIcon} label="Endereço Comercial">
                  {store.enderecoComercial ? (
                    <span className="block">
                      {store.enderecoComercial.rua},{" "}
                      {store.enderecoComercial.numero || "s/n"}
                      <br />
                      {store.enderecoComercial.bairro},{" "}
                      {store.enderecoComercial.cidade}
                      <br />
                      {store.enderecoComercial.estado} -{" "}
                      {store.enderecoComercial.cep}
                    </span>
                  ) : (
                    "N/A"
                  )}
                </InfoBlock>
              </div>
            </div>
          </div>
        </div>

        {/* --- Coluna da Direita (Stats e Gráfico) --- */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                  <CurrencyDollarIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Faturamento Total
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(stats.faturamentoTotal)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                  <ShoppingBagIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total de Pedidos
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.totalPedidos}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-500">
                  <ClockIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pedidos Pendentes
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.pedidosPendentes}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Actividade de Vendas (Últimos 12 Meses)
            </h2>
            <div className="w-full">
              <ReactApexChart
                options={chartOptions}
                series={chartSeries}
                type="area"
                height={350}
              />
            </div>
          </div>
        </div>

        {/* --- Linha Inteira (Pedidos Recentes) --- */}
        <div className="lg:col-span-3">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <h2 className="text-xl font-semibold text-foreground p-6">
              Pedidos Recentes
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-medium">
                      Nº Pedido
                    </th>
                    <th scope="col" className="px-6 py-3 font-medium">
                      Comprador
                    </th>
                    <th scope="col" className="px-6 py-3 font-medium">
                      Data
                    </th>
                    <th scope="col" className="px-6 py-3 font-medium">
                      Status Pedido
                    </th>
                    <th scope="col" className="px-6 py-3 font-medium">
                      Status Pag.
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 font-medium text-right"
                    >
                      Valor Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-primary">
                          {order.numeroPedido}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-foreground">
                          {order.compradorId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusPedidoBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusPagamentoBadge status={order.statusPagamento} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-foreground">
                          {formatCurrency(order.total)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-10 px-6 text-muted-foreground"
                      >
                        Nenhum pedido recente encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* --- Modal de Edição --- */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-md" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-card border border-border p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-foreground flex justify-between items-center"
                  >
                    Editar Loja
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="p-1 rounded-full text-muted-foreground hover:bg-muted/50"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </Dialog.Title>

                  <form onSubmit={handleSaveChanges} className="mt-4">
                    <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
                      <div>
                        <label
                          htmlFor="nome"
                          className="block text-sm font-medium text-foreground mb-1"
                        >
                          Nome da Loja
                        </label>
                        <input
                          type="text"
                          id="nome"
                          name="nome"
                          value={formData.nome}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-input bg-background rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="documentoIdentificacao"
                          className="block text-sm font-medium text-foreground mb-1"
                        >
                          Documento (NIF)
                        </label>
                        <input
                          type="text"
                          id="documentoIdentificacao"
                          name="documentoIdentificacao"
                          value={formData.documentoIdentificacao || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-input bg-background rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="emailComercial"
                          className="block text-sm font-medium text-foreground mb-1"
                        >
                          Email de Contacto
                        </label>
                        <input
                          type="email"
                          id="emailComercial"
                          name="emailComercial"
                          value={formData.emailComercial || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-input bg-background rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="telefoneComercial"
                          className="block text-sm font-medium text-foreground mb-1"
                        >
                          Telefone
                        </label>
                        <input
                          type="tel"
                          id="telefoneComercial"
                          name="telefoneComercial"
                          value={formData.telefoneComercial || ""}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-input bg-background rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                        />
                      </div>

                      <div className="space-y-3 pt-2">
                        <label className="block text-sm font-medium text-foreground">
                          Endereço Comercial
                        </label>
                        <input
                          type="text"
                          name="rua"
                          placeholder="Rua"
                          value={formData.enderecoComercial?.rua || ""}
                          onChange={handleAddressChange}
                          className="w-full px-3 py-2 border border-input bg-background rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            name="numero"
                            placeholder="Nº"
                            value={formData.enderecoComercial?.numero || ""}
                            onChange={handleAddressChange}
                            className="w-full px-3 py-2 border border-input bg-background rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                          />
                          <input
                            type="text"
                            name="cep"
                            placeholder="CEP (Cód. Postal)"
                            value={formData.enderecoComercial?.cep || ""}
                            onChange={handleAddressChange}
                            className="w-full px-3 py-2 border border-input bg-background rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                          />
                        </div>
                        <input
                          type="text"
                          name="bairro"
                          placeholder="Bairro"
                          value={formData.enderecoComercial?.bairro || ""}
                          onChange={handleAddressChange}
                          className="w-full px-3 py-2 border border-input bg-background rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                        />
                        <input
                          type="text"
                          name="cidade"
                          placeholder="Cidade"
                          value={formData.enderecoComercial?.cidade || ""}
                          onChange={handleAddressChange}
                          className="w-full px-3 py-2 border border-input bg-background rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                        />
                        <input
                          type="text"
                          name="estado"
                          placeholder="Província / Estado"
                          value={formData.enderecoComercial?.estado || ""}
                          onChange={handleAddressChange}
                          className="w-full px-3 py-2 border border-input bg-background rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-between items-center border-t border-border pt-4">
                      <button
                        type="button"
                        onClick={handleDeleteStore}
                        disabled={
                          deleteMutation.isPending || updateMutation.isPending
                        }
                        className="flex items-center justify-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleteMutation.isPending ? (
                          <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        ) : (
                          <TrashIcon className="w-5 h-5" />
                        )}
                        Apagar Loja
                      </button>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleCloseModal}
                          disabled={
                            deleteMutation.isPending || updateMutation.isPending
                          }
                          className="flex items-center justify-center gap-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={
                            deleteMutation.isPending || updateMutation.isPending
                          }
                          className="flex items-center justify-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          {updateMutation.isPending ? (
                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                          ) : (
                            <CheckIcon className="w-5 h-5" />
                          )}
                          Salvar Alterações
                        </button>
                      </div>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default StoreAdminPage;
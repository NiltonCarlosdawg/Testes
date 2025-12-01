"use client";

import { FC } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  TruckIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";
import { StatusLoja } from "@/lib/queries/loja.api";
import { StatusPagamento, StatusPedido } from "@/types/pedidos.types";

export const StatusLojaBadge: FC<{ status: StatusLoja }> = ({ status }) => {
  const baseClasses =
    "px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5";
  let specificClasses = "";
  let Icon = ExclamationCircleIcon;

  switch (status) {
    case StatusLoja.ATIVA:
      specificClasses =
        "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300";
      Icon = CheckCircleIcon;
      break;
    case StatusLoja.PENDENTE:
      specificClasses =
        "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300";
      Icon = ClockIcon;
      break;
    case StatusLoja.SUSPENSA:
      specificClasses =
        "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300";
      Icon = ExclamationCircleIcon;
      break;
    case StatusLoja.INATIVA:
      specificClasses =
        "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
      Icon = XMarkIcon;
      break;
    default:
      specificClasses =
        "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
  }

  return (
    <span className={`${baseClasses} ${specificClasses}`}>
      <Icon className="w-4 h-4" /> {status}
    </span>
  );
};

export const StatusPedidoBadge: FC<{ status: StatusPedido }> = ({ status }) => {
  const baseClasses =
    "px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5";
  let specificClasses = "";
  let Icon = ExclamationCircleIcon;

  switch (status) {
    case StatusPedido.PENDENTE:
      specificClasses =
        "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300";
      Icon = ClockIcon;
      break;
    case StatusPedido.CONFIRMADO:
      specificClasses =
        "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300";
      Icon = CheckCircleIcon;
      break;
    case StatusPedido.EM_PREPARACAO:
      specificClasses =
        "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300";
      Icon = ArrowPathIcon;
      break;
    case StatusPedido.ENVIADO:
      specificClasses =
        "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300";
      Icon = TruckIcon;
      break;
    case StatusPedido.ENTREGUE:
      specificClasses =
        "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300";
      Icon = CheckCircleIcon;
      break;
    case StatusPedido.CANCELADO:
      specificClasses =
        "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300";
      Icon = XMarkIcon;
      break;
    default:
      specificClasses =
        "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
  }

  return (
    <span className={`${baseClasses} ${specificClasses}`}>
      <Icon className="w-4 h-4" /> {status}
    </span>
  );
};

export const StatusPagamentoBadge: FC<{ status: StatusPagamento }> = ({
  status,
}) => {
  const baseClasses =
    "px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5";
  let specificClasses = "";
  let Icon = ExclamationCircleIcon;

  switch (status) {
    case StatusPagamento.PAGO:
      specificClasses =
        "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300";
      Icon = CheckCircleIcon;
      break;
    case StatusPagamento.PENDENTE:
      specificClasses =
        "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300";
      Icon = ClockIcon;
      break;
    case StatusPagamento.FALHADO:
      specificClasses =
        "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300";
      Icon = ExclamationCircleIcon;
      break;
    case StatusPagamento.REEMBOLSADO:
      specificClasses =
        "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300";
      Icon = ArrowUturnLeftIcon;
      break;
    default:
      specificClasses =
        "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300";
  }

  return (
    <span className={`${baseClasses} ${specificClasses}`}>
      <Icon className="w-4 h-4" /> {status}
    </span>
  );
};
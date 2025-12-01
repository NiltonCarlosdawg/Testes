import { Loja } from "@/lib/queries/loja.api";
import { MapPin,CheckCircle } from "lucide-react";
import Image from "next/image";

interface StoreProfileProps {
  loja: Loja;
  totalItems: number;
}

export default function StoreProfile({ loja, totalItems }: StoreProfileProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
      <div className="flex items-start gap-8">
        {/* Logo */}
        <div className="relative w-40 h-40 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md">
          {loja.logoUrl ? (
            <Image
              src={loja.logoUrl}
              alt={loja.nome}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-4xl font-bold text-gray-400">
              {loja.nome.charAt(0)}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {loja.nome}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <span className="text-gray-600">0 avaliações</span>
              </div>
            </div>
            <button className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">
              Seguir
            </button>
          </div>

          {loja.descricao && (
            <p className="text-gray-700 mb-6 max-w-3xl">{loja.descricao}</p>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Localização</h3>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>
                  {loja.enderecoComercial?.cidade || "Não informado"}, {loja.enderecoComercial?.estado || ""}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Itens à venda</h3>
              <p className="text-gray-600">{totalItems} produtos</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  loja.status === "aprovado" || loja.status === "ativa"
                    ? "bg-green-100 text-green-800"
                    : loja.status === "pendente"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {loja.status.charAt(0).toUpperCase() + loja.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Verificados */}
          {(loja.emailComercial || loja.telefoneComercial) && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Informações verificadas:</h3>
              <div className="flex gap-4 text-sm">
                {loja.emailComercial && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-teal-600" />
                    <span>Email</span>
                  </div>
                )}
                {loja.telefoneComercial && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-teal-600" />
                    <span>Telefone</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
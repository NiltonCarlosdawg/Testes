'use client';

import React, { useState, useMemo, FC, useEffect } from 'react';
import { ChevronDown, X, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDebounce } from 'use-debounce';

import { useGetProducts, useGetFilterOptions } from '@/lib/queries/product'; 

import ProductCard from '@/components/shop/ProductCard'; 

import { Product } from '@/types/product';
import { useSearchParams } from 'next/navigation';

type TActiveFilters = {
  categories: string[];
  brands: string[];
  conditions: string[];
  colors: string[];
  sizes: string[];
  price: { min?: number; max?: number };
  sortBy: string;
};

// Opções de ordenação
const sortOptions = [
  { id: 'newest', label: 'Mais recentes' },
  { id: 'price-low-high', label: 'Preço: Baixo para Alto' },
  { id: 'price-high-low', label: 'Preço: Alto para Baixo' },
  { id: 'popular', label: 'Mais populares' },
];

const MarketplacePage: FC = () => {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  const [darkMode, setDarkMode] = useState(false);
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  // Paginação
  const [page, setPage] = useState(1);

  // Filtros
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  
  const [activeFilters, setActiveFilters] = useState<TActiveFilters>({
    categories: [],
    brands: [],
    conditions: [],
    colors: [],
    sizes: [],
    price: { min: undefined, max: undefined },
    sortBy: 'newest',
  });

  const [localPrice, setLocalPrice] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true' ||
                   (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    if (urlSearch) {
      setSearchTerm(urlSearch);
      setPage(1); 
    }
  }, [urlSearch]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const { 
    data: filterOptionsData, 
    isLoading: isLoadingFilters,
  } = useGetFilterOptions();

  const { 
    data: productsData, 
    isLoading: isLoadingProducts, 
    isError: isErrorProducts 
  } = useGetProducts({
    page,
    limit: 12, 
    search: debouncedSearchTerm,
    categories: activeFilters.categories,
    brands: activeFilters.brands,
    colors: activeFilters.colors,
    sizes: activeFilters.sizes,
    conditions: activeFilters.conditions,
    priceMin: activeFilters.price.min,
    priceMax: activeFilters.price.max,
    sortBy: activeFilters.sortBy,
  });

  const products = useMemo(() => productsData?.data || [], [productsData]);
  const pagination = useMemo(() => productsData?.pagination, [productsData]);

  const defaultPriceRange = useMemo(() => ({
    min: filterOptionsData?.priceRange.min ?? 0,
    max: filterOptionsData?.priceRange.max ?? 1000,
  }), [filterOptionsData]);

  useEffect(() => {
    setLocalPrice(defaultPriceRange);
  }, [defaultPriceRange]);

  // Configuração dinâmica dos botões de filtro
  const filterConfig = useMemo(() => [
    { key: 'categories', title: 'Categoria', options: filterOptionsData?.categories.map(c => ({ id: c.id, label: c.nome })) || [] },
    { key: 'brands', title: 'Marca', options: filterOptionsData?.brands.map(b => ({ id: b, label: b })) || [] },
    { key: 'conditions', title: 'Condição', options: filterOptionsData?.conditions.map(c => ({ id: c, label: c })) || [] },
    { key: 'colors', title: 'Cor', options: filterOptionsData?.colors.map(c => ({ id: c, label: c })) || [] },
    { key: 'sizes', title: 'Tamanho', options: filterOptionsData?.sizes.map(s => ({ id: s, label: s })) || [] },
  ], [filterOptionsData]);

  // --- HANDLERS (Manipuladores de Eventos) ---

  // Alterna um filtro (checkbox)
  const toggleFilter = (filterType: keyof Omit<TActiveFilters, 'price' | 'sortBy'>, value: string) => {
    setActiveFilters(prev => {
      const current = prev[filterType] as string[];
      const newFilters = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [filterType]: newFilters };
    });
    setPage(1); // Reseta para a página 1 ao aplicar filtro
  };

  // Aplica o filtro de preço
  const applyPriceRange = () => {
    setActiveFilters(prev => ({ ...prev, price: localPrice }));
    setPage(1);
    setOpenFilter(null);
  };

  // Limpa um filtro de preço
  const clearPriceFilter = () => {
    setActiveFilters(prev => ({ ...prev, price: { min: undefined, max: undefined } }));
    setLocalPrice(defaultPriceRange); // Reseta o popover
    setPage(1);
  };

  // Limpa todos os filtros
  const clearAllFilters = () => {
    setActiveFilters({
      categories: [], brands: [], conditions: [], colors: [], sizes: [],
      price: { min: undefined, max: undefined },
      sortBy: 'newest',
    });
    setSearchTerm("");
    setLocalPrice(defaultPriceRange);
    setPage(1);
  };

  // Calcula contagem de filtros ativos (para o badge)
  const getActiveFilterCount = () => {
    let count = 0;
    count += activeFilters.categories.length;
    count += activeFilters.brands.length;
    count += activeFilters.conditions.length;
    count += activeFilters.colors.length;
    count += activeFilters.sizes.length;
    if (activeFilters.price.min !== undefined || activeFilters.price.max !== undefined) {
      count++;
    }
    return count;
  };
  const activeFilterCount = getActiveFilterCount();

  // --- SUB-COMPONENTES (Renderização) ---

  /**
   * Popover de Filtro (renderiza checkboxes ou range de preço)
   */
  const FilterPopover: FC<{ filterKey: string }> = ({ filterKey }) => {
    
    if (filterKey === 'price') {
      return (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 w-80 z-50">
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Preço</h3>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 dark:text-gray-400">Min</label>
                <input
                  type="number"
                  value={localPrice.min}
                  min={defaultPriceRange.min}
                  max={localPrice.max}
                  onChange={(e) => setLocalPrice(p => ({ ...p, min: Number(e.target.value) }))}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <span className="mt-4 text-gray-400">-</span>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 dark:text-gray-400">Max</label>
                <input
                  type="number"
                  value={localPrice.max}
                  min={localPrice.min}
                  max={defaultPriceRange.max}
                  onChange={(e) => setLocalPrice(p => ({ ...p, max: Number(e.target.value) }))}
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <button
              onClick={applyPriceRange}
              className="w-full mt-6 bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700"
            >
              Aplicar Preço
            </button>
          </div>
        </div>
      );
    }
    
    // Tipo Checkbox
    const config = filterConfig.find(f => f.key === filterKey);
    if (!config) return null;

    return (
      <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 w-96 max-h-96 overflow-y-auto z-50">
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">{config.title}</h3>
          <div className="space-y-2">
            {config.options.map(option => (
              <label key={option.id} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                <div className="font-medium text-gray-800 dark:text-gray-200 capitalize">{option.label}</div>
                <input
                  type="checkbox"
                  checked={(activeFilters[filterKey as keyof Omit<TActiveFilters, 'price' | 'sortBy'>] as string[]).includes(option.id)}
                  onChange={() => toggleFilter(filterKey as any, option.id)}
                  className="w-5 h-5 text-teal-600 focus:ring-teal-500"
                />
              </label>
            ))}
          </div>
          <button
            onClick={() => setOpenFilter(null)}
            className="w-full mt-4 bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700"
          >
            Mostrar resultados
          </button>
        </div>
      </div>
    );
  };

  // --- RENDERIZAÇÃO PRINCIPAL ---

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <div className="max-w-7xl mx-auto p-6">
          
          {/* Header e Dark Mode Toggle */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                <span className="hover:underline cursor-pointer">Home</span>
                <span className="mx-2">/</span>
                <span className="hover:underline cursor-pointer">Loja</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Itens da Loja</h1>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por itens, marcas..."
              className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-teal-500 focus:border-teal-500"
            />
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {/* Botões Dinâmicos */}
            {filterConfig.map(({ key, title, options }) => (
              <div key={key} className="relative">
                <button
                  onClick={() => setOpenFilter(openFilter === key ? null : key)}
                  disabled={isLoadingFilters || options.length === 0}
                  className={`px-4 py-2 border rounded-full text-sm flex items-center gap-2
                    ${openFilter === key 
                      ? 'border-teal-600 bg-teal-50 dark:bg-teal-900 text-teal-700 dark:text-teal-200' 
                      : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {title}
                  {isLoadingFilters && <Loader2 className="w-4 h-4 animate-spin" />}
                  {!isLoadingFilters && <ChevronDown className={`w-4 h-4 transition-transform ${openFilter === key ? 'rotate-180' : ''}`} />}
                </button>
                {openFilter === key && <FilterPopover filterKey={key} />}
              </div>
            ))}
            
            {/* Botão de Preço (Manual) */}
            <div className="relative">
              <button
                onClick={() => setOpenFilter(openFilter === 'price' ? null : 'price')}
                disabled={isLoadingFilters}
                className={`px-4 py-2 border rounded-full text-sm flex items-center gap-2
                  ${openFilter === 'price' 
                    ? 'border-teal-600 bg-teal-50 dark:bg-teal-900 text-teal-700 dark:text-teal-200' 
                    : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}
                  disabled:opacity-50
                `}
              >
                Preço
                {isLoadingFilters && <Loader2 className="w-4 h-4 animate-spin" />}
                {!isLoadingFilters && <ChevronDown className={`w-4 h-4 transition-transform ${openFilter === 'price' ? 'rotate-180' : ''}`} />}
              </button>
              {openFilter === 'price' && <FilterPopover filterKey="price" />}
            </div>

            {/* Select de Ordenação (Manual) */}
            <select
              value={activeFilters.sortBy}
              onChange={(e) => {
                setActiveFilters(prev => ({ ...prev, sortBy: e.target.value }));
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full text-sm bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {sortOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-wrap gap-2">
                {/* Filtros de Array */}
                {Object.entries(activeFilters).map(([filterType, values]) => {
                  if (Array.isArray(values)) {
                    return values.map(value => {
                      // Tenta encontrar o label
                      const config = filterConfig.find(f => f.key === filterType);
                      const label = config?.options.find(o => o.id === value)?.label || value;
                      return (
                        <div key={`${filterType}-${value}`} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm flex items-center gap-2 capitalize">
                          {label}
                          <X
                            className="w-4 h-4 cursor-pointer"
                            onClick={() => toggleFilter(filterType as any, value)}
                          />
                        </div>
                      )
                    });
                  }
                  return null;
                })}
                {/* Filtro de Preço */}
                {(activeFilters.price.min !== undefined || activeFilters.price.max !== undefined) && (
                  <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm flex items-center gap-2">
                    Preço: R${activeFilters.price.min ?? '0'} - R${activeFilters.price.max ?? '...'}
                    <X className="w-4 h-4 cursor-pointer" onClick={clearPriceFilter} />
                  </div>
                )}
              </div>
              <button onClick={clearAllFilters} className="text-teal-600 dark:text-teal-400 text-sm font-medium hover:underline">
                Limpar filtros
              </button>
            </div>
          )}

          {/* Results Grid */}
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {isLoadingProducts 
              ? "Buscando produtos..." 
              : `${pagination?.total || 0} resultado(s) econtrados.`
            }
          </p>

          {/* Estado de Carregamento */}
          {isLoadingProducts && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-xl aspect-w-11 aspect-h-12"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mt-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
                </div>
              ))}
            </div>
          )}
          
          {/* Estado de Erro */}
          {isErrorProducts && (
            <div className="text-center py-20 text-red-500">
              <h3 className="text-xl font-semibold">Ocorreu um erro</h3>
              <p>Não foi possível carregar os produtos. Tente novamente mais tarde.</p>
            </div>
          )}

          {/* Estado Vazio (Sem Erro, Sem Loading) */}
          {!isLoadingProducts && !isErrorProducts && products.length === 0 && (
             <div className="text-center py-20">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Nenhum produto encontrado</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Tente ajustar seus filtros ou termo de pesquisa.</p>
            </div>
          )}

          {/* Grid de Produtos (Com Dados) */}
          {!isLoadingProducts && !isErrorProducts && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {products.map((product) => (
                <ProductCard data={product as Product} key={product.id} />
              ))}
            </div>
          )}

          {/* Paginação */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Página {page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-50"
              >
                Próxima
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
'use client'

import { FiltersMenuSidebar } from '@/components/shop/FiltersMenu'
import ProductCard from '@/components/shop/ProductCard'
import { useGetProducts } from '@/lib/queries/product'
import {
  Pagination,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
  PaginationGap,
} from '@/shared/Pagination/Pagination'
import { useSearchParams } from 'next/navigation'

export default function Page() {
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || 1
  const limit = 12 // Produtos por página
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''

  const { data, isLoading, isError } = useGetProducts({page:currentPage, limit, search, categories:[category]})

  const products = data?.data || []
  const pagination = data?.pagination
  // Função para gerar os números das páginas
  const renderPageNumbers = () => {
    if (!pagination) return null

    const { page, totalPages } = pagination
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      // Mostrar todas as páginas se forem poucas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <PaginationPage key={i} href={`?page=${i}`} current={i === page}>
            {i}
          </PaginationPage>
        )
      }
    } else {
      // Lógica para muitas páginas
      pages.push(
        <PaginationPage key={1} href={`?page=1`} current={page === 1}>
          1
        </PaginationPage>
      )

      if (page > 3) {
        pages.push(<PaginationGap key="gap-start" />)
      }

      const startPage = Math.max(2, page - 1)
      const endPage = Math.min(totalPages - 1, page + 1)

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <PaginationPage key={i} href={`?page=${i}`} current={i === page}>
            {i}
          </PaginationPage>
        )
      }

      if (page < totalPages - 2) {
        pages.push(<PaginationGap key="gap-end" />)
      }

      pages.push(
        <PaginationPage key={totalPages} href={`?page=${totalPages}`} current={page === totalPages}>
          {totalPages}
        </PaginationPage>
      )
    }

    return pages
  }

  return (
    <main>
      <div className="flex flex-col lg:flex-row">
        <div className="pr-4 lg:w-1/3 xl:w-1/4">
          <FiltersMenuSidebar />
        </div>
        <div className="mb-10 shrink-0 lg:mx-8 lg:mb-0"></div>
        <div className="flex-1">
          {isLoading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900"></div>
                <p className="mt-4 text-neutral-600 dark:text-neutral-400">Carregando produtos...</p>
              </div>
            </div>
          ) : isError ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400">Erro ao carregar produtos</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-lg bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <p className="text-neutral-600 dark:text-neutral-400">Nenhum produto encontrado</p>
            </div>
          ) : (
            <>
              {/* Info da paginação */}
              {pagination && (
                <div className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
                  Mostrando {products.length} de {pagination.total} produtos
                </div>
              )}

              {/* Grid de produtos */}
              <div className="grid flex-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((item) => (
                  <ProductCard data={item} key={item.id} />
                ))}
              </div>

              {/* Paginação */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-20 flex justify-start lg:mt-24">
                  <Pagination>
                    <PaginationPrevious
                      href={pagination.page > 1 ? `?page=${pagination.page - 1}` : null}
                    />
                    <PaginationList>{renderPageNumbers()}</PaginationList>
                    <PaginationNext
                      href={pagination.page < pagination.totalPages ? `?page=${pagination.page + 1}` : null}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
import PageContainer from '@/components/layout/page-container';

import { buttonVariants } from '@/components/ui/button';

import { Heading } from '@/components/ui/heading';

import { Separator } from '@/components/ui/separator';

import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

import StoreListingPage from '@/components/store/store-listing';

import { cn } from '@/lib/utils';

import { IconPlus } from '@tabler/icons-react';

import Link from 'next/link';

import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: Lojas'
};

export default async function Page() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Lojas'
            description='Gerencie suas lojas e acompanhe o status de aprovação.'
          />

          <Link
            href='/dashboard/store/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <IconPlus className='mr-2 h-4 w-4' /> Nova Loja
          </Link>
        </div>

        <Separator />

        <Suspense
          fallback={
            <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />
          }
        >
          <StoreListingPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
